"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { deleteTagAction } from "@/features/tags/actions";
import { initialSimpleActionState } from "@/features/tags/types";

export function DeleteTagButton({ tagId }: { tagId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteTagAction.bind(null, tagId),
    initialSimpleActionState
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("このタグを削除しますか？")) {
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
