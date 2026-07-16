import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MemoSection } from "@/features/games/MemoSection";
import { updateMemoAction } from "@/features/games/actions";

vi.mock("@/features/games/actions", () => ({
  updateMemoAction: vi.fn(),
}));

const mockedUpdateMemoAction = vi.mocked(updateMemoAction);

describe("MemoSection", () => {
  afterEach(() => {
    mockedUpdateMemoAction.mockReset();
  });

  it("メモが無い場合はプレースホルダーを表示する", () => {
    render(<MemoSection gameId="game-1" memo={null} />);

    expect(screen.getByText("メモはまだありません")).toBeInTheDocument();
  });

  it("既存のメモを表示する", () => {
    render(<MemoSection gameId="game-1" memo="既存メモ" />);

    expect(screen.getByText("既存メモ")).toBeInTheDocument();
  });

  it("編集→キャンセルで表示に戻り、アクションは呼ばれない", async () => {
    const user = userEvent.setup();
    render(<MemoSection gameId="game-1" memo="既存メモ" />);

    await user.click(screen.getByRole("button", { name: "編集" }));
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.getByText("既存メモ")).toBeInTheDocument();
    expect(mockedUpdateMemoAction).not.toHaveBeenCalled();
  });

  it("編集→保存で updateMemoAction を呼び、編集モードを終了する", async () => {
    mockedUpdateMemoAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<MemoSection gameId="game-1" memo="既存メモ" />);

    await user.click(screen.getByRole("button", { name: "編集" }));
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "更新後のメモ");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("既存メモ")).toBeInTheDocument();
    expect(mockedUpdateMemoAction).toHaveBeenCalledTimes(1);
    const [gameId, , formData] = mockedUpdateMemoAction.mock.calls[0];
    expect(gameId).toBe("game-1");
    expect((formData as FormData).get("memo")).toBe("更新後のメモ");
  });

  it("保存に失敗した場合はエラーメッセージを表示する", async () => {
    mockedUpdateMemoAction.mockResolvedValue({ error: "保存に失敗しました" });
    const user = userEvent.setup();
    render(<MemoSection gameId="game-1" memo="既存メモ" />);

    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("保存に失敗しました")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
