import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OpeningDistributionPieChart } from "@/features/dashboard/OpeningDistributionPieChart";

describe("OpeningDistributionPieChart", () => {
  it("タイトルと凡例(戦型名)を表示する", () => {
    render(
      <OpeningDistributionPieChart
        title="自分の戦型"
        data={[
          { label: "四間飛車", value: 12 },
          { label: "三間飛車", value: 8 },
        ]}
      />
    );

    expect(screen.getByText("自分の戦型")).toBeInTheDocument();
    expect(screen.getByText("四間飛車")).toBeInTheDocument();
    expect(screen.getByText("三間飛車")).toBeInTheDocument();
  });

  it("7件を超える場合は上位5件とその他にまとめる", () => {
    render(
      <OpeningDistributionPieChart
        title="相手の戦型"
        data={[
          { label: "矢倉", value: 10 },
          { label: "角換わり", value: 9 },
          { label: "相掛かり", value: 8 },
          { label: "横歩取り", value: 7 },
          { label: "雁木", value: 6 },
          { label: "四間飛車", value: 5 },
          { label: "三間飛車", value: 4 },
        ]}
      />
    );

    expect(screen.getByText("矢倉")).toBeInTheDocument();
    expect(screen.getByText("雁木")).toBeInTheDocument();
    expect(screen.getByText("その他")).toBeInTheDocument();
    expect(screen.queryByText("四間飛車")).not.toBeInTheDocument();
    expect(screen.queryByText("三間飛車")).not.toBeInTheDocument();
  });

  it("データが無い場合は案内文を表示する", () => {
    render(<OpeningDistributionPieChart title="自分の戦型" data={[]} />);

    expect(screen.getByText("データがありません")).toBeInTheDocument();
  });
});
