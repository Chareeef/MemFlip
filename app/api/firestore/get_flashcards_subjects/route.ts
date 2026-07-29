import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFlashcardsSetsIds } from "../firestoreUtils";

/**
 * Handles POST requests to retrieve all flashcards sets' IDs (subjects) for a user.
 *
 * This route expects a JSON payload containing:
 * - `userId`: The userId of the user.
 *
 * The function fetches all the document IDs (which correspond to the subjects)
 * in the `flashcards` collection for the specified user in Firestore.
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
    // Retrieve the flashcards sets' IDs from Firestore
    const subjects = await getFlashcardsSetsIds(userId);
    return new NextResponse(JSON.stringify({ subjects }), { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    return new NextResponse(
      JSON.stringify({ error: "Something went wrong. Try again later." }),
      { status: 500 },
    );
  }
}
