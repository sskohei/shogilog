import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">お探しのページが見つかりませんでした。</p>
      <Link
        href="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
