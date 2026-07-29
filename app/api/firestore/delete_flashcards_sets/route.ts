import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { deleteFlashcardsSets } from "../firestoreUtils";

export async function POST(req: NextRequest) {
  const { userId, deckIds } = await req.json();
  const { userId: authenticatedUserId } = auth();
  const uniqueDeckIds =
    Array.isArray(deckIds) &&
    Array.from(
      new Set(
        deckIds.filter(
          (deckId): deckId is string =>
            typeof deckId === "string" && deckId.length > 0,
        ),
      ),
    );

  if (
    !userId ||
    !uniqueDeckIds ||
    uniqueDeckIds.length === 0 ||
    uniqueDeckIds.length > 500
  ) {
    return NextResponse.json(
      { error: "Select between 1 and 500 decks to delete." },
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
    await deleteFlashcardsSets(userId, uniqueDeckIds);
    return NextResponse.json({ deletedDeckIds: uniqueDeckIds });
  } catch {
    return NextResponse.json(
      { error: "The selected decks could not be deleted. Try again later." },
      { status: 500 },
    );
  }
}
