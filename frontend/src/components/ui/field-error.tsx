export function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages) return null;
  return (
    <p id={id} className="text-sm text-destructive" aria-live="polite">
      {messages[0]}
    </p>
  );
}
