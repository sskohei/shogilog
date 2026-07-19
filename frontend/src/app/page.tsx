import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { ResultBadge } from "@/features/games/Badges";
import { PLATFORM_OPTIONS } from "@/features/games/platforms";
import { getCurrentUser } from "@/lib/supabase/server";

function GamesListMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center justify-between py-2 text-sm">
          <span>07/18 将棋クエスト 四間飛車</span>
          <ResultBadge result="win" />
        </div>
        <div className="flex items-center justify-between border-t border-border py-2 text-sm">
          <span>07/16 将棋ウォーズ 矢倉</span>
          <ResultBadge result="lose" />
        </div>
        <div className="flex items-center justify-between border-t border-border py-2 text-sm">
          <span>07/14 81道場 中飛車</span>
          <ResultBadge result="draw" />
        </div>
      </div>
    </div>
  );
}

function WinRateMockup() {
  const rows = [
    { label: "四間飛車", width: "68%", color: "var(--chart-1)" },
    { label: "矢倉", width: "41%", color: "var(--chart-2)" },
    { label: "中飛車", width: "55%", color: "var(--chart-3)" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">戦法別勝率</span>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.label}</span>
            <div className="h-2.5 flex-1 rounded-full bg-secondary">
              <div
                className="h-2.5 rounded-full"
                style={{ width: row.width, backgroundColor: row.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagsMemoMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>早指し</Badge>
        <Badge variant="outline">研究会</Badge>
        <Badge variant="outline">公式戦</Badge>
      </div>
      <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
        四間飛車を対局前レーティング1450で指し、対局後1468まで伸ばしました。次局は矢倉に対する対策を試します。
      </p>
    </div>
  );
}

function RatingTrendMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-muted-foreground">レーティング推移</span>
        <span className="text-2xl font-bold tabular-nums">1580</span>
      </div>
      <svg viewBox="0 0 200 60" className="mt-4 h-16 w-full" preserveAspectRatio="none">
        <polyline
          points="0,50 40,42 80,45 120,28 160,20 200,10"
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>3ヶ月前</span>
        <span>今日</span>
      </div>
    </div>
  );
}

function LongTermStatsMockup() {
  const months = [
    { label: "4月", height: "45%", color: "var(--chart-1)" },
    { label: "5月", height: "60%", color: "var(--chart-2)" },
    { label: "6月", height: "38%", color: "var(--chart-3)" },
    { label: "7月", height: "80%", color: "var(--chart-4)" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">月別対局数</span>
      <div className="mt-4 flex h-20 items-end gap-3">
        {months.map((month) => (
          <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t"
              style={{ height: month.height, backgroundColor: month.color }}
            />
            <span className="text-[11px] text-muted-foreground">{month.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KifPasteMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="rounded-lg bg-secondary p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
        手合割：平手
        <br />
        ▲7六歩　△3四歩
        <br />
        ▲2六歩　△8四歩
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span>対局日時</span>
        <span className="text-muted-foreground">2026/07/18 21:03</span>
      </div>
      <div className="flex items-center justify-between pt-1 text-sm">
        <span>結果</span>
        <ResultBadge result="win" />
      </div>
    </div>
  );
}

const SHOWCASE_FEATURES = [
  {
    heading: "将棋ウォーズも、将棋クエストも、ひとつの記録に。",
    body: "複数の対局サービスの棋譜・結果・レーティングを一箇所にまとめて管理。サービスをまたいでも、自分の対局史は途切れません。",
    reverse: false,
    mockup: <GamesListMockup />,
  },
  {
    heading: "得意な戦法も、苦手な相手も、数字でわかる。",
    body: "プラットフォーム別・戦法別・先手後手別の勝率を自動で集計。感覚だけに頼らず、次に何を練習すべきかが見えてきます。",
    reverse: true,
    mockup: <WinRateMockup />,
  },
  {
    heading: "タグとメモで、対局を資産に。",
    body: "自由なタグ付けと振り返りメモで対局を分類。あとから見返しやすく、同じ失敗を繰り返さないための記録になります。",
    reverse: false,
    mockup: <TagsMemoMockup />,
  },
  {
    heading: "上がった日も、下がった日も、一本の線でわかる。",
    body: "プラットフォームごとのレーティング・段級位の推移をグラフで確認。伸び悩みも成長も、ひと目で振り返れます。",
    reverse: true,
    mockup: <RatingTrendMockup />,
  },
  {
    heading: "先月の10局も、去年の100局も、傾向としてつながる。",
    body: "月ごとの対局数や先後別の勝率など、長期的な傾向を可視化。積み重ねた対局が、次の一手のヒントになります。",
    reverse: false,
    mockup: <LongTermStatsMockup />,
  },
  {
    heading: "コピーするだけで、対局日時も結果も、自動で記録。",
    body: "棋譜をクリップボードから貼り付けるだけで、対局日時や結果を自動入力。入力の手間を省き、記録を続けやすくします。",
    reverse: true,
    mockup: <KifPasteMockup />,
  },
] as const;

export default async function Home() {
  const user = await getCurrentUser();

  const primaryCta = user ? (
    <>
      <Button
        render={<Link href="/games">対局一覧を見る</Link>}
        nativeButton={false}
        className="h-11 rounded-full px-6 text-base"
      />
      <Button
        render={<Link href="/dashboard">統計を見る</Link>}
        nativeButton={false}
        variant="outline"
        className="h-11 rounded-full px-6 text-base"
      />
    </>
  ) : (
    <Button
      render={<Link href="/auth/login">ログインしてはじめる</Link>}
      nativeButton={false}
      className="h-11 rounded-full px-6 text-base"
    />
  );

  return (
    <div className="flex-1">
      {/* ---------- Hero ---------- */}
      <section className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
        <Logo size="lg" />
        <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight md:text-5xl">
          対局を振り返るほど、強くなる。
        </h1>
        <p className="max-w-xl text-muted-foreground">
          将棋ウォーズ・将棋クエストなど複数サービスの対局を一箇所に集約。勝率・戦法・レーティングの推移を見える化し、次の一局に活かします。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">{primaryCta}</div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <span className="text-xs text-muted-foreground">対応サービス</span>
          {PLATFORM_OPTIONS.map((platform) => (
            <Badge key={platform.id} variant="outline">
              {platform.name}
            </Badge>
          ))}
        </div>

        {/* Hero product preview */}
        <div className="relative w-full max-w-3xl pt-12">
          <div className="absolute inset-x-6 inset-y-8 rounded-3xl bg-accent" aria-hidden="true" />
          <div className="relative rounded-2xl border border-border bg-card p-6 text-left shadow-lg">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-muted-foreground">直近30日の勝率</span>
              <span className="text-3xl font-bold tabular-nums">58%</span>
            </div>
            <div className="mt-6 flex h-24 items-end gap-3">
              <div className="flex flex-1 flex-col items-center gap-2">
                <div className="h-[70%] w-full rounded-t bg-[var(--chart-1)]" />
                <span className="text-[11px] text-muted-foreground">ウォーズ</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <div className="h-[52%] w-full rounded-t bg-[var(--chart-2)]" />
                <span className="text-[11px] text-muted-foreground">クエスト</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <div className="h-[45%] w-full rounded-t bg-[var(--chart-3)]" />
                <span className="text-[11px] text-muted-foreground">棋桜</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-2">
                <div className="h-[38%] w-full rounded-t bg-[var(--chart-4)]" />
                <span className="text-[11px] text-muted-foreground">81道場</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Feature showcase ---------- */}
      <section className="mx-auto max-w-6xl space-y-20 px-4 py-16">
        {SHOWCASE_FEATURES.map((feature) => (
          <div
            key={feature.heading}
            className={`flex flex-col items-center gap-8 md:gap-14 ${
              feature.reverse ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="w-full flex-1">{feature.mockup}</div>
            <div className="w-full flex-1 space-y-3">
              <h2 className="text-balance text-2xl font-bold tracking-tight">{feature.heading}</h2>
              <p className="text-muted-foreground">{feature.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="bg-accent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight">
            今日の一局から、記録をはじめよう。
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">{primaryCta}</div>
        </div>
      </section>
    </div>
  );
}
