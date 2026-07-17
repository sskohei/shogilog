import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PlatformRatingRow } from "@/features/profile/PlatformRatingRow";
import { updatePlatformRatingAction } from "@/features/profile/actions";
import type { PlatformRating } from "@/types/profile";

vi.mock("@/features/profile/actions", () => ({
  updatePlatformRatingAction: vi.fn(),
}));

const mockedUpdatePlatformRatingAction = vi.mocked(updatePlatformRatingAction);

describe("PlatformRatingRow", () => {
  afterEach(() => {
    mockedUpdatePlatformRatingAction.mockReset();
  });

  it("未プレイの場合はレート/段級位の入力欄を表示しない", () => {
    const rating: PlatformRating = {
      platform_id: 1,
      has_played: false,
      rating: null,
      rank: null,
      updated_at: null,
    };
    render(<PlatformRatingRow rating={rating} />);

    expect(screen.getByText("将棋ウォーズ")).toBeInTheDocument();
    expect(screen.queryByLabelText("段級位")).not.toBeInTheDocument();
  });

  it("プレイ済みかつ段位制プラットフォームの場合は段級位の選択欄を表示する", () => {
    const rating: PlatformRating = {
      platform_id: 1,
      has_played: true,
      rating: null,
      rank: "三段",
      updated_at: "2026-07-10T09:00:00.000Z",
    };
    render(<PlatformRatingRow rating={rating} />);

    expect(screen.getByLabelText("段級位")).toHaveValue("三段");
  });

  it("プレイ済みかつレート制プラットフォームの場合はレート入力欄を表示する", () => {
    const rating: PlatformRating = {
      platform_id: 2,
      has_played: true,
      rating: 1500,
      rank: null,
      updated_at: "2026-07-10T09:00:00.000Z",
    };
    render(<PlatformRatingRow rating={rating} />);

    expect(screen.getByLabelText("レーティング")).toHaveValue(1500);
  });

  it("状態を未プレイからプレイ済みに切り替えると入力欄が表示される", async () => {
    const rating: PlatformRating = {
      platform_id: 2,
      has_played: false,
      rating: null,
      rank: null,
      updated_at: null,
    };
    const user = userEvent.setup();
    render(<PlatformRatingRow rating={rating} />);

    await user.selectOptions(screen.getByLabelText("状態"), "プレイ済み");

    expect(screen.getByLabelText("レーティング")).toBeInTheDocument();
  });

  it("保存ボタンをクリックすると updatePlatformRatingAction を呼び出す", async () => {
    mockedUpdatePlatformRatingAction.mockResolvedValue({});
    const rating: PlatformRating = {
      platform_id: 2,
      has_played: true,
      rating: 1500,
      rank: null,
      updated_at: "2026-07-10T09:00:00.000Z",
    };
    const user = userEvent.setup();
    render(<PlatformRatingRow rating={rating} />);

    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(mockedUpdatePlatformRatingAction).toHaveBeenCalledTimes(1);
    expect(mockedUpdatePlatformRatingAction.mock.calls[0][0]).toBe(2);
  });
});
