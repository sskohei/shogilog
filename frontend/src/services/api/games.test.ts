import { describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/fetcher", () => ({
  apiFetch: apiFetchMock,
}));

import {
  fetchGame,
  fetchGameKifuUrl,
  updateGameMemo,
} from "@/services/api/games";

describe("fetchGame", () => {
  it("data を unwrap して返す", async () => {
    apiFetchMock.mockResolvedValue({ data: { id: "game-1" } });

    const game = await fetchGame("game-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1");
    expect(game).toEqual({ id: "game-1" });
  });
});

describe("fetchGameKifuUrl", () => {
  it("data.url を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: { url: "https://example.com/kifu" } });

    const url = await fetchGameKifuUrl("game-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1/kifu-url");
    expect(url).toBe("https://example.com/kifu");
  });

  it("棋譜ファイルが無い場合は null を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: { url: null } });

    const url = await fetchGameKifuUrl("game-1");

    expect(url).toBeNull();
  });
});

describe("updateGameMemo", () => {
  it("PUT でメモを更新する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await updateGameMemo("game-1", "更新後のメモ");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo: "更新後のメモ" }),
    });
  });
});
