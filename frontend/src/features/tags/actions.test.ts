import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePathMock, createTagMock, updateTagMock, deleteTagMock } =
  vi.hoisted(() => ({
    revalidatePathMock: vi.fn(),
    createTagMock: vi.fn(),
    updateTagMock: vi.fn(),
    deleteTagMock: vi.fn(),
  }));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/services/api/tags", () => ({
  createTag: createTagMock,
  updateTag: updateTagMock,
  deleteTag: deleteTagMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: vi.fn(),
}));

import { ApiError } from "@/lib/fetcher";
import {
  createTagAction,
  deleteTagAction,
  updateTagAction,
} from "@/features/tags/actions";

function makeFormData(name: string, color?: string): FormData {
  const formData = new FormData();
  formData.set("name", name);
  if (color !== undefined) formData.set("color", color);
  return formData;
}

describe("createTagAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    createTagMock.mockReset();
  });

  it("タグ名が空の場合はフィールドエラーを返し、createTag を呼び出さない", async () => {
    const state = await createTagAction({ errors: {} }, makeFormData(""));

    expect(state.errors.name).toBeDefined();
    expect(createTagMock).not.toHaveBeenCalled();
  });

  it("作成成功時は /tags を再検証する", async () => {
    createTagMock.mockResolvedValue("tag-1");

    const state = await createTagAction(
      { errors: {} },
      makeFormData("研究", "#ff0000")
    );

    expect(createTagMock).toHaveBeenCalledWith({ name: "研究", color: "#ff0000" });
    expect(revalidatePathMock).toHaveBeenCalledWith("/tags");
    expect(state.errors).toEqual({});
  });

  it("API失敗時はエラーメッセージを返す", async () => {
    createTagMock.mockRejectedValue(
      new ApiError("http", "タグ名が既に存在します", 409)
    );

    const state = await createTagAction({ errors: {} }, makeFormData("研究"));

    expect(state.message).toBe("タグ名が既に存在します");
  });
});

describe("updateTagAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    updateTagMock.mockReset();
  });

  it("更新成功時は /tags を再検証する", async () => {
    updateTagMock.mockResolvedValue(undefined);

    const state = await updateTagAction(
      "tag-1",
      { errors: {} },
      makeFormData("終盤", "#00ff00")
    );

    expect(updateTagMock).toHaveBeenCalledWith("tag-1", {
      name: "終盤",
      color: "#00ff00",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/tags");
    expect(state.errors).toEqual({});
  });

  it("API失敗時はエラーメッセージを返す", async () => {
    updateTagMock.mockRejectedValue(new ApiError("http", "更新に失敗しました", 400));

    const state = await updateTagAction("tag-1", { errors: {} }, makeFormData("終盤"));

    expect(state.message).toBe("更新に失敗しました");
  });
});

describe("deleteTagAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    deleteTagMock.mockReset();
  });

  it("削除成功時は /tags を再検証する", async () => {
    deleteTagMock.mockResolvedValue(undefined);

    const state = await deleteTagAction("tag-1", {}, new FormData());

    expect(deleteTagMock).toHaveBeenCalledWith("tag-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/tags");
    expect(state.error).toBeUndefined();
  });

  it("削除失敗時はエラーメッセージを返す", async () => {
    deleteTagMock.mockRejectedValue(new ApiError("http", "削除に失敗しました", 404));

    const state = await deleteTagAction("tag-1", {}, new FormData());

    expect(state.error).toBe("削除に失敗しました");
  });
});
