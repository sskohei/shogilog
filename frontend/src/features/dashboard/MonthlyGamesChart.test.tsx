import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MonthlyGamesChart } from "@/features/dashboard/MonthlyGamesChart";

describe("MonthlyGamesChart", () => {
  it("月ラベルを表示する", () => {
    render(
      <MonthlyGamesChart
        data={[
          { month: "2026-06", game_count: 12 },
          { month: "2026-07", game_count: 18 },
        ]}
      />
    );

    expect(screen.getByText("月別対局数")).toBeInTheDocument();
    expect(screen.getByText("2026-06")).toBeInTheDocument();
    expect(screen.getByText("2026-07")).toBeInTheDocument();
  });

  it("データが無い場合は案内文を表示する", () => {
    render(<MonthlyGamesChart data={[]} />);

    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });
});
