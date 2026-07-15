export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/50" />
    </div>
  );
}
