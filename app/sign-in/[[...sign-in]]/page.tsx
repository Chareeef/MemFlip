import { SignIn } from "@clerk/nextjs";
import { FiBookOpen, FiCheck } from "react-icons/fi";

export default function Page() {
  return (
    <div className="page-shell grid grow items-center gap-10 py-10 lg:grid-cols-2">
      <section className="hidden max-w-lg lg:block" aria-labelledby="signin-copy">
        <span className="grid size-11 place-items-center rounded-control bg-brand-50 text-brand-700">
          <FiBookOpen className="size-5" aria-hidden="true" />
        </span>
        <h1 id="signin-copy" className="page-heading mt-6">
          Your decks are ready when you are.
        </h1>
        <p className="page-description mt-4">
          Pick up where you left off, review saved cards, or start a focused new
          deck.
        </p>
        <ul className="mt-7 space-y-3 text-sm text-ink-700">
          {["All your decks in one library", "Focused, keyboard-friendly study"].map(
            (item) => (
              <li key={item} className="flex items-center gap-3">
                <FiCheck className="size-4 text-emerald-600" aria-hidden="true" />
                {item}
              </li>
            ),
          )}
        </ul>
      </section>
      <div className="flex justify-center lg:justify-end">
        <SignIn />
      </div>
    </div>
  );
}
