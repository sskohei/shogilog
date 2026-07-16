"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTagButton } from "@/features/tags/DeleteTagButton";
import { TagForm } from "@/features/tags/TagForm";
import type { Tag } from "@/types/tag";

export function TagRow({ tag }: { tag: Tag }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <li className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3">
        <TagForm mode="edit" tag={tag} onSuccess={() => setIsEditing(false)} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(false)}
        >
          キャンセル
        </Button>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <Badge
        variant={tag.color ? "default" : "outline"}
        style={tag.color ? { backgroundColor: tag.color, color: "#fff" } : undefined}
      >
        {tag.name}
      </Badge>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          編集
        </Button>
        <DeleteTagButton tagId={tag.id} />
      </div>
    </li>
  );
}
