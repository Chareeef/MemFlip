"use client";

import { useUser } from "@clerk/nextjs";
import { Flashcard } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiEdit3,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/ui/EmptyState";
import Modal from "../../../components/ui/Modal";
import {
  decodeDeckRouteId,
  encodeDeckRouteId,
} from "../../../deckRoutes";

type EditableFlashcard = Flashcard & { id: string };
type LoadState = "loading" | "ready" | "error";

function createCardId(index = 0) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${index}`;
}

function EditorSkeleton() {
  return (
    <div className="page-shell grow" aria-label="Loading deck editor">
      <div className="skeleton h-5 w-32 rounded" />
      <div className="skeleton mt-5 h-10 w-72 max-w-full rounded-lg" />
      <div className="skeleton mt-3 h-5 w-96 max-w-full rounded" />
      <div className="surface-card mt-8 p-6">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton mt-3 h-11 rounded-control" />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="surface-card p-5">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton mt-5 h-24 rounded-control" />
            <div className="skeleton mt-4 h-28 rounded-control" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditDeckPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams<{ subject: string }>();
  const deckId = decodeDeckRouteId(params.subject);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<EditableFlashcard[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [cardToRemove, setCardToRemove] = useState<string | null>(null);
  const [deleteDeckOpen, setDeleteDeckOpen] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const controller = new AbortController();
    const loadDeck = async () => {
      setLoadState("loading");
      try {
        const response = await fetch("/api/firestore/get_flashcards_set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            deckId,
            markOpened: false,
          }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Unable to load deck");

        const data: { flashcardsSet?: Flashcard[] } = await response.json();
        if (!Array.isArray(data.flashcardsSet)) {
          throw new Error("Deck data is invalid");
        }

        setTitle(deckId);
        setCards(
          data.flashcardsSet.map((card, index) => ({
            ...card,
            id: createCardId(index),
          })),
        );
        setLoadState("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLoadState("error");
      }
    };

    loadDeck();
    return () => controller.abort();
  }, [deckId, isLoaded, reloadKey, user]);

  const updateCard = (
    cardId: string,
    field: keyof Flashcard,
    value: string,
  ) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card,
      ),
    );
    setSaveError("");
  };

  const addCard = () => {
    const id = createCardId(cards.length);
    setCards((currentCards) => [
      ...currentCards,
      { id, front: "", back: "" },
    ]);
    window.setTimeout(() => {
      document.getElementById(`edit-front-${id}`)?.focus();
    }, 0);
  };

  const confirmRemoveCard = () => {
    if (!cardToRemove) return;
    setCards((currentCards) =>
      currentCards.filter((card) => card.id !== cardToRemove),
    );
    setCardToRemove(null);
    setSaveError("");
  };

  const saveDeck = async () => {
    setShowValidation(true);
    setSaveError("");
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setSaveError("Add a title before saving.");
      document.getElementById("edit-deck-title")?.focus();
      return;
    }
    if (cleanTitle.includes("/")) {
      setSaveError("Deck titles cannot contain a forward slash (/).");
      document.getElementById("edit-deck-title")?.focus();
      return;
    }
    if (
      cards.length === 0 ||
      cards.some((card) => !card.front.trim() || !card.back.trim())
    ) {
      setSaveError("Keep at least one card and complete every question and answer.");
      document
        .querySelector<HTMLTextAreaElement>('[aria-invalid="true"]')
        ?.focus();
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch("/api/firestore/update_flashcards_set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          deckId,
          title: cleanTitle,
          flashcards: cards.map(({ front, back }) => ({ front, back })),
        }),
      });
      const data: { deckId?: string; error?: string } = await response.json();
      if (!response.ok || !data.deckId) {
        throw new Error(data.error || "The deck could not be saved.");
      }

      router.push(`/decks/${encodeDeckRouteId(data.deckId)}`);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "The deck could not be saved.",
      );
      setSaving(false);
    }
  };

  const deleteDeck = async () => {
    if (!user) return;
    setDeletingDeck(true);
    setDeleteError("");

    try {
      const response = await fetch("/api/firestore/delete_flashcards_sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, deckIds: [deckId] }),
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The deck could not be deleted.");
      }
      router.push("/home");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "The deck could not be deleted.",
      );
      setDeletingDeck(false);
    }
  };

  if (!isLoaded || loadState === "loading") {
    return <EditorSkeleton />;
  }

  if (loadState === "error") {
    return (
      <div className="page-shell flex grow items-center justify-center">
        <EmptyState
          icon={<FiAlertCircle className="size-6" />}
          title="The deck editor didn’t load"
          description="Check your connection, then try opening this editor again."
          action={
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="quiet"
                onClick={() =>
                  router.push(`/decks/${encodeDeckRouteId(deckId)}`)
                }
                leadingIcon={<FiArrowLeft className="size-4" />}
              >
                Back to deck
              </Button>
              <Button
                variant="secondary"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className="page-shell grow">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              router.push(`/decks/${encodeDeckRouteId(deckId)}`)
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-control px-3 text-sm font-semibold text-ink-700 hover:bg-white"
          >
            <FiArrowLeft className="size-4" aria-hidden="true" />
            Back to deck
          </button>

          <header className="mt-5">
            <p className="text-sm font-semibold text-brand-700">Deck editor</p>
            <h1 className="page-heading mt-2">Edit your deck</h1>
            <p className="page-description mt-3">
              Update the title, questions, and answers. Changes are saved only
              when you choose Save deck.
            </p>
          </header>

          <section
            className="surface-card mt-8 p-5 sm:p-6"
            aria-labelledby="deck-details-heading"
          >
            <h2
              id="deck-details-heading"
              className="text-lg font-bold text-ink-900"
            >
              Deck details
            </h2>
            <div className="mt-5">
              <label htmlFor="edit-deck-title" className="field-label">
                Title
              </label>
              <input
                id="edit-deck-title"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setSaveError("");
                }}
                className="input-control"
                maxLength={160}
                aria-invalid={
                  showValidation &&
                  (!title.trim() || title.trim().includes("/"))
                }
              />
              <p className="field-hint">
                Up to 160 characters. Forward slashes are not supported.
              </p>
            </div>
          </section>

          <section className="mt-8" aria-labelledby="edit-cards-heading">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="edit-cards-heading"
                  className="text-xl font-bold tracking-[-0.025em] text-ink-900"
                >
                  Cards
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {cards.length} {cards.length === 1 ? "card" : "cards"} in this
                  deck
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={addCard}
                leadingIcon={<FiPlus className="size-4" />}
              >
                Add card
              </Button>
            </div>

            {cards.length === 0 ? (
              <div className="surface-card mt-5">
                <EmptyState
                  compact
                  icon={<FiEdit3 className="size-6" />}
                  title="This deck needs a card"
                  description="Add at least one question and answer before saving."
                  action={
                    <Button
                      variant="secondary"
                      onClick={addCard}
                      leadingIcon={<FiPlus className="size-4" />}
                    >
                      Add a card
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {cards.map((card, index) => {
                  const frontInvalid =
                    showValidation && !card.front.trim();
                  const backInvalid = showValidation && !card.back.trim();

                  return (
                    <article
                      key={card.id}
                      className="surface-card overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-[var(--border)] bg-surface-subtle px-5 py-3">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500">
                          Card {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCardToRemove(card.id)}
                          className="icon-button !size-9 hover:!border-red-200 hover:!bg-red-50 hover:!text-red-700"
                          aria-label={`Delete card ${index + 1}`}
                        >
                          <FiTrash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="space-y-5 p-5">
                        <div>
                          <label
                            htmlFor={`edit-front-${card.id}`}
                            className="field-label"
                          >
                            Question or term
                          </label>
                          <textarea
                            id={`edit-front-${card.id}`}
                            value={card.front}
                            onChange={(event) =>
                              updateCard(card.id, "front", event.target.value)
                            }
                            className="input-control min-h-28 resize-y"
                            rows={4}
                            aria-invalid={frontInvalid}
                          />
                          {frontInvalid && (
                            <p className="field-error">Add a question or term.</p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-back-${card.id}`}
                            className="field-label"
                          >
                            Answer or explanation
                          </label>
                          <textarea
                            id={`edit-back-${card.id}`}
                            value={card.back}
                            onChange={(event) =>
                              updateCard(card.id, "back", event.target.value)
                            }
                            className="input-control min-h-32 resize-y"
                            rows={5}
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

            {saveError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-control border border-red-200 bg-[var(--danger-soft)] px-4 py-3 text-sm leading-6 text-red-900"
              >
                <FiAlertCircle
                  className="mt-0.5 size-5 shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <p>{saveError}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-6">
              <Button
                size="lg"
                onClick={saveDeck}
                loading={saving}
                leadingIcon={<FiSave className="size-4" />}
              >
                Save deck
              </Button>
            </div>
          </section>

          <section className="mt-10 rounded-card border border-red-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-red-900">Delete deck</h2>
            <p className="mt-2 text-sm leading-6 text-ink-500">
              Permanently remove this deck and all of its cards.
            </p>
            <Button
              className="mt-5"
              variant="danger"
              onClick={() => {
                setDeleteError("");
                setDeleteDeckOpen(true);
              }}
              leadingIcon={<FiTrash2 className="size-4" />}
            >
              Delete deck
            </Button>
          </section>
        </div>
      </div>

      <Modal
        open={cardToRemove !== null}
        onClose={() => setCardToRemove(null)}
        title="Delete this card?"
        description="This card will be removed from the draft. The change becomes permanent when you save the deck."
        size="sm"
      >
        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end sm:p-6">
          <Button variant="quiet" onClick={() => setCardToRemove(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmRemoveCard}
            leadingIcon={<FiTrash2 className="size-4" />}
          >
            Delete card
          </Button>
        </div>
      </Modal>

      <Modal
        open={deleteDeckOpen}
        onClose={() => {
          if (!deletingDeck) setDeleteDeckOpen(false);
        }}
        title="Delete this deck?"
        description={`“${deckId}” and all of its cards will be permanently deleted. This cannot be undone.`}
        size="sm"
      >
        <div className="p-5 sm:p-6">
          {deleteError && (
            <p className="mb-4 text-sm font-medium text-red-700" role="alert">
              {deleteError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="quiet"
              disabled={deletingDeck}
              onClick={() => setDeleteDeckOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deletingDeck}
              onClick={deleteDeck}
              leadingIcon={<FiTrash2 className="size-4" />}
            >
              Delete deck
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
