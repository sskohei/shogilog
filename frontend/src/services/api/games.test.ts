import { describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/fetcher", () => ({
  apiFetch: apiFetchMock,
}));

import {
  createGame,
  deleteGame,
  fetchGame,
  fetchGameKifuUrl,
  fetchGameTags,
  linkGameTag,
  unlinkGameTag,
  updateGame,
  updateGameMemo,
} from "@/services/api/games";
import type { GameCreatePayload } from "@/types/game";

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

describe("createGame", () => {
  it("POST で対局を作成し、作成された id を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: { id: "game-1" } });

    const payload: GameCreatePayload = {
      platform_id: 1,
      played_at: "2026-07-05T10:00:00.000Z",
      result: "win",
      side: "sente",
      memo: null,
    };

    const id = await createGame(payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(id).toBe("game-1");
  });
});

describe("updateGame", () => {
  it("PUT で対局を更新する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    const payload: GameCreatePayload = {
      platform_id: 1,
      played_at: "2026-07-05T10:00:00.000Z",
      result: "win",
      side: "sente",
      memo: null,
    };

    await updateGame("game-1", payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  });
});

describe("deleteGame", () => {
  it("DELETE で対局を削除する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await deleteGame("game-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1", {
      method: "DELETE",
    });
  });
});

describe("fetchGameTags", () => {
  it("対局に紐づくタグ一覧を返す", async () => {
    apiFetchMock.mockResolvedValue({ data: [{ id: "tag-1", name: "研究" }] });

    const tags = await fetchGameTags("game-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1/tags");
    expect(tags).toEqual([{ id: "tag-1", name: "研究" }]);
  });
});

describe("linkGameTag", () => {
  it("POST で対局にタグを追加する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await linkGameTag("game-1", "tag-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: "tag-1" }),
    });
  });
});

describe("unlinkGameTag", () => {
  it("DELETE で対局からタグを解除する", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    await unlinkGameTag("game-1", "tag-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/games/game-1/tags/tag-1", {
      method: "DELETE",
    });
  });
});
