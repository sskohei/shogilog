import { TagRow } from "@/features/tags/TagRow";
import type { Tag } from "@/types/tag";

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
        まだタグが登録されていません
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tags.map((tag) => (
        <TagRow key={tag.id} tag={tag} />
      ))}
    </ul>
  );
}
