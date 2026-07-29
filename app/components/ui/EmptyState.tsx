import { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "px-4 py-10" : "px-5 py-16"
      }`}
    >
      <div className="mb-4 grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="text-lg font-bold tracking-[-0.02em] text-ink-900">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
