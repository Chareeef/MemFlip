import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFlashcardsDecks } from "../firestoreUtils";

/**
 * Handles POST requests to retrieve deck summaries for a user.
 *
 * This route expects a JSON payload containing:
 * - `userId`: The userId of the user.
 *
 * The function fetches each subject and its creation/opened timestamps from the
 * user's `flashcards` collection.
 * If the userId is missing or an error occurs during the fetch operation,
 * an appropriate error response is returned.
 */
export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const { userId: authenticatedUserId } = auth();

  // Validate the userId parameter
  if (!userId) {
    return new NextResponse(
      JSON.stringify({ error: "Please specify the userId" }),
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
      { error: "You cannot open this library" },
      { status: 403 },
    );
  }

  try {
    // Retrieve deck names and the metadata used by the library sort controls.
    const decks = await getFlashcardsDecks(userId);
    return NextResponse.json({ decks }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    return new NextResponse(
      JSON.stringify({ error: "Something went wrong. Try again later." }),
      { status: 500 },
    );
  }
}
