import { describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/fetcher", () => ({
  apiFetch: apiFetchMock,
}));

import {
  addFavoriteOpening,
  fetchFavoriteOpeningIds,
  fetchOpenings,
  removeFavoriteOpening,
} from "@/services/api/openings";

describe("fetchOpenings", () => {
  it("data を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: [{ id: 1, name: "四間飛車" }] });

    const openings = await fetchOpenings();

    expect(apiFetchMock).toHaveBeenCalledWith("/openings");
    expect(openings).toEqual([{ id: 1, name: "四間飛車" }]);
  });
});

describe("fetchFavoriteOpeningIds", () => {
  it("お気に入り戦法IDの一覧を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: [1, 2] });

    const ids = await fetchFavoriteOpeningIds();

    expect(apiFetchMock).toHaveBeenCalledWith("/openings/favorites");
    expect(ids).toEqual([1, 2]);
  });
});

describe("addFavoriteOpening", () => {
  it("POST でお気に入りに登録する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await addFavoriteOpening(1);

    expect(apiFetchMock).toHaveBeenCalledWith("/openings/1/favorite", {
      method: "POST",
    });
  });
});

describe("removeFavoriteOpening", () => {
  it("DELETE でお気に入りを解除する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await removeFavoriteOpening(1);

    expect(apiFetchMock).toHaveBeenCalledWith("/openings/1/favorite", {
      method: "DELETE",
    });
  });
});
