"use client";

export default function Error({
  error: _error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">エラーが発生しました</h1>
      <p className="text-muted-foreground">
        予期しないエラーが発生しました。時間をおいて再度お試しください。
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        再試行する
      </button>
    </div>
  );
}
