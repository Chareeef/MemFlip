export default function Loading() {
  return (
    <div className="page-shell grow" role="status" aria-label="Loading page">
      <div className="skeleton h-4 w-28 rounded" />
      <div className="skeleton mt-4 h-10 w-80 max-w-full rounded-lg" />
      <div className="skeleton mt-3 h-5 w-[34rem] max-w-full rounded" />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="surface-card p-5">
            <div className="skeleton h-10 w-10 rounded-control" />
            <div className="skeleton mt-6 h-5 w-2/3 rounded" />
            <div className="skeleton mt-3 h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading MemFlip…</span>
    </div>
  );
}
