import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// docs/frontend.md §8.3 に明記された保護ルート。
const PROTECTED_ROUTES = ["/games", "/dashboard", "/profile", "/tags"];
const LOGIN_ROUTE = "/auth/login";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() は Auth サーバーに問い合わせて検証するため、
  // Proxy でのセッション更新・保護ルート判定に使う。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isLoginRoute = pathname === LOGIN_ROUTE;

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/games", request.url));
  }

  return response;
}
