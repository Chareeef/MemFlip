import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firestore";
import { DeckSummary, Flashcard } from "@/types";

function timestampToMillis(value: unknown): number | null {
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

// Function to get a specific flashcards set by subject for a user
export async function getFlashcardsSet(
  userId: string,
  deckId: string,
  markOpened = true,
): Promise<Flashcard[] | null> {
  try {
    const flashcardsDocRef = doc(db, "users", userId, "flashcards", deckId);
    const docSnap = await getDoc(flashcardsDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const flashcardsSet = data?.flashcardsSet || null;
      if (markOpened) {
        await updateDoc(flashcardsDocRef, {
          lastOpenedAt: serverTimestamp(),
        });
      }
      return flashcardsSet;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching flashcards set: ", error);
    throw error;
  }
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
