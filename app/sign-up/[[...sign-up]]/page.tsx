import { SignUp } from "@clerk/nextjs";
import { FiCheck } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

export default function Page() {
  return (
    <div className="page-shell grid grow items-center gap-10 py-10 lg:grid-cols-2">
      <section className="hidden max-w-lg lg:block" aria-labelledby="signup-copy">
        <span className="grid size-11 place-items-center rounded-control bg-brand-50 text-brand-700">
          <HiOutlineSparkles className="size-5" aria-hidden="true" />
        </span>
        <h1 id="signup-copy" className="page-heading mt-6">
          Build study material you can trust.
        </h1>
        <p className="page-description mt-4">
          Let AI accelerate the draft, then keep the final say over every
          question and answer.
        </p>
        <ul className="mt-7 space-y-3 text-sm text-ink-700">
          {["Editable AI-generated drafts", "A calm library for every subject"].map(
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
        <SignUp />
      </div>
    </div>
  );
}
