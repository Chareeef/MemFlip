"use client";

import { useUser } from "@clerk/nextjs";
import { DeckSummary } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckSquare,
  FiEdit2,
  FiLayers,
  FiMoreVertical,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import { encodeDeckRouteId, getDeckViewPath } from "../deckRoutes";

type LoadState = "loading" | "ready" | "error";
type SortOrder = "opened" | "created" | "az" | "za";

function LibrarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="surface-card min-h-40 p-5"
        >
          <div className="skeleton h-10 w-10 rounded-control" />
          <div className="skeleton mt-6 h-5 w-2/3 rounded" />
          <div className="skeleton mt-3 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("opened");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(
    new Set(),
  );
  const [decksToDelete, setDecksToDelete] = useState<DeckSummary[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const openMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const controller = new AbortController();
    const getSubjects = async () => {
      setLoadState("loading");
      try {
        const response = await fetch("/api/firestore/get_flashcards_subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Unable to load decks");

        const data: { decks?: DeckSummary[] } = await response.json();
        setDecks(Array.isArray(data.decks) ? data.decks : []);
        setLoadState("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLoadState("error");
      }
    };

    getSubjects();
    return () => controller.abort();
  }, [isLoaded, reloadKey, user]);

  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = (event: MouseEvent) => {
      if (
        openMenuRef.current &&
        !openMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMenuId(null);
      }
    };
    const closeMenuWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenuId(null);
    };

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeMenuWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeMenuWithEscape);
    };
  }, [openMenuId]);

  const filteredDecks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const getTimestamp = (deck: DeckSummary) => {
      if (sortOrder === "opened") {
        return deck.lastOpenedAt ?? Number.NEGATIVE_INFINITY;
      }
      return deck.createdAt ?? Number.NEGATIVE_INFINITY;
    };

    return decks
      .filter((deck) =>
        deck.subject.toLocaleLowerCase().includes(query),
      )
      .sort((first, second) => {
        if (sortOrder === "az") {
          return first.subject.localeCompare(second.subject);
        }
        if (sortOrder === "za") {
          return second.subject.localeCompare(first.subject);
        }

        const dateDifference = getTimestamp(second) - getTimestamp(first);
        return dateDifference || first.subject.localeCompare(second.subject);
      });
  }, [decks, search, sortOrder]);

  const toggleDeckSelection = (deckId: string) => {
    setSelectedDeckIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(deckId)) {
        nextIds.delete(deckId);
      } else {
        nextIds.add(deckId);
      }
      return nextIds;
    });
  };

  const stopSelecting = () => {
    setSelectionMode(false);
    setSelectedDeckIds(new Set());
  };

  const requestDeckDeletion = (decksForDeletion: DeckSummary[]) => {
    setOpenMenuId(null);
    setDeleteError("");
    setDecksToDelete(decksForDeletion);
  };

  const deleteSelectedDecks = async () => {
    if (!user || decksToDelete.length === 0) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const deckIds = decksToDelete.map((deck) => deck.id);
      const response = await fetch("/api/firestore/delete_flashcards_sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, deckIds }),
      });
      const data: { error?: string } = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "The decks could not be deleted.");
      }

      const deletedIds = new Set(deckIds);
      setDecks((currentDecks) =>
        currentDecks.filter((deck) => !deletedIds.has(deck.id)),
      );
      setDecksToDelete([]);
      setSelectedDeckIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "The decks could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="page-shell grow" aria-label="Loading your library">
        <div className="skeleton h-9 w-64 rounded-lg" />
        <div className="skeleton mt-3 h-5 w-96 max-w-full rounded" />
        <div className="mt-10">
          <LibrarySkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell flex grow items-center justify-center">
        <EmptyState
          icon={<FiLayers className="size-6" />}
          title="Sign in to open your library"
          description="Your saved decks are connected to your MemFlip account."
          action={
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 items-center rounded-control bg-brand-600 px-4 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
          }
        />
      </div>
    );
  }

  const firstName = user.firstName || user.fullName || "there";
  const allDecksSelected =
    decks.length > 0 && decks.every((deck) => selectedDeckIds.has(deck.id));

  return (
    <>
      <div className="page-shell grow">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src={user.imageUrl}
              alt=""
              width={56}
              height={56}
              className="size-14 rounded-full border-2 border-white object-cover shadow-card"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-700">
                Your library
              </p>
              <h1 className="page-heading mt-1 truncate">
                Welcome back, {firstName}
              </h1>
            </div>
          </div>
          <Link
            href="/generate_flashcards"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-control bg-brand-600 px-5 text-sm font-semibold text-white shadow-soft transition-[background-color,transform] hover:bg-brand-700 active:translate-y-px"
          >
            <FiPlus className="size-4" aria-hidden="true" />
            Create a deck
          </Link>
        </section>

        <section
          className="surface-card mt-9 overflow-hidden"
          aria-labelledby="decks-heading"
        >
          <div className="flex flex-col gap-5 border-b border-[var(--border)] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="decks-heading"
                className="text-xl font-bold tracking-[-0.025em] text-ink-900"
              >
                Saved decks
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                {loadState === "ready"
                  ? `${decks.length} ${
                      decks.length === 1 ? "deck" : "decks"
                    } ready to study`
                  : "Your study collection"}
              </p>
            </div>

            {decks.length > 0 && loadState === "ready" && (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
                <label className="relative block min-w-0 sm:w-72">
                  <span className="sr-only">Search decks</span>
                  <FiSearch
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="input-control !pl-9"
                    placeholder="Search your decks"
                  />
                </label>
                <label>
                  <span className="sr-only">Sort decks</span>
                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as SortOrder)
                    }
                    className="input-control sm:w-40"
                  >
                    <option value="opened">Last opened</option>
                    <option value="created">Date created</option>
                    <option value="az">Name A–Z</option>
                    <option value="za">Name Z–A</option>
                  </select>
                </label>
                <Button
                  size="sm"
                  variant={selectionMode ? "secondary" : "quiet"}
                  onClick={() => {
                    if (selectionMode) {
                      stopSelecting();
                    } else {
                      setOpenMenuId(null);
                      setSelectionMode(true);
                    }
                  }}
                  leadingIcon={
                    selectionMode ? (
                      <FiX className="size-4" />
                    ) : (
                      <FiCheckSquare className="size-4" />
                    )
                  }
                >
                  {selectionMode ? "Cancel" : "Select"}
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {selectionMode && loadState === "ready" && decks.length > 0 && (
              <div className="mb-5 flex flex-col gap-3 rounded-control border border-brand-200 bg-brand-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-brand-900">
                  {selectedDeckIds.size}{" "}
                  {selectedDeckIds.size === 1 ? "deck" : "decks"} selected
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() =>
                      setSelectedDeckIds(
                        allDecksSelected
                          ? new Set()
                          : new Set(decks.map((deck) => deck.id)),
                      )
                    }
                  >
                    {allDecksSelected ? "Clear" : "Select all"}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={selectedDeckIds.size === 0}
                    onClick={() =>
                      requestDeckDeletion(
                        decks.filter((deck) =>
                          selectedDeckIds.has(deck.id),
                        ),
                      )
                    }
                    leadingIcon={<FiTrash2 className="size-4" />}
                  >
                    Delete selected
                  </Button>
                </div>
              </div>
            )}

            {loadState === "loading" && <LibrarySkeleton />}

            {loadState === "error" && (
              <EmptyState
                icon={<FiRefreshCw className="size-6" />}
                title="Your library didn’t load"
                description="Check your connection, then try once more. Your saved decks are safe."
                action={
                  <Button
                    variant="secondary"
                    onClick={() => setReloadKey((key) => key + 1)}
                    leadingIcon={<FiRefreshCw className="size-4" />}
                  >
                    Try again
                  </Button>
                }
              />
            )}

            {loadState === "ready" && decks.length === 0 && (
              <EmptyState
                icon={<FiLayers className="size-6" />}
                title="Create your first deck"
                description="Choose a topic and MemFlip will help you turn it into focused, editable flashcards."
                action={
                  <Link
                    href="/generate_flashcards"
                    className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    <FiPlus className="size-4" aria-hidden="true" />
                    Generate flashcards
                  </Link>
                }
              />
            )}

            {loadState === "ready" &&
              decks.length > 0 &&
              filteredDecks.length === 0 && (
                <EmptyState
                  compact
                  icon={<FiSearch className="size-6" />}
                  title="No matching decks"
                  description={`We couldn’t find a deck matching “${search.trim()}”. Try a shorter or different search.`}
                  action={
                    <Button variant="quiet" onClick={() => setSearch("")}>
                      Clear search
                    </Button>
                  }
                />
              )}

            {loadState === "ready" && filteredDecks.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDecks.map((deck) => {
                  const selected = selectedDeckIds.has(deck.id);
                  const menuOpen = openMenuId === deck.id;

                  return (
                  <article
                    key={deck.id}
                    className={`group relative min-h-40 rounded-card border bg-surface-raised shadow-soft transition-[border-color,box-shadow,transform] duration-150 ease-product ${
                      selected
                        ? "border-brand-500 ring-2 ring-brand-100"
                        : "border-[var(--border)] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
                    } ${menuOpen ? "z-30" : ""}`}
                  >
                    {selectionMode ? (
                      <button
                        type="button"
                        onClick={() => toggleDeckSelection(deck.id)}
                        className="absolute inset-0 z-10 rounded-card"
                        aria-pressed={selected}
                        aria-label={`${selected ? "Deselect" : "Select"} ${
                          deck.subject
                        }`}
                      />
                    ) : (
                      <Link
                        href={getDeckViewPath(deck.id, "study")}
                        className="absolute inset-0 z-10 rounded-card"
                        aria-label={`Study ${deck.subject}`}
                      />
                    )}

                    <div className="pointer-events-none relative z-20 flex min-h-40 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        {selectionMode ? (
                          <button
                            type="button"
                            onClick={() => toggleDeckSelection(deck.id)}
                            className={`pointer-events-auto grid size-10 place-items-center rounded-control border ${
                              selected
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-[var(--border-strong)] bg-white text-transparent"
                            }`}
                            aria-label={`${selected ? "Deselect" : "Select"} ${
                              deck.subject
                            }`}
                          >
                            <FiCheckSquare
                              className="size-5"
                              aria-hidden="true"
                            />
                          </button>
                        ) : (
                          <span className="grid size-10 place-items-center rounded-control bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                            <FiBookOpen
                              className="size-5"
                              aria-hidden="true"
                            />
                          </span>
                        )}

                        {!selectionMode && (
                          <div
                            ref={menuOpen ? openMenuRef : undefined}
                            className="pointer-events-auto relative"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((currentId) =>
                                  currentId === deck.id ? null : deck.id,
                                )
                              }
                              className="icon-button !size-9 bg-white/80"
                              aria-label={`More options for ${deck.subject}`}
                              aria-haspopup="menu"
                              aria-expanded={menuOpen}
                            >
                              <FiMoreVertical
                                className="size-5"
                                aria-hidden="true"
                              />
                            </button>
                            {menuOpen && (
                              <div
                                role="menu"
                                className="absolute right-0 top-11 z-40 w-44 overflow-hidden rounded-control border border-[var(--border)] bg-white p-1.5 shadow-floating"
                              >
                                <Link
                                  href={`/decks/${encodeDeckRouteId(
                                    deck.id,
                                  )}/edit`}
                                  role="menuitem"
                                  className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink-700 hover:bg-surface-subtle hover:text-ink-900"
                                >
                                  <FiEdit2
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => requestDeckDeletion([deck])}
                                  className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"
                                >
                                  <FiTrash2
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="mt-6 line-clamp-2 break-words text-lg font-bold leading-6 tracking-[-0.02em] text-ink-900">
                        {deck.subject}
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-xs font-medium text-ink-500">
                        {selectionMode ? (
                          selected ? (
                            "Selected"
                          ) : (
                            "Select this deck"
                          )
                        ) : (
                          <>
                            Study
                            <FiArrowRight
                              className="size-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </span>
                    </div>
                  </article>
                );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <Modal
        open={decksToDelete.length > 0}
        onClose={() => {
          if (!deleting) setDecksToDelete([]);
        }}
        title={
          decksToDelete.length === 1
            ? "Delete this deck?"
            : `Delete ${decksToDelete.length} decks?`
        }
        description={
          decksToDelete.length === 1
            ? `“${decksToDelete[0]?.subject}” and all of its cards will be permanently deleted.`
            : "The selected decks and all of their cards will be permanently deleted."
        }
        size="sm"
      >
        <div className="p-5 sm:p-6">
          <p className="text-sm leading-6 text-ink-500">
            This action cannot be undone.
          </p>
          {deleteError && (
            <p className="mt-3 text-sm font-medium text-red-700" role="alert">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="quiet"
              disabled={deleting}
              onClick={() => setDecksToDelete([])}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={deleteSelectedDecks}
              leadingIcon={<FiTrash2 className="size-4" />}
            >
              {decksToDelete.length === 1
                ? "Delete deck"
                : "Delete decks"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
