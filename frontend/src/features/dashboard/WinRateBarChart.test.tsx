import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WinRateBarChart } from "@/features/dashboard/WinRateBarChart";

describe("WinRateBarChart", () => {
  it("タイトルとラベルを表示する", () => {
    render(
      <WinRateBarChart
        title="プラットフォーム別勝率"
        data={[
          { label: "将棋ウォーズ", winRate: 0.6 },
          { label: "将棋クエスト", winRate: 0.4 },
        ]}
      />
    );

    expect(screen.getByText("プラットフォーム別勝率")).toBeInTheDocument();
    expect(screen.getByText("将棋ウォーズ")).toBeInTheDocument();
    expect(screen.getByText("将棋クエスト")).toBeInTheDocument();
  });

  it("データが無い場合は案内文を表示する", () => {
    render(<WinRateBarChart title="戦法別勝率" data={[]} />);

    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });
});
