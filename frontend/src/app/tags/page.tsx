import type { Metadata } from "next";

import { ApiError } from "@/lib/fetcher";
import { fetchTags } from "@/services/api/tags";
import { ErrorState } from "@/components/ui/error-state";
import { TagForm } from "@/features/tags/TagForm";
import { TagList } from "@/features/tags/TagList";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { Tag } from "@/types/tag";

export const metadata: Metadata = {
  title: "タグ管理 | ShogiLog",
};

type TagsPageData = { ok: true; tags: Tag[] } | { ok: false; message: string };

async function loadTagsPageData(): Promise<TagsPageData> {
  try {
    const tags = await fetchTags();
    return { ok: true, tags };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? getApiErrorMessage(error, "タグ情報の取得に失敗しました。")
        : "タグ情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function TagsPage() {
  const data = await loadTagsPageData();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-12">
      <h1 className="text-xl font-semibold">タグ管理</h1>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : (
        <>
          <section className="space-y-2 rounded-lg border border-border p-4">
            <h2 className="text-sm font-medium">新しいタグを追加</h2>
            <TagForm mode="create" />
          </section>
          <TagList tags={data.tags} />
        </>
      )}
    </div>
  );
}
