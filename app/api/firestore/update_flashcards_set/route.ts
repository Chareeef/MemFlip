import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Flashcard } from "@/types";
import { updateFlashcardsSet } from "../firestoreUtils";

function isValidFlashcard(card: unknown): card is Flashcard {
  if (!card || typeof card !== "object") return false;
  const candidate = card as Partial<Flashcard>;
  return (
    typeof candidate.front === "string" &&
    candidate.front.trim().length > 0 &&
    typeof candidate.back === "string" &&
    candidate.back.trim().length > 0
  );
}

export async function POST(req: NextRequest) {
  const { userId, deckId, title, flashcards } = await req.json();
  const { userId: authenticatedUserId } = auth();
  const cleanTitle = typeof title === "string" ? title.trim() : "";

  if (
    !userId ||
    typeof deckId !== "string" ||
    !deckId ||
    !cleanTitle ||
    cleanTitle.includes("/") ||
    cleanTitle.length > 160 ||
    !Array.isArray(flashcards) ||
    flashcards.length === 0 ||
    !flashcards.every(isValidFlashcard)
  ) {
    return NextResponse.json(
      { error: "Provide a valid title and at least one complete card." },
      { status: 400 },
    );
  }

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

  try {
    await updateFlashcardsSet(
      userId,
      deckId,
      cleanTitle,
      flashcards.map((card: Flashcard) => ({
        front: card.front.trim(),
        back: card.back.trim(),
      })),
    );
    return NextResponse.json({ deckId: cleanTitle });
  } catch (error) {
    if (error instanceof Error && error.message === "DECK_ALREADY_EXISTS") {
      return NextResponse.json(
        { error: "A deck with this title already exists." },
        { status: 409 },
      );
    }
    if (error instanceof Error && error.message === "DECK_NOT_FOUND") {
      return NextResponse.json(
        { error: "This deck no longer exists." },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "The deck could not be updated. Try again later." },
      { status: 500 },
    );
  }
}
