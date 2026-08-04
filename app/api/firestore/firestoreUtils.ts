import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firestore";
import {
  DeckSummary,
  Flashcard,
  FlashcardsDeck,
  MAX_REVIEW_HISTORY,
  RatingCounts,
  ReviewSession,
  ReviewSessionDraft,
} from "@/types";

function timestampToMillis(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  return null;
}

function normalizeRatingCounts(value: unknown): RatingCounts | null {
  if (!value || typeof value !== "object") return null;

  const counts = value as Record<string, unknown>;
  const normalized = {
    1: counts[1],
    2: counts[2],
    3: counts[3],
    4: counts[4],
  };

  if (
    !Object.values(normalized).every(
      (count) => Number.isInteger(count) && Number(count) >= 0,
    )
  ) {
    return null;
  }

  return normalized as RatingCounts;
}

export function normalizeReviewHistory(value: unknown): ReviewSession[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): ReviewSession | null => {
      if (!entry || typeof entry !== "object") return null;
      const candidate = entry as Record<string, unknown>;
      const completedAt = timestampToMillis(candidate.completedAt);
      const ratingCounts = normalizeRatingCounts(candidate.ratingCounts);

      if (
        typeof candidate.id !== "string" ||
        !candidate.id ||
        completedAt === null ||
        !Number.isInteger(candidate.cardCount) ||
        Number(candidate.cardCount) < 1 ||
        !ratingCounts
      ) {
        return null;
      }

      const cardCount = Number(candidate.cardCount);
      const countTotal = Object.values(ratingCounts).reduce(
        (total, count) => total + count,
        0,
      );
      if (countTotal !== cardCount) return null;

      return {
        id: candidate.id,
        completedAt,
        cardCount,
        ratingCounts,
      };
    })
    .filter((session): session is ReviewSession => session !== null)
    .sort((first, second) => first.completedAt - second.completedAt)
    .slice(-MAX_REVIEW_HISTORY);
}

// Function to save a flashcards set
export async function saveFlashcardsSet(
  userId: string,
  subject: string,
  flashcardsSet: Flashcard[],
): Promise<void> {
  try {
    const flashcardsDocRef = doc(
      db,
      "users",
      userId,
      "flashcards",
      subject,
    );
    const existingDeck = await getDoc(flashcardsDocRef);
    const existingCreatedAt = existingDeck.data()?.createdAt;
    const isNewDeck = !existingDeck.exists();

    await setDoc(
      flashcardsDocRef,
      {
        flashcardsSet,
        createdAt: existingCreatedAt || serverTimestamp(),
        ...(isNewDeck ? { lastOpenedAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error writing document: ", error);
    throw error;
  }
}

// Function to get the metadata needed to display and sort a user's decks.
export async function getFlashcardsDecks(
  userId: string,
): Promise<DeckSummary[]> {
  try {
    const flashcardsCollectionRef = collection(
      db,
      "users",
      userId,
      "flashcards",
    );
    const snapshot = await getDocs(flashcardsCollectionRef);

    return snapshot.docs.map((deckDocument) => {
      const data = deckDocument.data();
      return {
        id: deckDocument.id,
        subject: deckDocument.id,
        createdAt: timestampToMillis(data.createdAt),
        lastOpenedAt: timestampToMillis(data.lastOpenedAt),
      };
    });
  } catch (error) {
    console.error("Error fetching flashcards deck metadata: ", error);
    throw error;
  }
}

// Function to get a specific flashcards deck and its review history.
export async function getFlashcardsDeck(
  userId: string,
  deckId: string,
  markOpened = true,
): Promise<FlashcardsDeck | null> {
  try {
    const flashcardsDocRef = doc(db, "users", userId, "flashcards", deckId);
    const docSnap = await getDoc(flashcardsDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const flashcardsSet = data?.flashcardsSet;
      if (!Array.isArray(flashcardsSet)) return null;
      if (markOpened) {
        await updateDoc(flashcardsDocRef, {
          lastOpenedAt: serverTimestamp(),
        });
      }
      return {
        flashcardsSet,
        reviewHistory: normalizeReviewHistory(data?.reviewHistory),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching flashcards set: ", error);
    throw error;
  }
}

export async function saveReviewSession(
  userId: string,
  deckId: string,
  session: ReviewSessionDraft,
): Promise<ReviewSession> {
  const deckRef = doc(db, "users", userId, "flashcards", deckId);

  return runTransaction(db, async (transaction) => {
    const deckSnapshot = await transaction.get(deckRef);
    if (!deckSnapshot.exists()) throw new Error("DECK_NOT_FOUND");

    const deckData = deckSnapshot.data();
    const flashcardsSet = deckData?.flashcardsSet;
    if (
      !Array.isArray(flashcardsSet) ||
      flashcardsSet.length !== session.cardCount
    ) {
      throw new Error("DECK_SIZE_CHANGED");
    }

    const reviewHistory = normalizeReviewHistory(deckData?.reviewHistory);
    const existingSession = reviewHistory.find(
      (historyEntry) => historyEntry.id === session.id,
    );
    if (existingSession) return existingSession;

    const savedSession: ReviewSession = {
      ...session,
      completedAt: Date.now(),
    };
    transaction.update(deckRef, {
      reviewHistory: [...reviewHistory, savedSession].slice(
        -MAX_REVIEW_HISTORY,
      ),
    });
    return savedSession;
  });
}

// Update a deck and atomically move it when its title/document ID changes.
export async function updateFlashcardsSet(
  userId: string,
  deckId: string,
  nextDeckId: string,
  flashcardsSet: Flashcard[],
): Promise<void> {
  const currentDeckRef = doc(db, "users", userId, "flashcards", deckId);
  const currentDeck = await getDoc(currentDeckRef);

  if (!currentDeck.exists()) {
    throw new Error("DECK_NOT_FOUND");
  }

  if (deckId === nextDeckId) {
    await setDoc(
      currentDeckRef,
      {
        flashcardsSet,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  const nextDeckRef = doc(db, "users", userId, "flashcards", nextDeckId);
  const deckWithNextTitle = await getDoc(nextDeckRef);
  if (deckWithNextTitle.exists()) {
    throw new Error("DECK_ALREADY_EXISTS");
  }

  const batch = writeBatch(db);
  batch.set(nextDeckRef, {
    ...currentDeck.data(),
    flashcardsSet,
    updatedAt: serverTimestamp(),
  });
  batch.delete(currentDeckRef);
  await batch.commit();
}

export async function deleteFlashcardsSets(
  userId: string,
  deckIds: string[],
): Promise<void> {
  const batch = writeBatch(db);
  deckIds.forEach((deckId) => {
    batch.delete(doc(db, "users", userId, "flashcards", deckId));
  });
  await batch.commit();
}
