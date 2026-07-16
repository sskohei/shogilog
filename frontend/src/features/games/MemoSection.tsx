"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateMemoAction } from "@/features/games/actions";
import { initialSimpleActionState } from "@/features/games/types";

export function MemoSection({
  gameId,
  memo,
}: {
  gameId: string;
  memo: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateMemoAction.bind(null, gameId),
    initialSimpleActionState
  );

  // action が完了して state 参照が更新された瞬間にだけ編集モードを終了する
  // (レンダー中の state 調整パターン: https://react.dev/learn/you-might-not-need-an-effect)
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (!state.error) {
      setIsEditing(false);
    }
  }

  return (
    <section className="space-y-2 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">メモ</h2>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            編集
          </Button>
        )}
      </div>

      {isEditing ? (
        <form action={formAction} className="space-y-2">
          <Textarea
            name="memo"
            defaultValue={memo ?? ""}
            maxLength={2000}
            rows={5}
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "memo-error" : undefined}
          />
          {state.error && (
            <p id="memo-error" className="text-sm text-destructive" aria-live="polite">
              {state.error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              保存
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setIsEditing(false)}
            >
              キャンセル
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
          {memo || "メモはまだありません"}
        </p>
      )}
    </section>
  );
}
