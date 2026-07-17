import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { findRankChanges, RatingHistoryChart } from "@/features/dashboard/RatingHistoryChart";

describe("RatingHistoryChart", () => {
  it("対局数が最も多いプラットフォームを初期選択し、タブで切り替えられる", async () => {
    const user = userEvent.setup();
    render(
      <RatingHistoryChart
        data={[
          { platform_id: 1, rating: 1200, rank: null, recorded_at: "2026-06-10T10:00:00+00:00" },
          { platform_id: 1, rating: 1215, rank: null, recorded_at: "2026-07-05T10:00:00+00:00" },
          { platform_id: 2, rating: 1500, rank: null, recorded_at: "2026-07-06T10:00:00+00:00" },
        ]}
      />
    );

    expect(screen.getByText("レーティング推移")).toBeInTheDocument();

    const platform1Tab = screen.getByRole("button", { name: "将棋ウォーズ" });
    const platform2Tab = screen.getByRole("button", { name: "将棋クエスト" });
    expect(platform1Tab).toBeInTheDocument();
    expect(platform2Tab).toBeInTheDocument();
    expect(platform1Tab.className).toContain("bg-primary");
    expect(platform2Tab.className).not.toContain("bg-primary");

    await user.click(platform2Tab);

    expect(platform2Tab.className).toContain("bg-primary");
    expect(platform1Tab.className).not.toContain("bg-primary");
  });

  it("段位が含まれるデータでもクラッシュせずに表示する", () => {
    render(
      <RatingHistoryChart
        data={[
          { platform_id: 1, rating: 25, rank: "初段", recorded_at: "2026-07-16T13:18:00+00:00" },
          { platform_id: 1, rating: 30, rank: "初段", recorded_at: "2026-07-17T13:46:00+00:00" },
        ]}
      />
    );

    expect(screen.getByText("レーティング推移")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "将棋ウォーズ" })).toBeInTheDocument();
  });

  it("データが無い場合は案内文を表示する", () => {
    render(<RatingHistoryChart data={[]} />);

    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });
});

describe("findRankChanges", () => {
  it("段位が変化した地点のみを変化順に返す", () => {
    const changes = findRankChanges([
      { platform_id: 1, index: 0, rating: 10, rank: "初段" },
      { platform_id: 1, index: 1, rating: 40, rank: "初段" },
      { platform_id: 1, index: 2, rating: 80, rank: "初段" },
      { platform_id: 1, index: 3, rating: 5, rank: "二段" },
      { platform_id: 1, index: 4, rating: 50, rank: "二段" },
    ]);

    expect(changes).toEqual([
      { index: 0, rank: "初段" },
      { index: 3, rank: "二段" },
    ]);
  });

  it("段位が記録されていない点は無視する", () => {
    const changes = findRankChanges([
      { platform_id: 1, index: 0, rating: 1200, rank: null },
      { platform_id: 1, index: 1, rating: 1210, rank: null },
    ]);

    expect(changes).toEqual([]);
  });
});
