import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RatingCounts, ReviewSessionDraft } from "@/types";
import { MAX_DECK_SIZE } from "../../../flashcardConstraints";
import { saveReviewSession } from "../firestoreUtils";

function validRatingCounts(
  value: unknown,
  cardCount: number,
): value is RatingCounts {
  if (!value || typeof value !== "object") return false;
  const counts = value as Record<string, unknown>;
  const values = [counts[1], counts[2], counts[3], counts[4]];

  return (
    values.every(
      (count) => Number.isInteger(count) && Number(count) >= 0,
    ) &&
    values.reduce<number>((total, count) => total + Number(count), 0) ===
      cardCount
  );
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const parsedBody: unknown = await req.json();
    if (!parsedBody || typeof parsedBody !== "object") throw new Error();
    body = parsedBody as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "This review session is not valid." },
      { status: 400 },
    );
  }

  const { userId: authenticatedUserId } = auth();
  const { userId, deckId, sessionId, cardCount, ratingCounts } = body;

  if (!authenticatedUserId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
  if (authenticatedUserId !== userId) {
    return NextResponse.json(
      { error: "You cannot modify this library" },
      { status: 403 },
    );
  }

  if (
    typeof deckId !== "string" ||
    !deckId ||
    typeof sessionId !== "string" ||
    !sessionId ||
    sessionId.length > 100 ||
    typeof cardCount !== "number" ||
    !Number.isInteger(cardCount) ||
    cardCount < 1 ||
    cardCount > MAX_DECK_SIZE ||
    !validRatingCounts(ratingCounts, cardCount)
  ) {
    return NextResponse.json(
      { error: "This review session is not valid." },
      { status: 400 },
    );
  }

  const session: ReviewSessionDraft = {
    id: sessionId,
    cardCount,
    ratingCounts,
  };

  try {
    const savedSession = await saveReviewSession(
      authenticatedUserId,
      deckId,
      session,
    );
    return NextResponse.json({ session: savedSession }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DECK_NOT_FOUND") {
      return NextResponse.json(
        { error: "This deck no longer exists." },
        { status: 404 },
      );
    }
    if (error instanceof Error && error.message === "DECK_SIZE_CHANGED") {
      return NextResponse.json(
        { error: "This deck changed during the review. Start a new revision." },
        { status: 409 },
      );
    }

    console.error("Error saving review session:", error);

    return NextResponse.json(
      { error: "Your revision could not be saved. Try again." },
      { status: 500 },
    );
  }
}
