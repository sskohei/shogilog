"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "ホーム" },
  { href: "/games", label: "対局" },
  { href: "/tags", label: "タグ" },
  { href: "/openings", label: "戦法" },
  { href: "/dashboard", label: "統計" },
  { href: "/profile", label: "プロフィール" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-max items-center gap-1">
      {navLinks.map(({ href, label }) => {
        const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
              isActive ? "bg-muted text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
