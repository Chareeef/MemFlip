import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const MAX_DECK_SIZE = 20;
const MAX_GENERATION_ATTEMPTS = 3;

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

type GeneratedFlashcard = {
  front: string;
  back: string;
};

function normalizeQuestion(question: string) {
  return question
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(
      /[\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\u060c\u061b\u061f\u2000-\u206f\u3000-\u303f]+/g,
      " ",
    )
    .trim();
}

function createFlashcardSchema(numberOfFlashcards: number) {
  return {
    $defs: {
      Flashcard: {
        properties: {
          front: { title: "Front", type: "string" },
          back: { title: "Back", type: "string" },
        },
        required: ["front", "back"],
        title: "Flashcard",
        type: "object",
      },
    },
    properties: {
      flashcards: {
        items: { $ref: "#/$defs/Flashcard" },
        title: "Flashcards",
        type: "array",
        minItems: numberOfFlashcards,
        maxItems: numberOfFlashcards,
      },
    },
    required: ["flashcards"],
    title: "Flashcard Set",
    type: "object",
  };
}

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
  const {
    subject,
    numberOfFlashcards,
    existingQuestions = [],
  } = await req.json();

  // If no subject is provided, return a 400 Bad Request error
  if (typeof subject !== "string" || !subject.trim()) {
    return new NextResponse(
      JSON.stringify({ error: "Subject not specified" }),
      { status: 400 },
    );
  }

  if (
    !Array.isArray(existingQuestions) ||
    existingQuestions.some((question) => typeof question !== "string") ||
    existingQuestions.length > MAX_DECK_SIZE
  ) {
    return NextResponse.json(
      { error: "existingQuestions must be an array of up to 20 strings" },
      { status: 400 },
    );
  }

  // Keep requests bounded so the UI remains responsive and output stays useful.
  if (
    !Number.isInteger(numberOfFlashcards) ||
    numberOfFlashcards < 1 ||
    numberOfFlashcards > MAX_DECK_SIZE
  ) {
    return NextResponse.json(
      { error: "numberOfFlashcards must be an integer between 1 and 20" },
      { status: 400 },
    );
  }

  if (existingQuestions.length + numberOfFlashcards > MAX_DECK_SIZE) {
    return NextResponse.json(
      { error: "A deck can contain at most 20 cards" },
      { status: 400 },
    );
  }

  try {
    const generatedCards: GeneratedFlashcard[] = [];
    const seenQuestions = new Set(
      existingQuestions
        .map(normalizeQuestion)
        .filter((question) => question.length > 0),
    );

    for (
      let attempt = 0;
      attempt < MAX_GENERATION_ATTEMPTS &&
      generatedCards.length < numberOfFlashcards;
      attempt += 1
    ) {
      const remaining = numberOfFlashcards - generatedCards.length;
      const flashcardSchema = createFlashcardSchema(remaining);
      const systemPrompt =
        "You are a flashcard generator that outputs flashcards in JSON. " +
        "Every question must be distinct from the other generated questions " +
        "and from every excluded question, including rewordings with the same meaning.\n" +
        `The JSON object must use the schema: ${JSON.stringify(flashcardSchema, null, 4)}`;
      const excludedQuestions = [
        ...existingQuestions,
        ...generatedCards.map((card) => card.front),
      ].filter((question) => question.trim().length > 0);
      const exclusionInstruction =
        excludedQuestions.length > 0
          ? ` Do not repeat or closely rephrase any of these existing questions: ${JSON.stringify(excludedQuestions)}.`
          : "";

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content:
              `Generate exactly ${remaining} new flashcards about ${subject.trim()}.` +
              exclusionInstruction,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: attempt === 0 ? 0 : 0.2,
        stream: false,
        response_format: { type: "json_object" },
      });

      const flashcardSet = JSON.parse(
        chatCompletion.choices[0].message.content as string,
      ) as { flashcards?: unknown };
      const candidates = Array.isArray(flashcardSet.flashcards)
        ? flashcardSet.flashcards
        : [];

      for (const candidate of candidates) {
        if (
          !candidate ||
          typeof candidate !== "object" ||
          !("front" in candidate) ||
          !("back" in candidate) ||
          typeof candidate.front !== "string" ||
          typeof candidate.back !== "string"
        ) {
          continue;
        }

        const front = candidate.front.trim();
        const back = candidate.back.trim();
        const normalizedFront = normalizeQuestion(front);
        if (
          !front ||
          !back ||
          !normalizedFront ||
          seenQuestions.has(normalizedFront)
        ) {
          continue;
        }

        seenQuestions.add(normalizedFront);
        generatedCards.push({ front, back });
        if (generatedCards.length === numberOfFlashcards) break;
      }
    }

    if (generatedCards.length !== numberOfFlashcards) {
      return NextResponse.json(
        {
          error:
            "The AI couldn’t create enough unique questions. Try a smaller number or make the topic more specific.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ flashcards: generatedCards }, { status: 200 });
  } catch (error) {
    return providerFailureResponse(error);
  }
}
