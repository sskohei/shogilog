import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  revalidatePathMock,
  redirectMock,
  updateGameMemoMock,
  createGameMock,
  updateGameMock,
  deleteGameMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
  updateGameMemoMock: vi.fn(),
  createGameMock: vi.fn(),
  updateGameMock: vi.fn(),
  deleteGameMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/services/api/games", () => ({
  updateGameMemo: updateGameMemoMock,
  createGame: createGameMock,
  updateGame: updateGameMock,
  deleteGame: deleteGameMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: vi.fn(),
}));

import { ApiError } from "@/lib/fetcher";
import {
  createGameAction,
  deleteGameAction,
  updateGameAction,
  updateMemoAction,
} from "@/features/games/actions";

function makeValidFormData(): FormData {
  const formData = new FormData();
  formData.set("platform_id", "1");
  formData.set("played_at", "2026-07-05T10:00");
  formData.set("result", "win");
  formData.set("side", "sente");
  return formData;
}

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

    expect(state.error).toBe("メモの保存に失敗しました。");
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});

describe("createGameAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    createGameMock.mockReset();
  });

  it("必須項目が不正な場合はフィールドエラーを返し、createGame を呼び出さない", async () => {
    const formData = new FormData();
    formData.set("platform_id", "");
    formData.set("played_at", "");
    formData.set("result", "");
    formData.set("side", "");

    const state = await createGameAction({ errors: {} }, formData);

    expect(state.errors.platform_id).toBeDefined();
    expect(createGameMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("登録成功時は作成した対局の詳細ページへリダイレクトする", async () => {
    createGameMock.mockResolvedValue("game-1");

    await createGameAction({ errors: {} }, makeValidFormData());

    expect(createGameMock).toHaveBeenCalledWith(
      expect.objectContaining({
        platform_id: 1,
        result: "win",
        side: "sente",
      })
    );
    expect(redirectMock).toHaveBeenCalledWith("/games/game-1");
  });

  it("API失敗時はエラーメッセージを返し、リダイレクトしない", async () => {
    createGameMock.mockRejectedValue(
      new ApiError("http", "対局の登録に失敗しました", 400)
    );

    const state = await createGameAction({ errors: {} }, makeValidFormData());

    expect(state.message).toBe("対局の登録に失敗しました。");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("422でフィールドエラーが返された場合は該当フィールドにエラーを反映する", async () => {
    createGameMock.mockRejectedValue(
      new ApiError("http", "リクエストに失敗しました (status: 422)", 422, [
        { loc: ["body", "rating_after"], msg: "...", type: "value_error" },
      ])
    );

    const state = await createGameAction({ errors: {} }, makeValidFormData());

    expect(state.errors.rating_after).toBeDefined();
    expect(state.message).toBe("入力内容を確認してください。");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("updateGameAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    revalidatePathMock.mockClear();
    updateGameMock.mockReset();
  });

  it("必須項目が不正な場合はフィールドエラーを返し、updateGame を呼び出さない", async () => {
    const formData = new FormData();
    formData.set("platform_id", "");
    formData.set("played_at", "");
    formData.set("result", "");
    formData.set("side", "");

    const state = await updateGameAction("game-1", { errors: {} }, formData);

    expect(state.errors.platform_id).toBeDefined();
    expect(updateGameMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("更新成功時は該当ページを再検証し、詳細ページへリダイレクトする", async () => {
    updateGameMock.mockResolvedValue(undefined);

    await updateGameAction("game-1", { errors: {} }, makeValidFormData());

    expect(updateGameMock).toHaveBeenCalledWith(
      "game-1",
      expect.objectContaining({ platform_id: 1, result: "win", side: "sente" })
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/games/game-1");
    expect(redirectMock).toHaveBeenCalledWith("/games/game-1");
  });

  it("API失敗時はエラーメッセージを返し、リダイレクトしない", async () => {
    updateGameMock.mockRejectedValue(
      new ApiError("http", "対局の更新に失敗しました", 400)
    );

    const state = await updateGameAction(
      "game-1",
      { errors: {} },
      makeValidFormData()
    );

    expect(state.message).toBe("対局の更新に失敗しました。");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("422でフィールドエラーが返された場合は該当フィールドにエラーを反映する", async () => {
    updateGameMock.mockRejectedValue(
      new ApiError("http", "リクエストに失敗しました (status: 422)", 422, [
        { loc: ["body", "rank_after"], msg: "...", type: "value_error" },
      ])
    );

    const state = await updateGameAction(
      "game-1",
      { errors: {} },
      makeValidFormData()
    );

    expect(state.errors.rank_after).toBeDefined();
    expect(state.message).toBe("入力内容を確認してください。");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("deleteGameAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    deleteGameMock.mockReset();
  });

  it("削除成功時は一覧ページへリダイレクトする", async () => {
    deleteGameMock.mockResolvedValue(undefined);

    await deleteGameAction("game-1", {}, new FormData());

    expect(deleteGameMock).toHaveBeenCalledWith("game-1");
    expect(redirectMock).toHaveBeenCalledWith("/games");
  });

  it("削除失敗時はエラーメッセージを返し、リダイレクトしない", async () => {
    deleteGameMock.mockRejectedValue(
      new ApiError("http", "対局の削除に失敗しました", 404)
    );

    const state = await deleteGameAction("game-1", {}, new FormData());

    expect(state.error).toBe("対局の削除に失敗しました。");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
