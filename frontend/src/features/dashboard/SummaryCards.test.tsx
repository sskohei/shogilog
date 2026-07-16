import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SummaryCards } from "@/features/dashboard/SummaryCards";

describe("SummaryCards", () => {
  it("総対局数と勝率を表示する", () => {
    render(<SummaryCards totalGames={42} winRate={0.6} />);

    expect(screen.getByText("42局")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });
});
