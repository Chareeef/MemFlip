"use client";

import { useState } from "react";
import { FiRotateCw } from "react-icons/fi";

export default function LandingFlashcard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((current) => !current)}
      className="flashcard-scene group mt-5 block min-h-[19rem] w-full cursor-pointer rounded-[1.15rem] text-left sm:min-h-[22rem]"
      aria-pressed={flipped}
      aria-label={
        flipped
          ? "Answer: Fyodor Dostoevsky. Show question."
          : "Question: Who wrote “Beauty will save the world”? Show answer."
      }
    >
      <span
        className="flashcard-flipper block rounded-[1.15rem] transition-[transform,filter] group-active:brightness-[0.98]"
        data-flipped={flipped}
      >
        <span
          className="flashcard-face flashcard-face-front rounded-[1.15rem] border border-brand-100 bg-[linear-gradient(145deg,#fff,var(--brand-50))] p-6 shadow-card sm:p-8"
          aria-hidden={flipped}
        >
          <span className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
              Question
            </span>
            <FiRotateCw
              className="size-4 text-brand-500"
              aria-hidden="true"
            />
          </span>
          <span className="m-auto max-w-[24ch] text-center text-xl font-bold leading-9 tracking-[-0.025em] text-ink-900 sm:text-2xl">
            Who wrote &ldquo;Beauty will save the world&rdquo;?
          </span>
          <span className="text-center text-xs font-semibold text-ink-500">
            Tap or press Enter to reveal
          </span>
        </span>

        <span
          className="flashcard-face flashcard-face-back rounded-[1.15rem] border border-brand-600 bg-brand-700 p-6 text-white shadow-card sm:p-8"
          aria-hidden={!flipped}
        >
          <span className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-100">
              Answer
            </span>
            <FiRotateCw
              className="size-4 text-brand-200"
              aria-hidden="true"
            />
          </span>
          <span className="m-auto max-w-[27ch] text-center text-lg font-semibold leading-8 sm:text-xl">
            Fyodor Dostoevsky
          </span>
          <span className="text-center text-xs font-semibold text-brand-100">
            Tap to return to the question
          </span>
        </span>
      </span>
    </button>
  );
}
