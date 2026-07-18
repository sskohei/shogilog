import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
        <Logo size="sm" className="opacity-70" />
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
