"use client";

import { useUser } from "@clerk/nextjs";
import { Flashcard } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";
import Alert, { AlertType } from "../components/Alert";
import StudySession from "../components/StudySession";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { showAlert } from "../utils";

type LoadState = "loading" | "ready" | "error";
type SortOrder = "az" | "za";

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
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("az");
  const [openedFlashcards, setOpenedFlashcards] = useState<Flashcard[]>([]);
  const [openedSubject, setOpenedSubject] = useState("");
  const [studyOpen, setStudyOpen] = useState(false);
  const [openingSubject, setOpeningSubject] = useState<string | null>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alert, setAlert] = useState("");
  const [alertType, setAlertType] = useState<AlertType>("");

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

        const data: { subjects?: string[] } = await response.json();
        setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
        setLoadState("ready");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setLoadState("error");
      }
    };

    getSubjects();
    return () => controller.abort();
  }, [isLoaded, reloadKey, user]);

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return subjects
      .filter((subject) => subject.toLocaleLowerCase().includes(query))
      .sort((first, second) =>
        sortOrder === "az"
          ? first.localeCompare(second)
          : second.localeCompare(first),
      );
  }, [search, sortOrder, subjects]);

  const openFlashcardsSet = async (subject: string) => {
    if (!user || openingSubject) return;
    setOpeningSubject(subject);

    try {
      const response = await fetch("/api/firestore/get_flashcards_set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, subject }),
      });

      if (!response.ok) throw new Error("Unable to load deck");

      const data: { flashcardsSet?: Flashcard[] } = await response.json();
      if (!Array.isArray(data.flashcardsSet) || data.flashcardsSet.length === 0) {
        showAlert(
          "This deck does not contain any cards yet.",
          "info",
          setAlert,
          setOpenAlert,
          setAlertType,
        );
        return;
      }

      setOpenedSubject(subject);
      setOpenedFlashcards(data.flashcardsSet);
      setStudyOpen(true);
    } catch {
      showAlert(
        "We couldn’t open that deck. Check your connection and try again.",
        "error",
        setAlert,
        setOpenAlert,
        setAlertType,
      );
    } finally {
      setOpeningSubject(null);
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
                  ? `${subjects.length} ${
                      subjects.length === 1 ? "deck" : "decks"
                    } ready to study`
                  : "Your study collection"}
              </p>
            </div>

            {subjects.length > 0 && loadState === "ready" && (
              <div className="flex flex-col gap-3 sm:flex-row">
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
                    <option value="az">Name A–Z</option>
                    <option value="za">Name Z–A</option>
                  </select>
                </label>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
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

            {loadState === "ready" && subjects.length === 0 && (
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
              subjects.length > 0 &&
              filteredSubjects.length === 0 && (
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

            {loadState === "ready" && filteredSubjects.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map((subject) => {
                  const loading = openingSubject === subject;
                  return (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => openFlashcardsSet(subject)}
                      disabled={openingSubject !== null}
                      className="group relative flex min-h-40 flex-col rounded-card border border-[var(--border)] bg-surface-raised p-5 text-left shadow-soft transition-[border-color,box-shadow,transform,opacity] duration-150 ease-product hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card active:translate-y-0 disabled:opacity-65"
                      aria-label={`Study ${subject}`}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="grid size-10 place-items-center rounded-control bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                          <FiBookOpen className="size-5" aria-hidden="true" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500">
                          {loading ? (
                            <>
                              <FiRefreshCw
                                className="size-3.5 animate-spin"
                                aria-hidden="true"
                              />
                              Opening
                            </>
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
                      </span>
                      <span className="mt-6 line-clamp-2 break-words text-lg font-bold leading-6 tracking-[-0.02em] text-ink-900">
                        {subject}
                      </span>
                      <span className="mt-2 text-xs font-medium text-ink-500">
                        Saved deck · Ready to review
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <StudySession
        subject={openedSubject}
        flashcards={openedFlashcards}
        open={studyOpen}
        onClose={() => setStudyOpen(false)}
      />
      <Alert message={alert} openAlert={openAlert} type={alertType} />
    </>
  );
}
