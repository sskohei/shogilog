"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteGameAction } from "@/features/games/actions";
import { initialSimpleActionState } from "@/features/games/types";

export function DeleteGameButton({ gameId }: { gameId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteGameAction.bind(null, gameId),
    initialSimpleActionState
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("この対局を削除しますか？")) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        削除
      </Button>
      {state.error && (
        <p className="mt-2 text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}
    </form>
  );
}
