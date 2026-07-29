"use client";

import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import Button from "./components/ui/Button";
import EmptyState from "./components/ui/EmptyState";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-shell flex grow items-center justify-center">
      <div className="surface-card w-full max-w-2xl">
        <EmptyState
          icon={<FiAlertCircle className="size-6" />}
          title="Something interrupted this page"
          description="Your saved content has not been changed. Try loading the page again."
          action={
            <Button
              onClick={reset}
              leadingIcon={<FiRefreshCw className="size-4" />}
            >
              Try again
            </Button>
          }
        />
      </div>
    </div>
  );
}
