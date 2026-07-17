import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/openings/actions", () => ({
  addFavoriteOpeningAction: vi.fn(),
  removeFavoriteOpeningAction: vi.fn(),
}));

import { OpeningList } from "@/features/openings/OpeningList";
import type { Opening } from "@/types/opening";

const openings: Opening[] = [
  {
    id: 1,
    name: "矢倉",
    slug: "yagura",
    category: "static_rook",
    description: null,
    is_active: true,
    created_at: "2026-07-06T04:16:25.000Z",
  },
  {
    id: 6,
    name: "四間飛車",
    slug: "shikenbisha",
    category: "ranging_rook",
    description: "代表的な振り飛車",
    is_active: true,
    created_at: "2026-07-06T04:16:25.000Z",
  },
];

describe("OpeningList", () => {
  it("カテゴリ別に戦法を表示する", () => {
    render(<OpeningList openings={openings} favoriteOpeningIds={[]} />);

    expect(screen.getByText("居飛車")).toBeInTheDocument();
    expect(screen.getByText("振り飛車")).toBeInTheDocument();
    expect(screen.getByText("矢倉")).toBeInTheDocument();
    expect(screen.getByText("四間飛車")).toBeInTheDocument();
  });

  it("お気に入り済みの戦法には解除ボタンを表示する", () => {
    render(<OpeningList openings={openings} favoriteOpeningIds={[6]} />);

    const shikenbishaRow = screen.getByText("四間飛車").closest("div.flex");
    expect(shikenbishaRow).not.toBeNull();
    expect(
      screen.getAllByRole("button", { name: "お気に入り解除" })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "お気に入りに追加" })
    ).toHaveLength(1);
  });
});
