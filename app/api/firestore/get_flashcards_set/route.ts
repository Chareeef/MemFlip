import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getFlashcardsSet } from "../firestoreUtils";

/**
 * Handles POST requests to retrieve a specific flashcards set by subject for a user.
 *
 * This route expects a JSON payload containing:
 * - `userId`: The userId of the user.
 * - `subject`: The subject (ID) of the flashcards set.
 *
 * The function fetches the specified flashcards set from Firestore for the given user.
 * If the flashcards set is found, it is returned in the response.
 * If the userId or subject is missing, or if the flashcards set is not found or an error occurs,
 * an appropriate error response is returned.
 */
export async function POST(req: NextRequest) {
  const { userId, subject } = await req.json();
  const { userId: authenticatedUserId } = auth();

  // Validate the userId and subject parameters
  if (!userId || !subject) {
    return new NextResponse(
      JSON.stringify({
        error: "Please specify both userId and subject",
      }),
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
    // Retrieve the specific flashcards set from Firestore
    const flashcardsSet = await getFlashcardsSet(userId, subject);
    if (flashcardsSet) {
      return new NextResponse(JSON.stringify({ flashcardsSet }), {
        status: 200,
      });
    } else {
      return new NextResponse(
        JSON.stringify({ error: "Flashcards set not found" }),
        { status: 404 },
      );
    }
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    return new NextResponse(
      JSON.stringify({ error: "Something went wrong. Try again later." }),
      { status: 500 },
    );
  }
}
