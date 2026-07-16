export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-12">
      <div className="mb-2 h-7 w-24 animate-pulse rounded bg-muted" />
      <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/50" />
      <div className="h-24 animate-pulse rounded-lg border border-border bg-muted/50" />
      <div className="h-24 animate-pulse rounded-lg border border-border bg-muted/50" />
    </div>
  );
}
