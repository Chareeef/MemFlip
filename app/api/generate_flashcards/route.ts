import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

type ProviderError = {
  status?: number;
  message?: string;
  error?: {
    code?: string;
    message?: string;
    error?: {
      code?: string;
      message?: string;
    };
  };
};

function providerFailureResponse(error: unknown) {
  const providerError = error as ProviderError;
  const providerDetails =
    providerError.error?.error || providerError.error;
  const providerMessage =
    providerDetails?.message || providerError.message || "";
  const providerCode = providerDetails?.code || "";

  console.error("Groq flashcard generation failed", {
    status: providerError.status,
    code: providerCode || "unknown",
    message: providerMessage,
  });

  if (
    providerCode === "organization_restricted" ||
    providerMessage.toLowerCase().includes("organization has been restricted")
  ) {
    return NextResponse.json(
      {
        code: "AI_PROVIDER_RESTRICTED",
        error:
          "AI generation is unavailable because the connected Groq organization is restricted. If you manage MemFlip, resolve the organization status in GroqCloud or replace GROQ_API_KEY.",
      },
      { status: 503 },
    );
  }

  if (providerError.status === 401 || providerError.status === 403) {
    return NextResponse.json(
      {
        code: "AI_PROVIDER_CONFIGURATION",
        error:
          "AI generation is not configured correctly. If you manage MemFlip, verify the Groq API key and model permissions.",
      },
      { status: 503 },
    );
  }

  if (providerError.status === 429) {
    return NextResponse.json(
      {
        code: "AI_PROVIDER_BUSY",
        error:
          "The AI service is receiving too many requests right now. Wait a moment, then try again.",
      },
      { status: 429 },
    );
  }

  return NextResponse.json(
    {
      code: "AI_PROVIDER_ERROR",
      error:
        "The AI service couldn’t complete this request. Your topic is still here—please try again.",
    },
    { status: 502 },
  );
}

// The POST function to handle incoming requests
export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Flashcard generation is temporarily unavailable" },
      { status: 503 },
    );
  }

  // Initialize per request so builds do not require runtime secrets.
  const groq = new Groq({ apiKey });

  // Extracting the subject from the request body
  const { subject, numberOfFlashcards } = await req.json();

  // If no subject is provided, return a 400 Bad Request error
  if (!subject) {
    return new NextResponse(
      JSON.stringify({ error: "Subject not specified" }),
      { status: 400 },
    );
  }

  // Keep requests bounded so the UI remains responsive and output stays useful.
  if (
    !Number.isInteger(numberOfFlashcards) ||
    numberOfFlashcards < 3 ||
    numberOfFlashcards > 20
  ) {
    return new NextResponse(
      JSON.stringify({
        error: "numberOfFlashcards must be an integer between 3 and 20",
      }),
      { status: 400 },
    );
  }

  // Defining the JSON schema for the flashcard data structure
  const flashcardSchema = {
    $defs: {
      Flashcard: {
        properties: {
          front: { title: "Front", type: "string" }, // The front side of the flashcard (question/term)
          back: { title: "Back", type: "string" }, // The back side of the flashcard (answer/definition)
        },
        required: ["front", "back"], // Both front and back are required fields
        title: "Flashcard", // Name of the schema definition
        type: "object", // The schema type is an object
      },
    },
    properties: {
      flashcards: {
        items: { $ref: "#/$defs/Flashcard" }, // Each item in the flashcards array must follow the Flashcard schema
        title: "Flashcards", // Name of the flashcards array
        type: "array", // The flashcards field is an array
        minItems: numberOfFlashcards,
        maxItems: numberOfFlashcards,
      },
    },
    required: ["flashcards"], // The flashcards field is required in the schema
    title: "Flashcard Set", // Name of the top-level schema
    type: "object", // The schema type is an object
  };

  // Stringifying the schema to include in the system prompt
  const jsonSchema = JSON.stringify(flashcardSchema, null, 4);

  // Creating the system prompt with the flashcard schema
  const systemPrompt = `You are a flashcard generator that outputs flashcards in JSON.\nThe JSON object must use the schema: ${jsonSchema}`;

  try {
    // Sending a request to Groq API to generate flashcards based on the subject
    const chat_completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt, // The system prompt that defines the role and schema
        },
        {
          role: "user",
          content: `Generate a list of flashcards about ${subject}`, // User request to generate flashcards
        },
      ],
      model: "llama-3.3-70b-versatile", // Model used for generating the flashcards
      temperature: 0, // Temperature set to 0 for deterministic results
      stream: false, // No streaming; the response is returned as a whole
      response_format: { type: "json_object" }, // The expected response format is a JSON object
    });

    // Parsing the response content to get the flashcard set
    const flashcardSet = JSON.parse(
      chat_completion.choices[0].message.content as string,
    );

    // Returning the generated flashcard set with a 200 OK status
    return new NextResponse(JSON.stringify(flashcardSet), { status: 200 });
  } catch (error) {
    return providerFailureResponse(error);
  }
}
