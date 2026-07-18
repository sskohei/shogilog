import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GamesCountChart } from "@/features/dashboard/GamesCountChart";

const EMPTY_PROPS = { daily: [], weekly: [], monthly: [], yearly: [] };

describe("GamesCountChart", () => {
  it("初期状態では月別ラベルを表示する", () => {
    render(
      <GamesCountChart
        {...EMPTY_PROPS}
        monthly={[
          { month: "2026-06", game_count: 12 },
          { month: "2026-07", game_count: 18 },
        ]}
      />
    );

    expect(screen.getByText("対局数")).toBeInTheDocument();
    expect(screen.getByText("2026-06")).toBeInTheDocument();
    expect(screen.getByText("2026-07")).toBeInTheDocument();
  });

  it("日別・週別・年別ボタンで表示データを切り替えられる", async () => {
    const user = userEvent.setup();
    render(
      <GamesCountChart
        daily={[{ date: "2026-07-07", game_count: 3 }]}
        weekly={[{ week: "2026-07-06", game_count: 5 }]}
        monthly={[{ month: "2026-07", game_count: 18 }]}
        yearly={[{ year: "2026", game_count: 30 }]}
      />
    );

    expect(screen.getByText("2026-07")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "日別" }));
    expect(screen.getByText("07-07")).toBeInTheDocument();
    expect(screen.queryByText("2026-07-07")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "週別" }));
    expect(screen.getByText("2026-07-06")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "年別" }));
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("データが無い場合は案内文を表示する", () => {
    render(<GamesCountChart {...EMPTY_PROPS} />);

    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });
});
