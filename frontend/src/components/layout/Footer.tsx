export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} ShogiLog
      </div>
    </footer>
  );
}
