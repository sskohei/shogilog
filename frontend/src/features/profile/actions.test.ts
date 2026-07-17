import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePathMock, updateProfileMock, updatePlatformRatingMock } = vi.hoisted(
  () => ({
    revalidatePathMock: vi.fn(),
    updateProfileMock: vi.fn(),
    updatePlatformRatingMock: vi.fn(),
  })
);

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/services/api/profile", () => ({
  updateProfile: updateProfileMock,
  updatePlatformRating: updatePlatformRatingMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: vi.fn(),
}));

import { updatePlatformRatingAction, updateProfileAction } from "@/features/profile/actions";

describe("updateProfileAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    updateProfileMock.mockReset();
  });

  it("表示名が長すぎる場合はフィールドエラーを返し、updateProfile を呼び出さない", async () => {
    const formData = new FormData();
    formData.set("display_name", "a".repeat(31));

    const state = await updateProfileAction({ errors: {} }, formData);

    expect(state.errors.display_name).toBeDefined();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it("更新成功時は /profile を再検証する", async () => {
    updateProfileMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("display_name", "太郎");
    formData.set("bio", "四間飛車党です");

    const state = await updateProfileAction({ errors: {} }, formData);

    expect(updateProfileMock).toHaveBeenCalledWith({
      display_name: "太郎",
      bio: "四間飛車党です",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
    expect(state.errors).toEqual({});
  });
});

describe("updatePlatformRatingAction", () => {
  beforeEach(() => {
    revalidatePathMock.mockClear();
    updatePlatformRatingMock.mockReset();
  });

  it("未プレイを選択した場合は rating/rank を null で送信する", async () => {
    updatePlatformRatingMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("has_played", "not_played");
    formData.set("rating", "1500");

    await updatePlatformRatingAction(1, {}, formData);

    expect(updatePlatformRatingMock).toHaveBeenCalledWith(1, {
      has_played: false,
      rating: null,
      rank: null,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/profile");
  });

  it("プレイ済みを選択した場合は入力値を送信する", async () => {
    updatePlatformRatingMock.mockResolvedValue(undefined);
    const formData = new FormData();
    formData.set("has_played", "played");
    formData.set("rating", "1500");

    await updatePlatformRatingAction(1, {}, formData);

    expect(updatePlatformRatingMock).toHaveBeenCalledWith(1, {
      has_played: true,
      rating: 1500,
      rank: null,
    });
  });
});
