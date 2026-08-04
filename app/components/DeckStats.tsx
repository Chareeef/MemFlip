"use client";

import { ReviewSession } from "@/types";
import { FiBarChart2, FiClock, FiRefreshCw } from "react-icons/fi";
import { useState } from "react";

type ReviewSaveState = "idle" | "saving" | "saved" | "error";

const DISPLAYED_SESSIONS = 10;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TREND_CHART_WIDTH = 640;
const TREND_CHART_HEIGHT = 206;
const TREND_CHART_PADDING = { top: 16, right: 12, bottom: 38, left: 36 };
const TREND_POINT_GAP = 14;

const trendPeriods = [
  { value: "day", label: "1 day", days: 1, tickCount: 5 },
  { value: "week", label: "1 week", days: 7, tickCount: 4 },
  { value: "month", label: "1 month", days: 30, tickCount: 5 },
  { value: "quarter", label: "3 months", days: 90, tickCount: 4 },
] as const;

type TrendPeriod = (typeof trendPeriods)[number]["value"];

const ratingLegend = [
  {
    score: 1 as const,
    weight: 0,
    label: "Forgot",
    color: "bg-red-400",
    tileColor: "border-red-200 bg-red-50",
  },
  {
    score: 2 as const,
    weight: 1,
    label: "Hard",
    color: "bg-amber-400",
    tileColor: "border-amber-200 bg-amber-50",
  },
  {
    score: 3 as const,
    weight: 2,
    label: "Good",
    color: "bg-brand-500",
    tileColor: "border-brand-100 bg-brand-50",
  },
  {
    score: 4 as const,
    weight: 3,
    label: "Easy",
    color: "bg-emerald-500",
    tileColor: "border-emerald-200 bg-emerald-50",
  },
];

function recallRate(session: ReviewSession) {
  const earnedPoints = ratingLegend.reduce(
    (total, rating) =>
      total + rating.weight * session.ratingCounts[rating.score],
    0,
  );
  const availablePoints = session.cardCount * 3;
  return availablePoints === 0
    ? 0
    : Math.round((earnedPoints / availablePoints) * 100);
}

function formatRevisionDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function formatTrendTick(timestamp: number, period: TrendPeriod) {
  return new Intl.DateTimeFormat(
    undefined,
    period === "day"
      ? { hour: "numeric" }
      : period === "week"
        ? { weekday: "short", day: "numeric" }
        : { month: "short", day: "numeric" },
  ).format(new Date(timestamp));
}

function formatTrendTooltipDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(timestamp),
  );
}

function formatTrendTooltipTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(
    new Date(timestamp),
  );
}

