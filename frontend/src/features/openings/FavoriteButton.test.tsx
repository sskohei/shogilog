import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FavoriteButton } from "@/features/openings/FavoriteButton";
import {
  addFavoriteOpeningAction,
  removeFavoriteOpeningAction,
} from "@/features/openings/actions";

vi.mock("@/features/openings/actions", () => ({
  addFavoriteOpeningAction: vi.fn(),
  removeFavoriteOpeningAction: vi.fn(),
}));

const mockedAddFavoriteOpeningAction = vi.mocked(addFavoriteOpeningAction);
const mockedRemoveFavoriteOpeningAction = vi.mocked(removeFavoriteOpeningAction);

describe("FavoriteButton", () => {
  afterEach(() => {
    mockedAddFavoriteOpeningAction.mockReset();
    mockedRemoveFavoriteOpeningAction.mockReset();
  });

  it("未お気に入りの場合は追加ボタンを表示し、クリックすると addFavoriteOpeningAction を呼び出す", async () => {
    mockedAddFavoriteOpeningAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<FavoriteButton openingId={1} isFavorite={false} />);

    await user.click(screen.getByRole("button", { name: "お気に入りに追加" }));

    expect(mockedAddFavoriteOpeningAction).toHaveBeenCalledTimes(1);
    expect(mockedAddFavoriteOpeningAction.mock.calls[0][0]).toBe(1);
  });

  it("お気に入り済みの場合は解除ボタンを表示し、クリックすると removeFavoriteOpeningAction を呼び出す", async () => {
    mockedRemoveFavoriteOpeningAction.mockResolvedValue({});
    const user = userEvent.setup();
    render(<FavoriteButton openingId={1} isFavorite={true} />);

    await user.click(screen.getByRole("button", { name: "お気に入り解除" }));

    expect(mockedRemoveFavoriteOpeningAction).toHaveBeenCalledTimes(1);
    expect(mockedRemoveFavoriteOpeningAction.mock.calls[0][0]).toBe(1);
  });
});
