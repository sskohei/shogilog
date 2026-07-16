import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GameForm } from "@/features/games/GameForm";
import { createGameAction, updateGameAction } from "@/features/games/actions";
import type { Game } from "@/types/game";

vi.mock("@/features/games/actions", () => ({
  createGameAction: vi.fn(),
  updateGameAction: vi.fn(),
}));

const mockedCreateGameAction = vi.mocked(createGameAction);
const mockedUpdateGameAction = vi.mocked(updateGameAction);

const sampleGame: Game = {
  id: "game-1",
  user_id: "user-1",
  platform_id: 1,
  played_at: "2026-07-05T10:00:00.000Z",
  result: "win",
  side: "sente",
  my_opening_id: null,
  opponent_opening_id: null,
  rating_before: 65,
  rating_after: 80,
  opponent_name: "player123",
  opponent_rating: 40,
  rank_before: "二段",
  rank_after: "三段",
  opponent_rank: "初段",
  memo: "既存メモ",
  kifu_path: null,
  created_at: "2026-07-05T10:10:00.000Z",
  updated_at: "2026-07-05T10:10:00.000Z",
};

const openings = [
  { id: 1, name: "四間飛車", slug: "shikenbisha", category: "ranging_rook" as const, description: null, is_active: true, created_at: "" },
  { id: 2, name: "居飛車", slug: "ibisha", category: "static_rook" as const, description: null, is_active: true, created_at: "" },
];

describe("GameForm", () => {
  afterEach(() => {
    mockedCreateGameAction.mockReset();
    mockedUpdateGameAction.mockReset();
  });

  it("必須フィールドを表示する", () => {
    render(<GameForm openings={openings} />);

    expect(screen.getByLabelText("対局サービス")).toBeInTheDocument();
    expect(screen.getByLabelText("対局日時")).toBeInTheDocument();
    expect(screen.getByLabelText("結果")).toBeInTheDocument();
    expect(screen.getByLabelText("手番")).toBeInTheDocument();
  });

  it("バリデーションエラーがある場合はエラーメッセージを表示する", async () => {
    mockedCreateGameAction.mockResolvedValue({
      errors: { platform_id: ["対局サービスを選択してください"] },
    });

    const user = userEvent.setup();
    render(<GameForm openings={openings} />);

    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(
      await screen.findByText("対局サービスを選択してください")
    ).toBeInTheDocument();
  });

  it("入力内容を含む FormData で createGameAction を呼び出す", async () => {
    mockedCreateGameAction.mockResolvedValue({ errors: {} });

    const user = userEvent.setup();
    render(<GameForm openings={openings} />);

    await user.selectOptions(screen.getByLabelText("対局サービス"), "1");
    await user.type(screen.getByLabelText("対局日時"), "2026-07-05T10:00");
    await user.selectOptions(screen.getByLabelText("結果"), "win");
    await user.selectOptions(screen.getByLabelText("手番"), "sente");
    await user.type(screen.getByLabelText("対戦相手"), "player123");
    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(mockedCreateGameAction).toHaveBeenCalledTimes(1);
    const [, formData] = mockedCreateGameAction.mock.calls[0];
    expect((formData as FormData).get("platform_id")).toBe("1");
    expect((formData as FormData).get("result")).toBe("win");
    expect((formData as FormData).get("side")).toBe("sente");
    expect((formData as FormData).get("opponent_name")).toBe("player123");
  });

  it("登録に失敗した場合はメッセージを表示する", async () => {
    mockedCreateGameAction.mockResolvedValue({
      errors: {},
      message: "対局の登録に失敗しました。",
    });

    const user = userEvent.setup();
    render(<GameForm openings={openings} />);

    await user.click(screen.getByRole("button", { name: "登録する" }));

    expect(
      await screen.findByText("対局の登録に失敗しました。")
    ).toBeInTheDocument();
  });

  it("段位制プラットフォーム選択時のみ段位フィールドを表示し、ラベルが%に変わる", async () => {
    const user = userEvent.setup();
    render(<GameForm openings={openings} />);

    expect(screen.queryByLabelText("対局前段位")).not.toBeInTheDocument();
    expect(screen.getByLabelText("対局前レーティング")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("対局サービス"), "1");

    expect(screen.getByLabelText("対局前段位")).toBeInTheDocument();
    expect(screen.getByLabelText("対局後段位")).toBeInTheDocument();
    expect(screen.getByLabelText("相手の段位")).toBeInTheDocument();
    expect(screen.getByLabelText("対局前%")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("対局サービス"), "2");

    expect(screen.queryByLabelText("対局前段位")).not.toBeInTheDocument();
    expect(screen.getByLabelText("対局前レーティング")).toBeInTheDocument();
  });

  it("編集モードでは既存の値が初期表示され、更新するボタンが表示される", () => {
    render(<GameForm openings={openings} mode="edit" game={sampleGame} />);

    expect(screen.getByRole("button", { name: "更新する" })).toBeInTheDocument();
    expect(screen.getByLabelText("対局サービス")).toHaveValue("1");
    expect(screen.getByLabelText("対戦相手")).toHaveValue("player123");
    expect(screen.getByLabelText("対局前段位")).toHaveValue("二段");
    expect(screen.getByLabelText("対局前%")).toHaveValue(65);
  });

  it("編集モードでの送信は updateGameAction を呼び出す", async () => {
    mockedUpdateGameAction.mockResolvedValue({ errors: {} });
    const user = userEvent.setup();
    render(<GameForm openings={openings} mode="edit" game={sampleGame} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockedUpdateGameAction).toHaveBeenCalledTimes(1);
    expect(mockedUpdateGameAction.mock.calls[0][0]).toBe("game-1");
  });
});
