import Image from "next/image";
import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiEdit3,
  FiLayers,
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
      "Flip through one clear card at a time with useful progress, keyboard shortcuts, and calm feedback.",
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
                      Cell biology
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
                {["Again", "Hard", "Good", "Easy"].map((label, index) => (
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
