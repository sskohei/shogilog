import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePathMock, updateGameMemoMock } = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  updateGameMemoMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/services/api/games", () => ({
  updateGameMemo: updateGameMemoMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: vi.fn(),
}));

import { ApiError } from "@/lib/fetcher";
import { updateMemoAction } from "@/features/games/actions";

describe("updateMemoAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    updateGameMemoMock.mockReset();
  });

  it("保存成功時は該当ページを再検証し、エラーの無い state を返す", async () => {
    updateGameMemoMock.mockResolvedValue(undefined);

    const formData = new FormData();
    formData.set("memo", "更新後のメモ");

    const state = await updateMemoAction("game-1", {}, formData);

    expect(updateGameMemoMock).toHaveBeenCalledWith("game-1", "更新後のメモ");
    expect(revalidatePathMock).toHaveBeenCalledWith("/games/game-1");
    expect(state.error).toBeUndefined();
  });

  it("保存失敗時はエラーメッセージを返し、再検証しない", async () => {
    updateGameMemoMock.mockRejectedValue(
      new ApiError("http", "対局が見つかりません", 404)
    );

    const formData = new FormData();
    formData.set("memo", "更新後のメモ");

    const state = await updateMemoAction("game-1", {}, formData);

    expect(state.error).toBe("対局が見つかりません");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
