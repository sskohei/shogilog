"use client";

import { useActionState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { linkGameTagAction, unlinkGameTagAction } from "@/features/games/actions";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
import { initialSimpleActionState } from "@/types/actionState";
import type { Tag } from "@/types/tag";

function RemoveTagButton({ gameId, tagId }: { gameId: string; tagId: string }) {
  const [state, formAction, pending] = useActionState(
    unlinkGameTagAction.bind(null, gameId, tagId),
    initialSimpleActionState
  );
  useActionErrorToast(state.error);

  return (
    <form action={formAction} className="inline">
      <button
        type="submit"
        disabled={pending}
        aria-label="タグを解除"
        className="ml-1 disabled:opacity-50"
      >
        ×
      </button>
      {state.error && (
        <span className="ml-1 text-xs text-destructive" aria-live="polite">
          {state.error}
        </span>
      )}
    </form>
  );
}

export function GameTagsSection({
  gameId,
  gameTags,
  allTags,
}: {
  gameId: string;
  gameTags: Tag[];
  allTags: Tag[];
}) {
  const [state, formAction, pending] = useActionState(
    linkGameTagAction.bind(null, gameId),
    initialSimpleActionState
  );
  useActionErrorToast(state.error);
  const attachedIds = new Set(gameTags.map((tag) => tag.id));
  const availableTags = allTags.filter((tag) => !attachedIds.has(tag.id));

  return (
    <section className="space-y-2 rounded-lg border border-border p-4">
      <h2 className="text-sm font-medium">タグ</h2>
      <div className="flex flex-wrap gap-2">
        {gameTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">タグは設定されていません</p>
        ) : (
          gameTags.map((tag) => (
            <Badge
              key={tag.id}
              variant={tag.color ? "default" : "outline"}
              style={tag.color ? { backgroundColor: tag.color, color: "#fff" } : undefined}
            >
              {tag.name}
              <RemoveTagButton gameId={gameId} tagId={tag.id} />
            </Badge>
          ))
        )}
      </div>

      {availableTags.length > 0 && (
        <form action={formAction} className="flex items-center gap-2">
          <Select name="tag_id" defaultValue="" className="w-auto">
            <option value="" disabled>
              タグを選択
            </option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline" size="sm" disabled={pending}>
            追加
          </Button>
        </form>
      )}
      {state.error && (
        <p className="text-sm text-destructive" aria-live="polite">
          {state.error}
        </p>
      )}
    </section>
  );
}
