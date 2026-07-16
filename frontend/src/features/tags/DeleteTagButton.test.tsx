import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DeleteTagButton } from "@/features/tags/DeleteTagButton";
import { deleteTagAction } from "@/features/tags/actions";

vi.mock("@/features/tags/actions", () => ({
  deleteTagAction: vi.fn(),
}));

const mockedDeleteTagAction = vi.mocked(deleteTagAction);

describe("DeleteTagButton", () => {
  afterEach(() => {
    mockedDeleteTagAction.mockReset();
    vi.restoreAllMocks();
  });

  it("確認ダイアログでキャンセルした場合は削除アクションを呼ばない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<DeleteTagButton tagId="tag-1" />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(mockedDeleteTagAction).not.toHaveBeenCalled();
  });

  it("確認ダイアログでOKした場合は削除アクションを呼び出す", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDeleteTagAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<DeleteTagButton tagId="tag-1" />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(mockedDeleteTagAction).toHaveBeenCalledTimes(1);
    expect(mockedDeleteTagAction.mock.calls[0][0]).toBe("tag-1");
  });

  it("削除に失敗した場合はエラーメッセージを表示する", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedDeleteTagAction.mockResolvedValue({ error: "タグの削除に失敗しました。" });
    const user = userEvent.setup();
    render(<DeleteTagButton tagId="tag-1" />);

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(await screen.findByText("タグの削除に失敗しました。")).toBeInTheDocument();
  });
});
