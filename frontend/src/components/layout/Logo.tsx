import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-3xl",
} as const;

export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-semibold tracking-tight",
        SIZE_CLASSES[size],
        className
      )}
    >
      <span className="text-foreground">Shogi</span>
      <span className="text-primary">Log</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block size-[0.2em] translate-y-[-0.05em] rounded-full bg-primary"
      />
    </span>
  );
}
