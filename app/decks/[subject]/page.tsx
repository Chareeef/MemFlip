"use client";

import { useUser } from "@clerk/nextjs";
import {
  Flashcard,
  MAX_REVIEW_HISTORY,
  ReviewSession,
  ReviewSessionDraft,
} from "@/types";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiBookOpen,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import StudySession from "../../components/StudySession";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import {
  decodeDeckRouteId,
  encodeDeckRouteId,
  getDeckViewFromPath,
  getDeckViewPath,
} from "../../deckRoutes";

type LoadState = "loading" | "ready" | "empty" | "error";

function DeckSkeleton() {
  return (
    <div
      className="flex min-h-[calc(100svh-8rem)] grow flex-col bg-white"
      aria-label="Opening deck"
    >
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="skeleton size-11 rounded-control" />
        <div>
          <div className="skeleton h-6 w-52 max-w-[60vw] rounded" />
          <div className="skeleton mt-2 h-4 w-28 rounded" />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl grow flex-col justify-center px-4 py-8">
        <div className="skeleton min-h-80 rounded-card" />
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-11 rounded-control" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DeckPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ subject: string }>();
  const deckId = decodeDeckRouteId(params.subject);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [reviewHistory, setReviewHistory] = useState<ReviewSession[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [activeView, setActiveView] = useState(() =>
    getDeckViewFromPath(pathname),
  );

  useEffect(() => {
    const syncViewFromHistory = () => {
      setActiveView(getDeckViewFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", syncViewFromHistory);
    return () => window.removeEventListener("popstate", syncViewFromHistory);
  }, []);

  useEffect(() => {
    const routeId = encodeDeckRouteId(deckId);
    if (pathname === `/decks/${routeId}`) {
      window.history.replaceState(null, "", getDeckViewPath(deckId, "study"));
      setActiveView("study");
    } else {
      setActiveView(getDeckViewFromPath(pathname));
    }
  }, [deckId, pathname]);

  const changeView = useCallback(
    (view: typeof activeView) => {
      if (view === activeView) return;
      window.history.pushState(null, "", getDeckViewPath(deckId, view));
      setActiveView(view);
    },
    [activeView, deckId],
  );

  useEffect(() => {
    if (!isLoaded || !user) return;

    const controller = new AbortController();
    const openDeck = async () => {
      setLoadState("loading");
      try {
        const response = await fetch("/api/firestore/get_flashcards_set", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, deckId }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to open deck");

        const data: {
          flashcardsSet?: Flashcard[];
          reviewHistory?: ReviewSession[];
        } = await response.json();
        if (
          !Array.isArray(data.flashcardsSet) ||
          data.flashcardsSet.length === 0
        ) {
          setFlashcards([]);
          setLoadState("empty");
          return;
        }

        setFlashcards(data.flashcardsSet);
        setReviewHistory(
          Array.isArray(data.reviewHistory) ? data.reviewHistory : [],
        );
        setLoadState("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLoadState("error");
      }
    };

    openDeck();
    return () => controller.abort();
  }, [deckId, isLoaded, reloadKey, user]);

  const saveCompletedReview = useCallback(
    async (draft: ReviewSessionDraft): Promise<ReviewSession> => {
      if (!user) throw new Error("Sign in again to save this revision.");

      const response = await fetch("/api/firestore/save_review_session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          deckId,
          sessionId: draft.id,
          cardCount: draft.cardCount,
          ratingCounts: draft.ratingCounts,
        }),
      });
      const data: { session?: ReviewSession; error?: string } =
        await response.json();
      if (!response.ok || !data.session) {
        const saveError = new Error(
          data.error || "Your revision could not be saved.",
        ) as Error & { status?: number };
        saveError.status = response.status;
        throw saveError;
      }
      const savedSession = data.session;

      setReviewHistory((currentHistory) => {
        if (currentHistory.some((session) => session.id === savedSession.id)) {
          return currentHistory;
        }
        return [...currentHistory, savedSession].slice(-MAX_REVIEW_HISTORY);
      });
      return savedSession;
    },
    [deckId, user],
  );

  const deleteDeck = async () => {
    if (!user) return;
    setDeleting(true);
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
      setDeleting(false);
    }
  };

  if (!isLoaded || loadState === "loading") {
    return <DeckSkeleton />;
  }

  if (loadState === "ready" && user) {
    return (
      <>
        <StudySession
          subject={deckId}
          flashcards={flashcards}
          reviewHistory={reviewHistory}
          onSaveReviewSession={saveCompletedReview}
          pendingReviewStorageKey={`memflip:pending-review:${user.id}:${deckId}`}
          mode={activeView}
          onModeChange={changeView}
          onClose={() => router.push("/home")}
          onEdit={() =>
            router.push(`/decks/${encodeDeckRouteId(deckId)}/edit`)
          }
          onDelete={() => {
            setDeleteError("");
            setDeleteOpen(true);
          }}
        />
        <Modal
          open={deleteOpen}
          onClose={() => {
            if (!deleting) setDeleteOpen(false);
          }}
          title="Delete this deck?"
          description={`“${deckId}” and all of its cards will be permanently deleted.`}
          size="sm"
        >
          <div className="p-5 sm:p-6">
            <p className="text-sm leading-6 text-ink-500">
              This action cannot be undone.
            </p>
            {deleteError && (
              <p
                className="mt-3 text-sm font-medium text-red-700"
                role="alert"
              >
                {deleteError}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="quiet"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleting}
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

  return (
    <div className="page-shell flex grow items-center justify-center">
      <EmptyState
        icon={
          loadState === "empty" ? (
            <FiBookOpen className="size-6" />
          ) : (
            <FiRefreshCw className="size-6" />
          )
        }
        title={
          loadState === "empty"
            ? "This deck is empty"
            : "This deck didn’t open"
        }
        description={
          loadState === "empty"
            ? "There are no cards in this deck yet."
            : "Check your connection, then try opening the deck again."
        }
        action={
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              variant="quiet"
              onClick={() => router.push("/home")}
              leadingIcon={<FiArrowLeft className="size-4" />}
            >
              Back to library
            </Button>
            {loadState === "error" && (
              <Button
                variant="secondary"
                onClick={() => setReloadKey((key) => key + 1)}
                leadingIcon={<FiRefreshCw className="size-4" />}
              >
                Try again
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
