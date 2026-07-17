export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 py-16 text-center text-destructive">
      <p>{message}</p>
    </div>
  );
}
