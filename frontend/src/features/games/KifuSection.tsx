import { Button } from "@/components/ui/button";

export function KifuSection({ kifuUrl }: { kifuUrl: string | null }) {
  return (
    <section className="space-y-2 rounded-lg border border-border p-4">
      <h2 className="text-sm font-medium">棋譜</h2>
      {kifuUrl ? (
        <Button
          render={<a href={kifuUrl}>棋譜ファイルをダウンロード</a>}
          nativeButton={false}
          variant="outline"
          size="sm"
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          棋譜ファイルは登録されていません
        </p>
      )}
    </section>
  );
}
