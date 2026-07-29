import Link from "next/link";
import { FiArrowLeft, FiMap } from "react-icons/fi";
import EmptyState from "./components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="page-shell flex grow items-center justify-center">
      <div className="surface-card w-full max-w-2xl">
        <EmptyState
          icon={<FiMap className="size-6" />}
          title="This page isn’t in the deck"
          description="The link may be outdated, or the page may have moved."
          action={
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-control bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <FiArrowLeft className="size-4" aria-hidden="true" />
              Back to MemFlip
            </Link>
          }
        />
      </div>
    </div>
  );
}
