"use client";

import { useUser } from "@clerk/nextjs";
import { Flashcard } from "@/types";
import { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit3,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import Alert, { AlertType } from "../components/Alert";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { showAlert } from "../utils";

type DraftFlashcard = Flashcard & { id: string };
type RequestState = "idle" | "loading" | "success" | "error";
type SaveState = "idle" | "saving" | "saved";

function createId(index = 0) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${index}`;
}

function AutoResizeTextarea({
  value,
  onChange,
  ...props
}: Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "value"
> & {
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.max(textarea.scrollHeight, 92)}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      {...props}
    />
  );
}

function GenerationSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
      {Array.from({ length: Math.min(count, 6) }).map((_, index) => (
        <div key={index} className="surface-card p-5">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton size-8 rounded-control" />
          </div>
          <div className="mt-5">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton mt-2 h-20 rounded-control" />
          </div>
          <div className="mt-4">
            <div className="skeleton h-3 w-14 rounded" />
            <div className="skeleton mt-2 h-24 rounded-control" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GenerateFlashcards() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [numberOfFlashcards, setNumberOfFlashcards] = useState(8);
  const [flashcards, setFlashcards] = useState<DraftFlashcard[]>([]);
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [requestError, setRequestError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [showValidation, setShowValidation] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [lastRemoved, setLastRemoved] = useState<{
    card: DraftFlashcard;
    index: number;
  } | null>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("");

  const performGeneration = async () => {
    const cleanSubject = subject.trim();
    if (!cleanSubject) {
      setRequestError("Enter a topic to generate flashcards.");
      document.getElementById("subject")?.focus();
      return;
    }
    if (numberOfFlashcards < 3 || numberOfFlashcards > 30) {
      setRequestError("Choose between 3 and 30 flashcards.");
      document.getElementById("numberOfFlashcards")?.focus();
      return;
    }

    setConfirmRegenerate(false);
    setRequestState("loading");
    setRequestError("");
    setSaveState("idle");
    setShowValidation(false);
    setLastRemoved(null);

    try {
      const response = await fetch("/api/generate_flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: cleanSubject,
          numberOfFlashcards,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      const generated: Flashcard[] = Array.isArray(data.flashcards)
        ? data.flashcards
        : data?.properties?.flashcards?.items;

      if (!Array.isArray(generated) || generated.length === 0) {
        throw new Error("No cards were returned");
      }

      const validCards = generated.filter(
        (card) =>
          card &&
          typeof card.front === "string" &&
          typeof card.back === "string",
      );

      if (validCards.length === 0) throw new Error("Cards were invalid");

      setSubject(cleanSubject);
      setFlashcards(
        validCards.map((card, index) => ({
          id: createId(index),
          front: card.front.trim(),
          back: card.back.trim(),
        })),
      );
      setRequestState("success");
      showAlert(
        `${validCards.length} editable flashcards are ready to review.`,
        "success",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
    } catch (error) {
      setRequestState("error");
      setRequestError(
        error instanceof Error
          ? error.message
          : "We couldn’t generate this set. Your topic is still here—check your connection and try again.",
      );
    }
  };

  const handleGenerate = (event: FormEvent) => {
    event.preventDefault();
    if (requestState === "loading") return;
    if (flashcards.length > 0) {
      setConfirmRegenerate(true);
    } else {
      performGeneration();
    }
  };

  const updateCard = (
    id: string,
    field: keyof Flashcard,
    value: string,
  ) => {
    setFlashcards((cards) =>
      cards.map((card) => (card.id === id ? { ...card, [field]: value } : card)),
    );
    setSaveState("idle");
  };

  const removeCard = (id: string) => {
    const index = flashcards.findIndex((card) => card.id === id);
    if (index < 0) return;
    setLastRemoved({ card: flashcards[index], index });
    setFlashcards((cards) => cards.filter((card) => card.id !== id));
    setSaveState("idle");
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    setFlashcards((cards) => {
      const nextCards = [...cards];
      nextCards.splice(lastRemoved.index, 0, lastRemoved.card);
      return nextCards;
    });
    setLastRemoved(null);
  };

  const addBlankCard = () => {
    const id = createId(flashcards.length);
    setFlashcards((cards) => [
      ...cards,
      { id, front: "", back: "" },
    ]);
    setRequestState("success");
    setSaveState("idle");
    window.setTimeout(() => {
      document.getElementById(`front-${id}`)?.focus();
    }, 0);
  };

  const handleSaveFlashcards = async () => {
    setShowValidation(true);

    if (!subject.trim()) {
      showAlert(
        "Give this deck a title before saving.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
      document.getElementById("subject")?.focus();
      return;
    }

    if (
      flashcards.length === 0 ||
      flashcards.some((card) => !card.front.trim() || !card.back.trim())
    ) {
      showAlert(
        "Complete every question and answer before saving.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
      document
        .querySelector<HTMLTextAreaElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }

    if (!isLoaded || !user?.id) {
      showAlert(
        "Sign in again to save this deck.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
      return;
    }

    setSaveState("saving");
    try {
      const response = await fetch("/api/firestore/save_flashcards/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subject: subject.trim(),
          flashcards: flashcards.map(({ front, back }) => ({
            front: front.trim(),
            back: back.trim(),
          })),
        }),
      });

      if (!response.ok) throw new Error("Save failed");

      setSaveState("saved");
      showAlert(
        "Deck saved. Taking you to your library…",
        "success",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
      window.setTimeout(() => router.push("/home"), 650);
    } catch {
      setSaveState("idle");
      showAlert(
        "Your changes are still here, but the deck wasn’t saved. Try again.",
        "error",
        setAlertMessage,
        setOpenAlert,
        setAlertType,
      );
    }
  };

  const subjectInvalid = showValidation && !subject.trim();

  return (
    <>
      <div className="page-shell grow">
        <div className="mx-auto max-w-5xl">
          <header>
            <p className="text-sm font-semibold text-brand-700">
              AI-assisted creation
            </p>
            <h1 className="page-heading mt-2">Build a focused study deck</h1>
            <p className="page-description mt-3">
              Start with a topic, then review every generated card before it
              enters your library. Nothing is saved until you approve it.
            </p>
          </header>

          <section
            className="surface-card mt-8 overflow-hidden"
            aria-labelledby="generator-heading"
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-control bg-brand-50 text-brand-700">
                  <HiOutlineSparkles className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="generator-heading"
                    className="text-lg font-bold tracking-[-0.02em] text-ink-900"
                  >
                    Describe your deck
                  </h2>
                  <p className="mt-0.5 text-sm text-ink-500">
                    A specific topic usually produces clearer cards.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleGenerate}
              className="px-5 py-6 sm:px-6"
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_12rem]">
                <div>
                  <label htmlFor="subject" className="field-label">
                    Topic or subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(event) => {
                      setSubject(event.target.value);
                      setRequestError("");
                      setSaveState("idle");
                    }}
                    className="input-control"
                    placeholder="e.g. Photosynthesis for high school biology"
                    aria-invalid={subjectInvalid}
                    aria-describedby={
                      subjectInvalid ? "subject-error" : "subject-hint"
                    }
                    disabled={requestState === "loading"}
                    maxLength={160}
                  />
                  {subjectInvalid ? (
                    <p id="subject-error" className="field-error">
                      Enter a topic before continuing.
                    </p>
                  ) : (
                    <p id="subject-hint" className="field-hint">
                      Include the level or context when it matters.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="numberOfFlashcards" className="field-label">
                    Number of cards
                  </label>
                  <input
                    id="numberOfFlashcards"
                    type="number"
                    min={3}
                    max={30}
                    value={numberOfFlashcards}
                    onChange={(event) =>
                      setNumberOfFlashcards(Number(event.target.value))
                    }
                    className="input-control"
                    disabled={requestState === "loading"}
                  />
                  <p className="field-hint">Between 3 and 30 cards.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {flashcards.length === 0 &&
                    requestState !== "loading" && (
                      <Button
                        type="button"
                        variant="quiet"
                        className="w-full sm:w-auto"
                        onClick={addBlankCard}
                        leadingIcon={<FiEdit3 className="size-4" />}
                      >
                        Start manually
                      </Button>
                    )}
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  loading={requestState === "loading"}
                  leadingIcon={<HiOutlineSparkles className="size-4" />}
                >
                  {requestState === "loading"
                    ? "Generating"
                    : flashcards.length > 0
                      ? "New draft"
                      : "Generate cards"}
                </Button>
              </div>
            </form>

            {requestError && (
              <div
                role="alert"
                className="mx-5 mb-6 flex items-start gap-3 rounded-control border border-red-200 bg-[var(--danger-soft)] px-4 py-3 text-sm leading-6 text-red-900 sm:mx-6"
              >
                <FiAlertCircle
                  className="mt-0.5 size-5 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold">Generation paused</p>
                  <p>{requestError}</p>
                </div>
              </div>
            )}
          </section>

          {requestState === "loading" && (
            <section className="mt-8" aria-labelledby="generating-heading">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-brand-50 text-brand-700">
                  <HiOutlineSparkles
                    className="size-4 animate-pulse"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h2
                    id="generating-heading"
                    className="font-bold text-ink-900"
                  >
                    Drafting your flashcards
                  </h2>
                  <p className="text-sm text-ink-500">
                    MemFlip is creating {numberOfFlashcards} cards about{" "}
                    <span className="font-semibold">{subject.trim()}</span>.
                    This can take a moment.
                  </p>
                </div>
              </div>
              <GenerationSkeleton count={numberOfFlashcards} />
              <p className="sr-only" role="status" aria-live="polite">
                Generating flashcards. Please wait.
              </p>
            </section>
          )}

          {requestState !== "loading" &&
            (requestState === "success" || flashcards.length > 0) && (
              <section className="mt-9" aria-labelledby="draft-heading">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        id="draft-heading"
                        className="text-xl font-bold tracking-[-0.025em] text-ink-900"
                      >
                        Review your draft
                      </h2>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                        Not saved
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-ink-500">
                      Edit for accuracy and clarity. Each card needs a question
                      and an answer.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={addBlankCard}
                    leadingIcon={<FiPlus className="size-4" />}
                  >
                    Add blank card
                  </Button>
                </div>

                {lastRemoved && (
                  <div
                    role="status"
                    className="mt-5 flex items-center justify-between gap-4 rounded-control border border-[var(--border)] bg-white px-4 py-3 text-sm shadow-soft"
                  >
                    <span className="text-ink-700">Card removed from draft.</span>
                    <button
                      type="button"
                      onClick={undoRemove}
                      className="min-h-9 rounded-control px-3 font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      Undo
                    </button>
                  </div>
                )}

                {flashcards.length === 0 ? (
                  <div className="surface-card mt-5">
                    <EmptyState
                      compact
                      icon={<FiEdit3 className="size-6" />}
                      title="No draft cards left"
                      description="Add a blank card to write one manually, undo the last removal, or generate a fresh set."
                      action={
                        <Button
                          variant="secondary"
                          onClick={addBlankCard}
                          leadingIcon={<FiPlus className="size-4" />}
                        >
                          Add a card
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {flashcards.map((card, index) => {
                      const frontInvalid =
                        showValidation && !card.front.trim();
                      const backInvalid = showValidation && !card.back.trim();
                      return (
                        <article
                          key={card.id}
                          className="draft-card-enter surface-card overflow-hidden"
                          style={{
                            animationDelay: `${Math.min(index, 7) * 45}ms`,
                          }}
                        >
                          <div className="flex items-center justify-between border-b border-[var(--border)] bg-surface-subtle px-5 py-3">
                            <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500">
                              Card {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeCard(card.id)}
                              className="icon-button !size-9 hover:!border-red-200 hover:!bg-red-50 hover:!text-red-700"
                              aria-label={`Remove card ${index + 1}`}
                            >
                              <FiTrash2
                                className="size-4"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          <div className="space-y-5 p-5">
                            <div>
                              <label
                                htmlFor={`front-${card.id}`}
                                className="field-label"
                              >
                                Question or term
                              </label>
                              <AutoResizeTextarea
                                id={`front-${card.id}`}
                                value={card.front}
                                onChange={(value) =>
                                  updateCard(card.id, "front", value)
                                }
                                className="input-control resize-none overflow-hidden"
                                placeholder="What should the learner recall?"
                                aria-invalid={frontInvalid}
                              />
                              {frontInvalid && (
                                <p className="field-error">
                                  Add a question or term.
                                </p>
                              )}
                            </div>
                            <div>
                              <label
                                htmlFor={`back-${card.id}`}
                                className="field-label"
                              >
                                Answer or explanation
                              </label>
                              <AutoResizeTextarea
                                id={`back-${card.id}`}
                                value={card.back}
                                onChange={(value) =>
                                  updateCard(card.id, "back", value)
                                }
                                className="input-control resize-none overflow-hidden"
                                placeholder="Write the clearest useful answer."
                                aria-invalid={backInvalid}
                              />
                              {backInvalid && (
                                <p className="field-error">Add an answer.</p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                <div className="sticky bottom-4 z-20 mt-7 rounded-card border border-brand-100 bg-white/95 p-3 shadow-floating backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm sm:mb-0">
                    {saveState === "saved" ? (
                      <>
                        <FiCheckCircle
                          className="size-4 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span className="font-semibold text-emerald-800">
                          Saved
                        </span>
                      </>
                    ) : (
                      <>
                        <FiEdit3
                          className="size-4 text-ink-500"
                          aria-hidden="true"
                        />
                        <span className="text-ink-500">
                          {flashcards.length}{" "}
                          {flashcards.length === 1 ? "card" : "cards"} in this
                          unsaved draft
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    className="w-full sm:w-auto"
                    size="lg"
                    onClick={handleSaveFlashcards}
                    loading={saveState === "saving"}
                    disabled={flashcards.length === 0}
                    leadingIcon={<FiSave className="size-4" />}
                  >
                    {saveState === "saving"
                      ? "Saving deck"
                      : saveState === "saved"
                        ? "Deck saved"
                        : "Save to library"}
                  </Button>
                </div>
              </section>
            )}
        </div>
      </div>

      <Modal
        open={confirmRegenerate}
        onClose={() => setConfirmRegenerate(false)}
        title="Replace this draft?"
        description="Generating again will replace the cards currently in this draft. Saved decks are not affected."
        size="sm"
      >
        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end sm:p-6">
          <Button
            variant="quiet"
            onClick={() => setConfirmRegenerate(false)}
          >
            Keep editing
          </Button>
          <Button
            onClick={performGeneration}
            leadingIcon={<FiRefreshCw className="size-4" />}
          >
            Replace draft
          </Button>
        </div>
      </Modal>

      <Alert
        message={alertMessage}
        openAlert={openAlert}
        type={alertType}
      />
    </>
  );
}
