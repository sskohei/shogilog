import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePathMock, addFavoriteOpeningMock, removeFavoriteOpeningMock } =
  vi.hoisted(() => ({
    revalidatePathMock: vi.fn(),
    addFavoriteOpeningMock: vi.fn(),
    removeFavoriteOpeningMock: vi.fn(),
  }));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/services/api/openings", () => ({
  addFavoriteOpening: addFavoriteOpeningMock,
  removeFavoriteOpening: removeFavoriteOpeningMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: vi.fn(),
}));

import {
  addFavoriteOpeningAction,
  removeFavoriteOpeningAction,
} from "@/features/openings/actions";

describe("addFavoriteOpeningAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    addFavoriteOpeningMock.mockReset();
  });

  it("成功時は /openings を再検証する", async () => {
    addFavoriteOpeningMock.mockResolvedValue(undefined);

    const state = await addFavoriteOpeningAction(1, {}, new FormData());

    expect(addFavoriteOpeningMock).toHaveBeenCalledWith(1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/openings");
    expect(state).toEqual({});
  });

  it("失敗時はエラーメッセージを返す", async () => {
    addFavoriteOpeningMock.mockRejectedValue(new Error("failed"));

    const state = await addFavoriteOpeningAction(1, {}, new FormData());

    expect(state.error).toBe("お気に入りの登録に失敗しました。");
  });
});

describe("removeFavoriteOpeningAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    removeFavoriteOpeningMock.mockReset();
  });

  it("成功時は /openings を再検証する", async () => {
    removeFavoriteOpeningMock.mockResolvedValue(undefined);

    const state = await removeFavoriteOpeningAction(1, {}, new FormData());

    expect(removeFavoriteOpeningMock).toHaveBeenCalledWith(1);
    expect(revalidatePathMock).toHaveBeenCalledWith("/openings");
    expect(state).toEqual({});
  });
});
