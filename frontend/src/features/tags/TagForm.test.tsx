import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TagForm } from "@/features/tags/TagForm";
import { createTagAction, updateTagAction } from "@/features/tags/actions";
import type { Tag } from "@/types/tag";

vi.mock("@/features/tags/actions", () => ({
  createTagAction: vi.fn(),
  updateTagAction: vi.fn(),
}));

const mockedCreateTagAction = vi.mocked(createTagAction);
const mockedUpdateTagAction = vi.mocked(updateTagAction);

const sampleTag: Tag = {
  id: "tag-1",
  user_id: "user-1",
  name: "研究",
  color: "#ff0000",
  created_at: "2026-07-05T10:00:00.000Z",
  updated_at: "2026-07-05T10:00:00.000Z",
};

describe("TagForm", () => {
  afterEach(() => {
    mockedCreateTagAction.mockReset();
    mockedUpdateTagAction.mockReset();
  });

  it("タグ名・色フィールドを表示する", () => {
    render(<TagForm />);

    expect(screen.getByLabelText("タグ名")).toBeInTheDocument();
    expect(screen.getByLabelText("色")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加する" })).toBeInTheDocument();
  });

  it("バリデーションエラーがある場合はエラーメッセージを表示する", async () => {
    mockedCreateTagAction.mockResolvedValue({
      errors: { name: ["タグ名を入力してください"] },
    });

    const user = userEvent.setup();
    render(<TagForm />);

    await user.click(screen.getByRole("button", { name: "追加する" }));

    expect(
      await screen.findByText("タグ名を入力してください")
    ).toBeInTheDocument();
  });

  it("入力内容を含む FormData で createTagAction を呼び出す", async () => {
    mockedCreateTagAction.mockResolvedValue({ errors: {} });

    const user = userEvent.setup();
    render(<TagForm />);

    await user.type(screen.getByLabelText("タグ名"), "終盤");
    await user.click(screen.getByRole("button", { name: "追加する" }));

    expect(mockedCreateTagAction).toHaveBeenCalledTimes(1);
    const [, formData] = mockedCreateTagAction.mock.calls[0];
    expect((formData as FormData).get("name")).toBe("終盤");
  });

  it("作成に失敗した場合はメッセージを表示する", async () => {
    mockedCreateTagAction.mockResolvedValue({
      errors: {},
      message: "タグの作成に失敗しました。",
    });

    const user = userEvent.setup();
    render(<TagForm />);

    await user.click(screen.getByRole("button", { name: "追加する" }));

    expect(
      await screen.findByText("タグの作成に失敗しました。")
    ).toBeInTheDocument();
  });

  it("編集モードでは既存の値が初期表示され、更新するボタンが表示される", () => {
    render(<TagForm mode="edit" tag={sampleTag} />);

    expect(screen.getByRole("button", { name: "更新する" })).toBeInTheDocument();
    expect(screen.getByLabelText("タグ名")).toHaveValue("研究");
  });

  it("編集モードでの送信は updateTagAction を呼び出す", async () => {
    mockedUpdateTagAction.mockResolvedValue({ errors: {} });
    const user = userEvent.setup();
    render(<TagForm mode="edit" tag={sampleTag} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(mockedUpdateTagAction).toHaveBeenCalledTimes(1);
    expect(mockedUpdateTagAction.mock.calls[0][0]).toBe("tag-1");
  });

  it("編集モードで更新成功時は onSuccess を呼び出す", async () => {
    mockedUpdateTagAction.mockResolvedValue({ errors: {} });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<TagForm mode="edit" tag={sampleTag} onSuccess={onSuccess} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
