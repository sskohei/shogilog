import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GameForm } from "@/features/games/GameForm";
import { createGameAction } from "@/features/games/actions";

vi.mock("@/features/games/actions", () => ({
  createGameAction: vi.fn(),
}));

const mockedCreateGameAction = vi.mocked(createGameAction);

const openings = [
  { id: 1, name: "四間飛車", slug: "shikenbisha", category: "ranging_rook" as const, description: null, is_active: true, created_at: "" },
  { id: 2, name: "居飛車", slug: "ibisha", category: "static_rook" as const, description: null, is_active: true, created_at: "" },
];

describe("GameForm", () => {
  afterEach(() => {
    mockedCreateGameAction.mockReset();
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
});
