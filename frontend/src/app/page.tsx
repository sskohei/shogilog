import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLATFORM_OPTIONS } from "@/features/games/platforms";
import { getCurrentUser } from "@/lib/supabase/server";

const FEATURES = [
  {
    title: "複数サービスを横断した管理",
    description: "将棋ウォーズ・将棋クエストなど、複数の対局サービスの履歴を一つの場所でまとめて管理できます。",
  },
  {
    title: "自分用のメモ",
    description: "対局ごとに振り返りメモを残し、次の対局に活かせます。",
  },
  {
    title: "タグ管理",
    description: "自由なタグ付けで対局を分類し、あとから見返しやすくします。",
  },
  {
    title: "戦法別の分析",
    description: "使った戦法ごとの勝率を集計し、得意・不得意を把握できます。",
  },
  {
    title: "レーティング推移",
    description: "プラットフォームごとのレーティング・段級位の推移をグラフで確認できます。",
  },
  {
    title: "長期的な統計",
    description: "月ごとの対局数や先後別の勝率など、長期的な傾向を可視化します。",
  },
];

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
      <section className="flex flex-col items-center gap-6 py-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">ShogiLog</h1>
        <p className="max-w-xl text-muted-foreground">
          ネット将棋の対局履歴を一元管理し、日々の振り返りや棋力向上を支援するWebアプリケーションです。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              <Button render={<Link href="/games">対局一覧を見る</Link>} nativeButton={false} />
              <Button
                render={<Link href="/dashboard">統計を見る</Link>}
                nativeButton={false}
                variant="outline"
              />
            </>
          ) : (
            <Button render={<Link href="/auth/login">ログイン</Link>} nativeButton={false} />
          )}
        </div>
      </section>

      <section className="grid gap-4 py-8 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="space-y-1 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium">{feature.title}</h2>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2 py-8">
        <h2 className="text-sm font-medium">対応プラットフォーム</h2>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((platform) => (
            <Badge key={platform.id} variant="outline">
              {platform.name}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
