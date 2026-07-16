import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteGameButton } from "@/features/games/DeleteGameButton";
import { deleteGameAction } from "@/features/games/actions";

vi.mock("@/features/games/actions", () => ({
  deleteGameAction: vi.fn(),
}));

const mockedDeleteGameAction = vi.mocked(deleteGameAction);

describe("DeleteGameButton", () => {
  afterEach(() => {
    mockedDeleteGameAction.mockReset();
    vi.restoreAllMocks();
  });

  it("確認ダイアログでキャンセルした場合は削除アクションを呼ばない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<DeleteGameButton gameId="game-1" />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(mockedDeleteGameAction).not.toHaveBeenCalled();
  });

  it("確認ダイアログでOKした場合は削除アクションを呼び出す", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDeleteGameAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<DeleteGameButton gameId="game-1" />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(mockedDeleteGameAction).toHaveBeenCalledTimes(1);
    expect(mockedDeleteGameAction.mock.calls[0][0]).toBe("game-1");
  });

  it("削除に失敗した場合はエラーメッセージを表示する", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDeleteGameAction.mockResolvedValue({ error: "対局の削除に失敗しました。" });
    const user = userEvent.setup();
    render(<DeleteGameButton gameId="game-1" />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(
      await screen.findByText("対局の削除に失敗しました。")
    ).toBeInTheDocument();
  });
});
