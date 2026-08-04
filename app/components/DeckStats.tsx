"use client";

import { ReviewSession } from "@/types";
import { FiBarChart2, FiClock, FiRefreshCw } from "react-icons/fi";

type ReviewSaveState = "idle" | "saving" | "saved" | "error";

const DISPLAYED_SESSIONS = 10;

const ratingLegend = [
  { score: 1 as const, label: "Forgot", color: "bg-red-400" },
  { score: 2 as const, label: "Hard", color: "bg-amber-400" },
  { score: 3 as const, label: "Good", color: "bg-brand-500" },
  { score: 4 as const, label: "Easy", color: "bg-emerald-500" },
];

function recallRate(session: ReviewSession) {
  const recalled =
    session.ratingCounts[2] +
    session.ratingCounts[3] +
    session.ratingCounts[4];
  return Math.round((recalled / session.cardCount) * 100);
}

function averageScore(session: ReviewSession) {
  const score = ratingLegend.reduce(
    (total, rating) =>
      total + rating.score * session.ratingCounts[rating.score],
    0,
  );
  return (score / session.cardCount).toFixed(1);
}

function formatRevisionDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export default function DeckStats({
  sessions,
  saveState,
  saveError,
  onRetrySave,
}: {
  sessions: ReviewSession[];
  saveState: ReviewSaveState;
  saveError: string;
  onRetrySave: () => void;
}) {
  const recentSessions = [...sessions]
    .sort((first, second) => second.completedAt - first.completedAt)
    .slice(0, DISPLAYED_SESSIONS);

  if (recentSessions.length === 0) {
    const saving = saveState === "saving";
    const failed = saveState === "error";

    return (
      <div
        className="flex min-h-[28rem] grow items-center justify-center px-5 py-12 text-center"
        aria-live="polite"
      >
        <div className="max-w-sm">
          <span
            className={`mx-auto grid size-12 place-items-center rounded-full ${
              failed
                ? "bg-red-50 text-red-700"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {saving ? (
              <FiRefreshCw
                className="size-6 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <FiBarChart2 className="size-6" aria-hidden="true" />
            )}
          </span>
          <h2 className="mt-4 text-xl font-bold tracking-[-0.025em] text-ink-900">
            {saving
              ? "Saving your first revision"
              : failed
                ? "This revision wasn’t saved"
                : "Your progress will appear here"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">
            {saving
              ? "Keep this page open for a moment. Your stats will appear here automatically."
              : failed
                ? saveError || "Check your connection, then try saving again."
                : "Complete one revision of this deck to start tracking recall and see how it changes over time."}
          </p>
          {failed && (
            <button
              type="button"
              onClick={onRetrySave}
              className="mt-5 min-h-10 rounded-control bg-brand-700 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-800"
            >
              Retry saving
            </button>
          )}
        </div>
      </div>
    );
  }

  const latest = recentSessions[0];
  const averageRecall = Math.round(
    recentSessions.reduce((total, session) => total + recallRate(session), 0) /
      recentSessions.length,
  );
  const trendSessions = [...recentSessions].reverse();

  return (
    <div className="min-h-0 grow overflow-y-auto bg-surface px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {(saveState === "saving" || saveState === "error") && (
          <div
            className={`mb-5 flex flex-col gap-3 rounded-control border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
              saveState === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-brand-100 bg-brand-50 text-brand-800"
            }`}
            role={saveState === "error" ? "alert" : "status"}
          >
            <span className="flex items-center gap-2 font-medium">
              {saveState === "saving" && (
                <FiRefreshCw
                  className="size-4 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              )}
              {saveState === "saving"
                ? "Saving your latest revision…"
                : saveError || "Your latest revision wasn’t saved."}
            </span>
            {saveState === "error" && (
              <button
                type="button"
                onClick={onRetrySave}
                className="self-start font-bold underline decoration-red-300 underline-offset-2 hover:text-red-950 sm:self-auto"
              >
                Retry saving
              </button>
            )}
          </div>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-700">
            Deck progress
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-ink-900">
            Revision stats
          </h2>
          <p className="mt-1 text-sm leading-6 text-ink-500">
            A simple view of your latest completed revisions.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-control border border-[var(--border)] bg-white p-4 shadow-soft">
            <dt className="text-xs font-semibold text-ink-500">
              Latest recall
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
              {recallRate(latest)}%
            </dd>
          </div>
          <div className="rounded-control border border-[var(--border)] bg-white p-4 shadow-soft">
            <dt className="text-xs font-semibold text-ink-500">
              Recent average
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
              {averageRecall}%
            </dd>
          </div>
          <div className="rounded-control border border-[var(--border)] bg-white p-4 shadow-soft">
            <dt className="text-xs font-semibold text-ink-500">
              Revisions tracked
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-ink-900">
              {sessions.length}
            </dd>
          </div>
        </dl>

        <section
          className="mt-6 rounded-card border border-[var(--border)] bg-white p-5 shadow-soft sm:p-6"
          aria-labelledby="recall-trend-heading"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3
              id="recall-trend-heading"
              className="text-base font-bold text-ink-900"
            >
              Recall trend
            </h3>
            <span className="text-xs text-ink-500">Oldest to newest</span>
          </div>
          <div className="mt-5 flex h-28 items-end gap-2 sm:gap-3">
            {trendSessions.map((session, index) => {
              const rate = recallRate(session);
              return (
                <div
                  key={session.id}
                  className="group flex h-full min-w-0 flex-1 items-end"
                  title={`${formatRevisionDate(session.completedAt)}: ${rate}% recalled`}
                >
                  <span className="sr-only">
                    Revision {index + 1}: {rate}% recalled.
                  </span>
                  <span
                    className="w-full rounded-t bg-brand-200 transition-colors group-hover:bg-brand-400"
                    style={{ height: `${Math.max(rate, 4)}%` }}
                    aria-hidden="true"
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[0.6875rem] font-medium text-ink-500">
            <span>{recallRate(trendSessions[0])}%</span>
            <span>{recallRate(trendSessions[trendSessions.length - 1])}%</span>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="recent-revisions-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3
                id="recent-revisions-heading"
                className="text-lg font-bold text-ink-900"
              >
                Recent revisions
              </h3>
              <p className="mt-1 text-sm text-ink-500">
                Your latest {recentSessions.length} completed
                {recentSessions.length === 1 ? " revision" : " revisions"}.
              </p>
            </div>
            <div className="hidden flex-wrap justify-end gap-x-3 gap-y-1 sm:flex">
              {ratingLegend.map((rating) => (
                <span
                  key={rating.score}
                  className="flex items-center gap-1.5 text-xs text-ink-500"
                >
                  <span
                    className={`size-2 rounded-full ${rating.color}`}
                    aria-hidden="true"
                  />
                  {rating.label}
                </span>
              ))}
            </div>
          </div>

          <ol className="mt-4 space-y-3">
            {recentSessions.map((session) => {
              const rate = recallRate(session);
              const recalled =
                session.ratingCounts[2] +
                session.ratingCounts[3] +
                session.ratingCounts[4];
              return (
                <li
                  key={session.id}
                  className="rounded-control border border-[var(--border)] bg-white p-4 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
                        <FiClock className="size-3.5" aria-hidden="true" />
                        {formatRevisionDate(session.completedAt)}
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-ink-900">
                        {recalled} of {session.cardCount} recalled
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums text-ink-900">
                        {rate}%
                      </p>
                      <p className="text-xs text-ink-500">
                        {averageScore(session)} / 4 average
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-muted"
                    aria-label={ratingLegend
                      .map(
                        (rating) =>
                          `${rating.label}: ${session.ratingCounts[rating.score]}`,
                      )
                      .join(", ")}
                  >
                    {ratingLegend.map((rating) => (
                      <span
                        key={rating.score}
                        className={rating.color}
                        style={{
                          width: `${
                            (session.ratingCounts[rating.score] /
                              session.cardCount) *
                            100
                          }%`,
                        }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[0.6875rem] text-ink-500">
                    {ratingLegend.map((rating) => (
                      <span key={rating.score}>
                        {rating.label} {session.ratingCounts[rating.score]}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
          {sessions.length > DISPLAYED_SESSIONS && (
            <p className="mt-4 text-center text-xs leading-5 text-ink-500">
              Showing the latest {DISPLAYED_SESSIONS} of {sessions.length}
              retained revisions.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
