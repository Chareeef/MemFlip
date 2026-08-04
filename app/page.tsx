import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiEdit3,
  FiLayers,
  FiTrendingUp,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import LandingFlashcard from "./components/LandingFlashcard";

const features = [
  {
    icon: HiOutlineSparkles,
    title: "Draft with AI",
    description:
      "Turn a focused topic into a useful first draft without giving up control of the final deck.",
  },
  {
    icon: FiEdit3,
    title: "Review every card",
    description:
      "Refine questions and answers in place, add your own cards, and save only when the set feels right.",
  },
  {
    icon: FiBookOpen,
    title: "Study without noise",
    description:
      "Flip through one clear card at a time, rate your recall, and turn every revision into useful progress.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-[var(--border)] bg-[radial-gradient(circle_at_80%_10%,var(--brand-100),transparent_30%),linear-gradient(to_bottom,#fff,var(--surface-subtle))]">
        <div className="page-shell grid min-h-[calc(100svh-4rem)] items-center gap-14 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-800 shadow-soft">
              <FiLayers className="size-3.5" aria-hidden="true" />
              Flashcards that keep you in control
            </div>
            <h1 className="mt-6 text-[clamp(2.75rem,7vw,5.3rem)] font-extrabold leading-[0.98] tracking-[-0.065em] text-ink-900">
              Learn more clearly.
              <span className="mt-2 block text-brand-700">Remember longer.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink-700">
              MemFlip helps you turn any topic into thoughtful, editable
              flashcards—then gives you a focused place to review them.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-brand-600 px-5 text-sm font-bold text-white shadow-card transition-[background-color,transform] duration-150 hover:bg-brand-700 active:translate-y-px"
              >
                Create your first deck
                <FiArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center justify-center rounded-control border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-ink-700 shadow-soft transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
              >
                Open your library
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-2">
                <FiCheck className="size-4 text-emerald-600" aria-hidden="true" />
                Edit before saving
              </span>
              <span className="inline-flex items-center gap-2">
                <FiCheck className="size-4 text-emerald-600" aria-hidden="true" />
                Keyboard friendly
              </span>
              <span className="inline-flex items-center gap-2">
                <FiCheck className="size-4 text-emerald-600" aria-hidden="true" />
                Focused study sessions
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[35rem] lg:mx-0 lg:ml-auto">
            <div className="absolute -inset-10 -z-10 rounded-full bg-brand-200/30 blur-3xl" />
            <div className="relative rounded-[1.5rem] border border-brand-100 bg-white p-4 shadow-floating sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/icon.png"
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-[0.65rem]"
                  />
                  <div>
                    <p className="text-sm font-bold text-ink-900">
                      Classic literature
                    </p>
                    <p className="text-xs text-ink-500">Card 4 of 12</p>
                  </div>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-800">
                  Studying
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-brand-50">
                <div className="h-full w-1/3 rounded-full bg-brand-600" />
              </div>
              <LandingFlashcard />
              <div className="mt-4 grid grid-cols-4 gap-2" aria-hidden="true">
                {["Forgot", "Hard", "Good", "Easy"].map((label, index) => (
                  <span
                    key={label}
                    className={`rounded-control border px-2 py-2 text-center text-xs font-semibold ${
                      index === 0
                        ? "border-red-100 bg-red-50 text-red-800"
                        : index === 1
                          ? "border-amber-100 bg-amber-50 text-amber-800"
                          : index === 2
                            ? "border-brand-100 bg-brand-50 text-brand-800"
                            : "border-emerald-100 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24" aria-labelledby="why-heading">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-brand-700">Designed for focus</p>
          <h2
            id="why-heading"
            className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-ink-900 sm:text-4xl"
          >
            Less setup. Better study material.
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-700">
            AI moves the first draft faster. You still decide what is accurate,
            useful, and worth remembering.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="surface-card p-6 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
              >
                <span className="grid size-11 place-items-center rounded-control bg-brand-50 text-brand-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-lg font-bold tracking-[-0.025em] text-ink-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-surface-subtle">
        <div className="page-shell grid gap-12 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-24">
          <div className="max-w-xl">
            <span className="grid size-11 place-items-center rounded-control bg-brand-50 text-brand-700">
              <FiTrendingUp className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-6 text-sm font-bold text-brand-700">
              Progress you can read
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-ink-900 sm:text-4xl">
              See recall change, revision by revision.
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-700">
              MemFlip turns Forgot, Hard, Good, and Easy into a fair 0–100%
              recall score. Follow every revision on a clear trend line, switch
              the time span, and inspect any point for its date and score.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-700">
              {[
                "A weighted score that distinguishes hard recall from easy recall",
                "Adjustable 1-day, 1-week, 1-month, and 3-month views",
                "A complete rating breakdown for every recent revision",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <FiCheck
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-brand-100 bg-surface-subtle p-3 shadow-floating sm:p-5">
            <div className="rounded-card border border-[var(--border)] bg-white p-4 shadow-soft sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-700">
                    Revision stats
                  </p>
                  <p className="mt-1 text-lg font-bold text-ink-900">
                    Recall trend
                  </p>
                </div>
                <div
                  className="flex rounded-control bg-surface-muted p-1 text-[0.625rem] font-semibold text-ink-500"
                  aria-hidden="true"
                >
                  {[
                    { label: "1 day", active: false },
                    { label: "1 week", active: true },
                    { label: "1 month", active: false },
                    { label: "3 months", active: false },
                  ].map(({ label, active }) => (
                    <span
                      key={label}
                      className={`rounded-md px-2 py-1.5 ${
                        active ? "bg-white text-brand-800 shadow-sm" : ""
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-1.5" aria-label="Recall weights">
                {[
                  ["0", "Forgot", "border-red-100 bg-red-50 text-red-800"],
                  ["1", "Hard", "border-amber-100 bg-amber-50 text-amber-900"],
                  ["2", "Good", "border-brand-100 bg-brand-50 text-brand-800"],
                  ["3", "Easy", "border-emerald-100 bg-emerald-50 text-emerald-800"],
                ].map(([score, label, color]) => (
                  <span
                    key={label}
                    className={`rounded-md border px-1.5 py-2 text-center text-[0.625rem] font-bold sm:text-xs ${color}`}
                  >
                    <span className="mr-1 tabular-nums">{score}</span>
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-control bg-surface-muted p-3">
                  <p className="text-[0.6875rem] font-semibold text-ink-500">
                    Latest recall
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink-900">
                    83%
                  </p>
                </div>
                <div className="rounded-control bg-surface-muted p-3">
                  <p className="text-[0.6875rem] font-semibold text-ink-500">
                    Recent average
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold tabular-nums text-ink-900">
                    72%
                  </p>
                </div>
              </div>

              <svg
                className="mt-4 h-auto w-full"
                viewBox="0 0 520 180"
                role="img"
                aria-label="Example recall trend rising from 42 percent to 83 percent across six revisions"
              >
                {[20, 82, 144].map((y, index) => (
                  <g key={y} aria-hidden="true">
                    <line
                      x1="40"
                      x2="510"
                      y1={y}
                      y2={y}
                      className="stroke-slate-200"
                      strokeDasharray={index === 1 ? "4 5" : undefined}
                    />
                    <text
                      x="32"
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[9px] font-medium"
                    >
                      {[100, 50, 0][index]}%
                    </text>
                  </g>
                ))}
                <polyline
                  points="48,118 132,95 226,105 315,69 412,80 502,41"
                  fill="none"
                  className="stroke-brand-500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                />
                {[
                  [48, 118],
                  [132, 95],
                  [226, 105],
                  [315, 69],
                  [412, 80],
                  [502, 41],
                ].map(([x, y]) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="5"
                    className="fill-white stroke-brand-700 stroke-[3]"
                    aria-hidden="true"
                  />
                ))}
                <text x="40" y="169" className="fill-slate-400 text-[9px] font-medium">
                  Mon
                </text>
                <text
                  x="272"
                  y="169"
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-medium"
                >
                  Thu
                </text>
                <text
                  x="510"
                  y="169"
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-medium"
                >
                  Today
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-white">
        <div className="page-shell grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-brand-700">
              A clear workflow
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-ink-900 sm:text-4xl">
              From idea to recall in three calm steps.
            </h2>
          </div>
          <ol className="grid gap-3">
            {[
              [
                "01",
                "Describe the deck",
                "Choose a specific topic and the number of cards you want.",
              ],
              [
                "02",
                "Shape the draft",
                "Edit, remove, or add cards until the set matches your goals.",
              ],
              [
                "03",
                "Study with intent",
                "Reveal answers, reflect on recall, and keep your progress visible.",
              ],
            ].map(([number, title, description]) => (
              <li
                key={number}
                className="grid grid-cols-[auto_1fr] gap-4 rounded-card border border-[var(--border)] bg-surface-raised p-5"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-800">
                  {number}
                </span>
                <span>
                  <span className="block font-bold text-ink-900">{title}</span>
                  <span className="mt-1 block text-sm leading-6 text-ink-500">
                    {description}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-shell py-20 sm:py-24">
        <div className="rounded-[1.5rem] border border-brand-200 bg-brand-50 px-6 py-12 text-center sm:px-10">
          <Image
            src="/icons/icon.png"
            alt=""
            width={56}
            height={56}
            className="mx-auto size-14 rounded-card shadow-card"
          />
          <h2 className="mx-auto mt-5 max-w-xl text-3xl font-extrabold tracking-[-0.045em] text-ink-900">
            Make your next study session feel lighter.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink-700">
            Start with the subject already on your mind. MemFlip will help you
            turn it into a deck you can trust.
          </p>
          <Link
            href="/sign-up"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-control bg-brand-600 px-5 text-sm font-bold text-white shadow-card hover:bg-brand-700"
          >
            Get started
            <FiArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
