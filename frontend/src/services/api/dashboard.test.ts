import { describe, expect, it, vi } from "vitest";

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}));

vi.mock("@/lib/fetcher", () => ({
  apiFetch: apiFetchMock,
}));

import { fetchDashboard } from "@/services/api/dashboard";

describe("fetchDashboard", () => {
  it("data を返す", async () => {
    const dashboardData = {
      total_games: 10,
      win_rate: 0.5,
      recent_games: [],
      platform_stats: [],
      opening_stats: [],
      side_stats: [],
      monthly_stats: [],
    };
    apiFetchMock.mockResolvedValue({ data: dashboardData });

    const dashboard = await fetchDashboard();

    expect(apiFetchMock).toHaveBeenCalledWith("/dashboard");
    expect(dashboard).toEqual(dashboardData);
  });
});
