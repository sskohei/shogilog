import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GameTagsSection } from "@/features/games/GameTagsSection";
import { linkGameTagAction, unlinkGameTagAction } from "@/features/games/actions";
import type { Tag } from "@/types/tag";

vi.mock("@/features/games/actions", () => ({
  linkGameTagAction: vi.fn(),
  unlinkGameTagAction: vi.fn(),
}));

const mockedLinkGameTagAction = vi.mocked(linkGameTagAction);
const mockedUnlinkGameTagAction = vi.mocked(unlinkGameTagAction);

const tagA: Tag = {
  id: "tag-a",
  user_id: "user-1",
  name: "研究",
  color: "#ff0000",
  created_at: "",
  updated_at: "",
};
const tagB: Tag = {
  id: "tag-b",
  user_id: "user-1",
  name: "終盤",
  color: null,
  created_at: "",
  updated_at: "",
};

describe("GameTagsSection", () => {
  afterEach(() => {
    mockedLinkGameTagAction.mockReset();
    mockedUnlinkGameTagAction.mockReset();
  });

  it("付与済みタグを表示し、未付与タグのみ選択肢に表示する", () => {
    render(<GameTagsSection gameId="game-1" gameTags={[tagA]} allTags={[tagA, tagB]} />);

    expect(screen.getByText("研究")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "終盤" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "研究" })).not.toBeInTheDocument();
  });

  it("タグが無い場合は案内文を表示する", () => {
    render(<GameTagsSection gameId="game-1" gameTags={[]} allTags={[]} />);

    expect(screen.getByText("タグは設定されていません")).toBeInTheDocument();
  });

  it("タグを選択して追加すると linkGameTagAction を呼び出す", async () => {
    mockedLinkGameTagAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<GameTagsSection gameId="game-1" gameTags={[]} allTags={[tagA]} />);

    await user.selectOptions(screen.getByRole("combobox"), "tag-a");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(mockedLinkGameTagAction).toHaveBeenCalledTimes(1);
    expect(mockedLinkGameTagAction.mock.calls[0][0]).toBe("game-1");
    const [, , formData] = mockedLinkGameTagAction.mock.calls[0];
    expect((formData as FormData).get("tag_id")).toBe("tag-a");
  });

  it("×ボタンをクリックすると unlinkGameTagAction を呼び出す", async () => {
    mockedUnlinkGameTagAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<GameTagsSection gameId="game-1" gameTags={[tagA]} allTags={[tagA]} />);

    await user.click(screen.getByRole("button", { name: "タグを解除" }));

    expect(mockedUnlinkGameTagAction).toHaveBeenCalledTimes(1);
    expect(mockedUnlinkGameTagAction.mock.calls[0][0]).toBe("game-1");
    expect(mockedUnlinkGameTagAction.mock.calls[0][1]).toBe("tag-a");
  });
});
