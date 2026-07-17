import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProfileForm } from "@/features/profile/ProfileForm";
import { updateProfileAction } from "@/features/profile/actions";
import type { Profile } from "@/types/profile";

vi.mock("@/features/profile/actions", () => ({
  updateProfileAction: vi.fn(),
}));

const mockedUpdateProfileAction = vi.mocked(updateProfileAction);

const profile: Profile = {
  id: "user-1",
  display_name: "太郎",
  bio: "四間飛車党です",
  avatar_url: null,
  created_at: "2026-07-05T10:00:00.000Z",
  updated_at: "2026-07-05T10:00:00.000Z",
};

describe("ProfileForm", () => {
  afterEach(() => {
    mockedUpdateProfileAction.mockReset();
  });

  it("表示名・自己紹介の初期値を表示する", () => {
    render(<ProfileForm profile={profile} />);

    expect(screen.getByLabelText("表示名")).toHaveValue("太郎");
    expect(screen.getByLabelText("自己紹介")).toHaveValue("四間飛車党です");
  });

  it("バリデーションエラーがある場合はエラーメッセージを表示する", async () => {
    mockedUpdateProfileAction.mockResolvedValue({
      errors: { display_name: ["表示名が長すぎます"] },
    });

    const user = userEvent.setup();
    render(<ProfileForm profile={profile} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(await screen.findByText("表示名が長すぎます")).toBeInTheDocument();
  });

  it("更新に失敗した場合はメッセージを表示する", async () => {
    mockedUpdateProfileAction.mockResolvedValue({
      errors: {},
      message: "プロフィールの更新に失敗しました。",
    });

    const user = userEvent.setup();
    render(<ProfileForm profile={profile} />);

    await user.click(screen.getByRole("button", { name: "更新する" }));

    expect(
      await screen.findByText("プロフィールの更新に失敗しました。")
    ).toBeInTheDocument();
  });
});
