"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import { FiRotateCw } from "react-icons/fi";

export default function Flashcards({
  flashcards,
  labelledBy,
}: {
  flashcards: Flashcard[];
  labelledBy?: string;
}) {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleFlip = (index: number) => {
    setFlippedCards((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  };

  return (
    <div
      className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      aria-labelledby={labelledBy}
    >
      {flashcards.map((flashcard, index) => {
        const flipped = Boolean(flippedCards[index]);
        return (
          <button
            key={`${index}-${flashcard.front.slice(0, 24)}`}
            type="button"
            className="flashcard-scene group w-full cursor-pointer rounded-card text-left"
            onClick={() => handleFlip(index)}
            aria-pressed={flipped}
            aria-label={`Card ${index + 1} of ${flashcards.length}. ${
              flipped ? "Answer" : "Question"
            }: ${flipped ? flashcard.back : flashcard.front}. ${
              flipped ? "Show question" : "Show answer"
            }`}
          >
            <span
              className="flashcard-flipper block rounded-card transition-[transform,filter] group-active:brightness-[0.98]"
              data-flipped={flipped}
            >
              <span
                className="flashcard-face flashcard-face-front rounded-card border border-brand-100 bg-white shadow-card"
                aria-hidden={flipped}
              >
                <span className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    Question
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-ink-500">
                    {index + 1}/{flashcards.length}
                  </span>
                </span>
                <span className="flashcard-content-scroll flex min-h-0 grow items-center overflow-y-auto p-6">
                  <span className="mx-auto max-w-[34ch] whitespace-pre-wrap break-words text-center text-lg font-semibold leading-8 text-ink-900">
                    {flashcard.front}
                  </span>
                </span>
                <span className="flex items-center justify-center gap-2 border-t border-[var(--border)] px-5 py-3 text-xs font-semibold text-ink-500">
                  <FiRotateCw className="size-3.5" aria-hidden="true" />
                  Tap or press Enter to reveal
                </span>
              </span>

              <span
                className="flashcard-face flashcard-face-back rounded-card border border-brand-600 bg-brand-700 text-white shadow-card"
                aria-hidden={!flipped}
              >
                <span className="flex items-center justify-between border-b border-white/15 px-5 py-3">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-100">
                    Answer
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-brand-100">
                    {index + 1}/{flashcards.length}
                  </span>
                </span>
                <span className="flashcard-content-scroll flex min-h-0 grow items-center overflow-y-auto p-6">
                  <span className="mx-auto max-w-[36ch] whitespace-pre-wrap break-words text-center text-base font-medium leading-7 text-white">
                    {flashcard.back}
                  </span>
                </span>
                <span className="flex items-center justify-center gap-2 border-t border-white/15 px-5 py-3 text-xs font-semibold text-brand-100">
                  <FiRotateCw className="size-3.5" aria-hidden="true" />
                  Tap to see the question
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
