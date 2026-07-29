"use client";

import { Flashcard } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEdit2,
  FiMoreVertical,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
} from "react-icons/fi";
import Button from "./ui/Button";
import Flashcards from "./Flashcards";

type Direction = "next" | "previous";
type Rating = "again" | "hard" | "good" | "easy";
type SessionMode = "study" | "browse";

const ratingLabels: Record<Rating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

export default function StudySession({
  subject,
  flashcards,
  onClose,
  onEdit,
  onDelete,
}: {
  subject: string;
  flashcards: Flashcard[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<Direction>("next");
  const [ratings, setRatings] = useState<
    Partial<Record<number, Rating>>
  >({});
  const [complete, setComplete] = useState(false);
  const [mode, setMode] = useState<SessionMode>("study");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setDirection("next");
    setRatings({});
    setComplete(false);
    setMode("study");
  }, []);

  useEffect(() => {
    reset();
  }, [reset, subject]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    const closeMenuWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuWithEscape);
    };
  }, [menuOpen]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= flashcards.length) return;
      setDirection(nextIndex > currentIndex ? "next" : "previous");
      setCurrentIndex(nextIndex);
      setFlipped(false);
    },
    [currentIndex, flashcards.length],
  );

  useEffect(() => {
    if (complete || mode !== "study") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isFormControl =
        target.matches("input, textarea, select") ||
        target.getAttribute("contenteditable") === "true";
      if (isFormControl) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo(currentIndex + 1);
      } else if (
        (event.key === " " || event.key === "Enter") &&
        target.tagName !== "BUTTON"
      ) {
        event.preventDefault();
        setFlipped((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [complete, currentIndex, goTo, mode]);

  const ratingSummary = useMemo(
    () =>
      Object.values(ratings).reduce<Record<Rating, number>>(
        (totals, rating) => {
          if (rating) totals[rating] += 1;
          return totals;
        },
        { again: 0, hard: 0, good: 0, easy: 0 },
      ),
    [ratings],
  );

  const handleRating = (rating: Rating) => {
    const nextRatings = { ...ratings, [currentIndex]: rating };
    setRatings(nextRatings);
    const ratedIndexes = Object.keys(nextRatings).map(Number);
    if (ratedIndexes.length === flashcards.length) {
      setComplete(true);
    } else {
      const nextUnrated =
        Array.from({ length: flashcards.length }, (_, index) => index).find(
          (index) => index > currentIndex && !nextRatings[index],
        ) ??
        Array.from({ length: flashcards.length }, (_, index) => index).find(
          (index) => !nextRatings[index],
        ) ??
        currentIndex;
      setDirection(nextUnrated > currentIndex ? "next" : "previous");
      setCurrentIndex(nextUnrated);
      setFlipped(false);
    }
  };

  const currentCard = flashcards[currentIndex];
  const ratedCount = Object.keys(ratings).length;
  const progress = flashcards.length
    ? ((complete ? flashcards.length : ratedCount) / flashcards.length) * 100
    : 0;

  if (!currentCard) return null;

  return (
    <section
      className="flex min-h-[calc(100svh-8rem)] w-full flex-col overflow-hidden bg-surface"
      aria-labelledby="study-session-title"
    >
      <div className="flex items-start gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onClose}
          className="icon-button -ml-1"
          aria-label="Back to library"
        >
          <FiArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="min-w-0 grow">
          <h1
            id="study-session-title"
            className="truncate text-xl font-bold tracking-[-0.025em] text-ink-900 sm:text-2xl"
          >
            {subject}
          </h1>
          <p className="mt-0.5 text-sm leading-6 text-ink-500">
            {complete
              ? "Study session complete"
              : mode === "browse"
                ? `${flashcards.length} ${
                    flashcards.length === 1 ? "card" : "cards"
                  } in this deck`
                : `Card ${currentIndex + 1} of ${flashcards.length}`}
          </p>
        </div>
        <div ref={menuRef} className="relative ml-auto shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="icon-button"
            aria-label={`More options for ${subject}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <FiMoreVertical className="size-5" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-40 w-44 overflow-hidden rounded-control border border-[var(--border)] bg-white p-1.5 shadow-floating"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-ink-700 hover:bg-surface-subtle hover:text-ink-900"
              >
                <FiEdit2 className="size-4" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete();
                }}
                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <FiTrash2 className="size-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {!complete && (
        <div
          className="flex items-center gap-1 border-b border-[var(--border)] bg-white px-4 py-2 sm:px-6"
          role="tablist"
          aria-label="Deck view"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "study"}
            aria-controls="study-panel"
            onClick={() => setMode("study")}
            className={`min-h-9 rounded-control px-3 text-sm font-semibold transition-colors ${
              mode === "study"
                ? "bg-brand-50 text-brand-800"
                : "text-ink-500 hover:bg-surface-subtle hover:text-ink-900"
            }`}
          >
            Study
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "browse"}
            aria-controls="browse-panel"
            onClick={() => setMode("browse")}
            className={`min-h-9 rounded-control px-3 text-sm font-semibold transition-colors ${
              mode === "browse"
                ? "bg-brand-50 text-brand-800"
                : "text-ink-500 hover:bg-surface-subtle hover:text-ink-900"
            }`}
          >
            Browse all
          </button>
          <span className="ml-auto text-xs font-semibold tabular-nums text-ink-500">
            {ratedCount}/{flashcards.length} reviewed
          </span>
        </div>
      )}

      {mode === "study" && (
        <div className="h-1 bg-surface-subtle" aria-hidden="true">
          <div
            className="h-full bg-brand-600 transition-[width] duration-200 ease-product"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {mode === "browse" && !complete ? (
        <div
          id="browse-panel"
          role="tabpanel"
          className="min-h-0 grow overflow-y-auto p-4 sm:p-6"
        >
          <Flashcards flashcards={flashcards} />
        </div>
      ) : complete ? (
        <div className="flex min-h-[28rem] grow flex-col items-center justify-center overflow-y-auto px-5 py-12 text-center sm:px-8">
          <div className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
            <FiCheck className="size-7" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-ink-900">
            Nice work — deck complete
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">
            You reviewed all {flashcards.length} cards. Your choices are a
            quick reflection for this session and are not saved.
          </p>
          <dl className="mt-7 grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(ratingLabels) as Rating[]).map((rating) => (
              <div
                key={rating}
                className="rounded-control border border-[var(--border)] bg-surface-subtle px-3 py-4"
              >
                <dt className="text-xs font-semibold text-ink-500">
                  {ratingLabels[rating]}
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-ink-900">
                  {ratingSummary[rating]}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex w-full max-w-sm flex-col-reverse gap-3 sm:flex-row">
            <Button className="flex-1" variant="secondary" onClick={onClose}>
              Back to library
            </Button>
            <Button
              className="flex-1"
              onClick={reset}
              leadingIcon={<FiRotateCcw className="size-4" />}
            >
              Study again
            </Button>
          </div>
        </div>
      ) : (
        <div
          id="study-panel"
          role="tabpanel"
          className="min-h-0 grow overflow-y-auto px-4 py-5 sm:px-8 sm:py-7"
        >
          <div
            key={`${currentIndex}-${direction}`}
            className={`mx-auto max-w-2xl ${
              direction === "next"
                ? "study-card-enter-next"
                : "study-card-enter-previous"
            }`}
          >
            <button
              type="button"
              className="flashcard-scene group block min-h-[20rem] w-full cursor-pointer rounded-card text-left sm:min-h-[22rem]"
              onClick={() => setFlipped((value) => !value)}
              aria-pressed={flipped}
              aria-label={`${flipped ? "Answer" : "Question"}: ${
                flipped ? currentCard.back : currentCard.front
              }. ${flipped ? "Show question" : "Show answer"}`}
            >
              <span
                className="flashcard-flipper block rounded-card transition-[transform,filter] group-active:brightness-[0.98]"
                data-flipped={flipped}
              >
                <span
                  className="flashcard-face flashcard-face-front rounded-card border border-brand-100 bg-white shadow-card"
                  aria-hidden={flipped}
                >
                  <span className="border-b border-[var(--border)] px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
                    Question
                  </span>
                  <span className="flashcard-content-scroll flex min-h-0 grow items-center overflow-y-auto p-7 sm:p-10">
                    <span className="mx-auto max-w-[38ch] whitespace-pre-wrap break-words text-center text-xl font-semibold leading-9 text-ink-900 sm:text-2xl sm:leading-10">
                      {currentCard.front}
                    </span>
                  </span>
                  <span className="flex items-center justify-center gap-2 border-t border-[var(--border)] px-5 py-4 text-xs font-semibold text-ink-500">
                    <FiRotateCw className="size-4" aria-hidden="true" />
                    Tap, Space, or Enter to reveal
                  </span>
                </span>
                <span
                  className="flashcard-face flashcard-face-back rounded-card border border-brand-600 bg-brand-700 text-white shadow-card"
                  aria-hidden={!flipped}
                >
                  <span className="border-b border-white/15 px-6 py-4 text-xs font-bold uppercase tracking-[0.12em] text-brand-100">
                    Answer
                  </span>
                  <span className="flashcard-content-scroll flex min-h-0 grow items-center overflow-y-auto p-7 sm:p-10">
                    <span className="mx-auto max-w-[42ch] whitespace-pre-wrap break-words text-center text-lg font-medium leading-8 text-white sm:text-xl sm:leading-9">
                      {currentCard.back}
                    </span>
                  </span>
                  <span className="flex items-center justify-center gap-2 border-t border-white/15 px-5 py-4 text-xs font-semibold text-brand-100">
                    <FiRotateCw className="size-4" aria-hidden="true" />
                    Tap to return to the question
                  </span>
                </span>
              </span>
            </button>

            <div className="mt-5 min-h-[4.75rem]">
              {flipped ? (
                <fieldset>
                  <legend className="mb-3 w-full text-center text-xs font-semibold text-ink-500">
                    How did this card feel?
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button
                      type="button"
                      onClick={() => handleRating("again")}
                      aria-pressed={ratings[currentIndex] === "again"}
                      className="min-h-11 rounded-control border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100"
                    >
                      Again
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRating("hard")}
                      aria-pressed={ratings[currentIndex] === "hard"}
                      className="min-h-11 rounded-control border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                    >
                      Hard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRating("good")}
                      aria-pressed={ratings[currentIndex] === "good"}
                      className="min-h-11 rounded-control border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100"
                    >
                      Good
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRating("easy")}
                      aria-pressed={ratings[currentIndex] === "easy"}
                      className="min-h-11 rounded-control border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
                    >
                      Easy
                    </button>
                  </div>
                </fieldset>
              ) : (
                <p className="pt-3 text-center text-xs leading-5 text-ink-500">
                  Reveal the answer before rating your recall.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!complete && mode === "study" && (
        <div className="flex items-center justify-between border-t border-[var(--border)] bg-surface-subtle px-4 py-3 sm:px-6">
          <Button
            variant="quiet"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => goTo(currentIndex - 1)}
            leadingIcon={<FiArrowLeft className="size-4" />}
          >
            Previous
          </Button>
          <span className="hidden text-xs text-ink-500 sm:block">
            Use the arrow keys to move
          </span>
          <Button
            variant="quiet"
            size="sm"
            disabled={currentIndex === flashcards.length - 1}
            onClick={() => goTo(currentIndex + 1)}
            trailingIcon={<FiArrowRight className="size-4" />}
          >
            Next
          </Button>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {complete
          ? `Study session complete. ${flashcards.length} cards reviewed.`
          : `Card ${currentIndex + 1} of ${flashcards.length}. ${
              flipped ? "Answer shown." : "Question shown."
            }`}
      </p>
    </section>
  );
}
