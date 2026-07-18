import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KifuSection } from "@/features/games/KifuSection";

describe("KifuSection", () => {
  it("棋譜が未登録の場合は案内文を表示する", () => {
    render(<KifuSection kifuUrl={null} />);

    expect(
      screen.getByText("棋譜ファイルは登録されていません")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "棋譜ファイルをダウンロード" })
    ).not.toBeInTheDocument();
  });

  it("署名付きURLがある場合はページ遷移しないダウンロードリンクを表示する", () => {
    render(<KifuSection kifuUrl="https://example.supabase.co/storage/v1/object/sign/kifu/test.kif?download=kifu_2026-07-05.kif" />);

    const link = screen.getByRole("button", { name: "棋譜ファイルをダウンロード" });
    expect(link).toHaveAttribute(
      "href",
      "https://example.supabase.co/storage/v1/object/sign/kifu/test.kif?download=kifu_2026-07-05.kif"
    );
    expect(link).not.toHaveAttribute("target");
  });
});
