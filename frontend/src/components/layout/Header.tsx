import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { Nav } from "@/components/layout/Nav";
import { logoutAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/supabase/server";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <Nav />
        </div>
        {user ? (
          <form action={logoutAction} className="shrink-0">
            <Button type="submit" variant="outline" size="sm">
              ログアウト
            </Button>
          </form>
        ) : (
          <Button
            render={<Link href="/auth/login">ログイン</Link>}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="shrink-0"
          />
        )}
      </div>
    </header>
  );
}
