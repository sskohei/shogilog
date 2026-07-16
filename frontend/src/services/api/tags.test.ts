import { describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/fetcher", () => ({
  apiFetch: apiFetchMock,
}));

import { createTag, deleteTag, fetchTags, updateTag } from "@/services/api/tags";

describe("fetchTags", () => {
  it("data を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: [{ id: "tag-1", name: "研究" }] });

    const tags = await fetchTags();

    expect(apiFetchMock).toHaveBeenCalledWith("/tags");
    expect(tags).toEqual([{ id: "tag-1", name: "研究" }]);
  });
});

describe("createTag", () => {
  it("POST でタグを作成し id を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: { id: "tag-1" } });

    const id = await createTag({ name: "研究", color: "#ff0000" });

    expect(apiFetchMock).toHaveBeenCalledWith("/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "研究", color: "#ff0000" }),
    });
    expect(id).toBe("tag-1");
  });
});

describe("updateTag", () => {
  it("PUT でタグを更新する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await updateTag("tag-1", { name: "終盤", color: null });

    expect(apiFetchMock).toHaveBeenCalledWith("/tags/tag-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "終盤", color: null }),
    });
  });
});

describe("deleteTag", () => {
  it("DELETE でタグを削除する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await deleteTag("tag-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/tags/tag-1", { method: "DELETE" });
  });
});
