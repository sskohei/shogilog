"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteGameAction } from "@/features/games/actions";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
import { initialSimpleActionState } from "@/types/actionState";

export function DeleteGameButton({ gameId }: { gameId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteGameAction.bind(null, gameId),
    initialSimpleActionState
  );
  useActionErrorToast(state.error);

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
