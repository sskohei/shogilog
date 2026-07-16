import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出しは Cookie を書き込めない。
            // Proxy (frontend/proxy.ts) がリクエスト毎にセッションを更新するため無視してよい。
          }
        },
      },
    }
  );
}

// Auth サーバーによる検証込みでユーザーを取得する。ヘッダーの表示分岐など、
// 「本当にログイン済みか」を信頼して使う必要がある箇所で使用する。
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

// バックエンド API へ転送するアクセストークンを取得する。
// トークンの正当性はバックエンド側で署名検証されるため、ここでの再検証は行わない。
export const getAccessToken = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
});