function spreadCrowdedPoints(idealXs: number[], left: number, right: number) {
  if (idealXs.length < 2) return idealXs;

  const gap = Math.min(
    TREND_POINT_GAP,
    (right - left) / (idealXs.length - 1),
  );
  const adjustedXs = [...idealXs];

  for (let index = 1; index < adjustedXs.length; index += 1) {
    adjustedXs[index] = Math.max(
      adjustedXs[index],
      adjustedXs[index - 1] + gap,
    );
  }

  if (adjustedXs[adjustedXs.length - 1] > right) {
    adjustedXs[adjustedXs.length - 1] = right;
    for (let index = adjustedXs.length - 2; index >= 0; index -= 1) {
      adjustedXs[index] = Math.min(
        adjustedXs[index],
        adjustedXs[index + 1] - gap,
      );
    }
  }

  if (adjustedXs[0] < left) {
    adjustedXs[0] = left;
    for (let index = 1; index < adjustedXs.length; index += 1) {
      adjustedXs[index] = Math.max(
        adjustedXs[index],
        adjustedXs[index - 1] + gap,
      );
    }
  }

  return adjustedXs;
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
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>("week");
  const [hoveredTrendPointId, setHoveredTrendPointId] = useState<string | null>(
    null,
  );
  const [selectedTrendPointId, setSelectedTrendPointId] = useState<
    string | null
  >(null);
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
  const selectedTrendPeriod = trendPeriods.find(
    (period) => period.value === trendPeriod,
  )!;
  const trendEnd = Date.now();
  const trendCutoff = trendEnd - selectedTrendPeriod.days * DAY_IN_MS;
  const trendSessions = sessions
    .filter((session) => session.completedAt >= trendCutoff)
    .sort((first, second) => first.completedAt - second.completedAt);
  const chartPlotWidth =
    TREND_CHART_WIDTH -
    TREND_CHART_PADDING.left -
    TREND_CHART_PADDING.right;
  const chartPlotHeight =
    TREND_CHART_HEIGHT -
    TREND_CHART_PADDING.top -
    TREND_CHART_PADDING.bottom;
  const idealTrendPoints = trendSessions.map((session) => {
    const rate = recallRate(session);
    const x =
      TREND_CHART_PADDING.left +
      ((session.completedAt - trendCutoff) / (trendEnd - trendCutoff)) *
        chartPlotWidth;
    const y =
      TREND_CHART_PADDING.top + (1 - rate / 100) * chartPlotHeight;
    return { session, rate, x, y };
  });
  const adjustedTrendXs = spreadCrowdedPoints(
    idealTrendPoints.map((point) => point.x),
    TREND_CHART_PADDING.left,
    TREND_CHART_WIDTH - TREND_CHART_PADDING.right,
  );
  const trendPoints = idealTrendPoints.map((point, index) => ({
    ...point,
    x: adjustedTrendXs[index],
  }));
  const trendTicks = Array.from(
    { length: selectedTrendPeriod.tickCount },
    (_, index) => {
      const progress = index / (selectedTrendPeriod.tickCount - 1);
      return {
        timestamp: trendCutoff + progress * (trendEnd - trendCutoff),
        x: TREND_CHART_PADDING.left + progress * chartPlotWidth,
      };
    },
  );
  const activeTrendPoint = trendPoints.find(
    (point) =>
      point.session.id ===
      (hoveredTrendPointId ?? selectedTrendPointId),
  );

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
          <div className="mt-3 rounded-control border border-[var(--border)] bg-white p-3 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500">
              Weighted recall
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ratingLegend.map((rating) => (
                <div
                  key={rating.score}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-2 ${rating.tileColor}`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${rating.color}`}
                    aria-hidden="true"
                  >
                    {rating.weight}
                  </span>
                  <span className="text-xs font-semibold text-ink-700">
                    {rating.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3
                id="recall-trend-heading"
                className="text-base font-bold text-ink-900"
              >
                Recall trend
              </h3>
              <p className="mt-1 text-xs text-ink-500">
                Each dot is one revision.
              </p>
            </div>
            <div
              className="inline-flex self-start rounded-control bg-surface-muted p-1"
              aria-label="Recall trend time period"
            >
              {trendPeriods.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => {
                    setTrendPeriod(period.value);
                    setHoveredTrendPointId(null);
                    setSelectedTrendPointId(null);
                  }}
                  aria-pressed={trendPeriod === period.value}
                  className={`min-h-8 rounded-md px-2.5 text-xs font-semibold transition-colors ${
                    trendPeriod === period.value
                      ? "bg-white text-brand-800 shadow-sm"
                      : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          {trendPoints.length === 0 ? (
            <div className="mt-5 grid min-h-40 place-items-center rounded-control bg-surface-muted px-6 text-center">
              <p className="text-sm text-ink-500">
                No revisions in the last {selectedTrendPeriod.label}.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 overflow-x-auto pb-1">
                <svg
                  className="h-auto w-full min-w-[36rem] overflow-visible"
                  viewBox={`0 0 ${TREND_CHART_WIDTH} ${TREND_CHART_HEIGHT}`}
                  role="img"
                  aria-label={`Recall for ${trendPoints.length} ${
                    trendPoints.length === 1 ? "revision" : "revisions"
                  } in the last ${selectedTrendPeriod.label}`}
                >
                {trendTicks.map((tick, index) => (
                  <g key={tick.timestamp} aria-hidden="true">
                    <line
                      x1={tick.x}
                      x2={tick.x}
                      y1={TREND_CHART_PADDING.top}
                      y2={TREND_CHART_HEIGHT - TREND_CHART_PADDING.bottom}
                      className="stroke-slate-100"
                    />
                    <text
                      x={tick.x}
                      y={TREND_CHART_HEIGHT - 10}
                      textAnchor={
                        index === 0
                          ? "start"
                          : index === trendTicks.length - 1
                            ? "end"
                            : "middle"
                      }
                      className="fill-slate-400 text-[10px] font-medium"
                    >
                      {formatTrendTick(tick.timestamp, trendPeriod)}
                    </text>
                  </g>
                ))}
                {[0, 50, 100].map((rate) => {
                  const y =
                    TREND_CHART_PADDING.top +
                    (1 - rate / 100) * chartPlotHeight;
                  return (
                    <g key={rate} aria-hidden="true">
                      <line
                        x1={TREND_CHART_PADDING.left}
                        x2={TREND_CHART_WIDTH - TREND_CHART_PADDING.right}
                        y1={y}
                        y2={y}
                        className="stroke-slate-200"
                        strokeDasharray={rate === 50 ? "4 5" : undefined}
                      />
                      <text
                        x={TREND_CHART_PADDING.left - 7}
                        y={y + 3}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px] font-medium"
                      >
                        {rate}%
                      </text>
                    </g>
                  );
                })}
                {trendPoints.length > 1 && (
                  <polyline
                    points={trendPoints
                      .map((point) => `${point.x},${point.y}`)
                      .join(" ")}
                    fill="none"
                    className="stroke-brand-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  />
                )}
                {trendPoints.map((point) => (
                  <g
                    key={point.session.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`${formatRevisionDate(
                      point.session.completedAt,
                    )}: ${point.rate}% recall`}
                    onMouseEnter={() =>
                      setHoveredTrendPointId(point.session.id)
                    }
                    onMouseLeave={() => setHoveredTrendPointId(null)}
                    onFocus={() => setHoveredTrendPointId(point.session.id)}
                    onBlur={() => setHoveredTrendPointId(null)}
                    onClick={() =>
                      setSelectedTrendPointId((currentId) =>
                        currentId === point.session.id
                          ? null
                          : point.session.id,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedTrendPointId((currentId) =>
                          currentId === point.session.id
                            ? null
                            : point.session.id,
                        );
                      }
                      if (event.key === "Escape") {
                        setSelectedTrendPointId(null);
                        event.currentTarget.blur();
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="12"
                      className="fill-transparent"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={
                        activeTrendPoint?.session.id === point.session.id ? 6 : 5
                      }
                      className={`stroke-brand-700 stroke-[3] transition-all ${
                        activeTrendPoint?.session.id === point.session.id
                          ? "fill-brand-100"
                          : "fill-white"
                      }`}
                    />
                  </g>
                ))}
                {activeTrendPoint && (() => {
                  const tooltipWidth = 184;
                  const tooltipHeight = 52;
                  const tooltipX = Math.min(
                    Math.max(
                      activeTrendPoint.x - tooltipWidth / 2,
                      TREND_CHART_PADDING.left,
                    ),
                    TREND_CHART_WIDTH -
                      TREND_CHART_PADDING.right -
                      tooltipWidth,
                  );
                  const tooltipY =
                    activeTrendPoint.y > TREND_CHART_PADDING.top + 62
                      ? activeTrendPoint.y - tooltipHeight - 12
                      : activeTrendPoint.y + 12;
                  return (
                    <g aria-hidden="true" pointerEvents="none">
                      <rect
                        x={tooltipX}
                        y={tooltipY}
                        width={tooltipWidth}
                        height={tooltipHeight}
                        rx="8"
                        className="fill-ink-900"
                      />
                      <text
                        x={tooltipX + 12}
                        y={tooltipY + 20}
                        className="fill-white text-[11px] font-semibold"
                      >
                        {formatTrendTooltipDate(
                          activeTrendPoint.session.completedAt,
                        )}
                      </text>
                      <text
                        x={tooltipX + 12}
                        y={tooltipY + 38}
                        className="fill-slate-300 text-[11px]"
                      >
                        {formatTrendTooltipTime(
                          activeTrendPoint.session.completedAt,
                        )}{" "}
                        · {activeTrendPoint.rate}% recall
                      </text>
                    </g>
                  );
                })()}
                </svg>
              </div>
              <ol className="sr-only">
                {trendPoints.map((point, index) => (
                  <li key={point.session.id}>
                    Revision {index + 1}, {formatRevisionDate(point.session.completedAt)}:
                    {" "}
                    {point.rate}% recall.
                  </li>
                ))}
              </ol>
            </>
          )}
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
                        {session.cardCount}{" "}
                        {session.cardCount === 1 ? "card" : "cards"} reviewed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold tabular-nums text-ink-900">
                        {rate}%
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
                  <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ratingLegend.map((rating) => (
                      <div
                        key={rating.score}
                        className={`flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 ${rating.tileColor}`}
                      >
                        <dt className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink-600">
                          <span
                            className={`size-2 shrink-0 rounded-full ${rating.color}`}
                            aria-hidden="true"
                          />
                          {rating.label}
                        </dt>
                        <dd className="text-sm font-bold tabular-nums text-ink-900">
                          {session.ratingCounts[rating.score]}
                        </dd>
                      </div>
                    ))}
                  </dl>
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
