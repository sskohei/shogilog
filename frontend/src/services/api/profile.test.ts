import { describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/fetcher", () => ({
  apiFetch: apiFetchMock,
}));

import {
  fetchPlatformRatings,
  fetchProfile,
  updatePlatformRating,
  updateProfile,
} from "@/services/api/profile";

describe("fetchProfile", () => {
  it("data を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: { id: "user-1", display_name: "太郎" } });

    const profile = await fetchProfile();

    expect(apiFetchMock).toHaveBeenCalledWith("/profile");
    expect(profile).toEqual({ id: "user-1", display_name: "太郎" });
  });
});

describe("updateProfile", () => {
  it("PUT でプロフィールを更新する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await updateProfile({ display_name: "次郎", bio: null });

    expect(apiFetchMock).toHaveBeenCalledWith("/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: "次郎", bio: null }),
    });
  });
});

describe("fetchPlatformRatings", () => {
  it("プラットフォーム別レート一覧を返す", async () => {
    apiFetchMock.mockResolvedValue({
      data: [{ platform_id: 1, has_played: false, rating: null, rank: null, updated_at: null }],
    });

    const ratings = await fetchPlatformRatings();

    expect(apiFetchMock).toHaveBeenCalledWith("/profile/platform-ratings");
    expect(ratings).toEqual([
      { platform_id: 1, has_played: false, rating: null, rank: null, updated_at: null },
    ]);
  });
});

describe("updatePlatformRating", () => {
  it("PUT でプラットフォーム別レートを更新する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await updatePlatformRating(1, { has_played: true, rating: 1500 });

    expect(apiFetchMock).toHaveBeenCalledWith("/profile/platform-ratings/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ has_played: true, rating: 1500 }),
    });
  });
});
