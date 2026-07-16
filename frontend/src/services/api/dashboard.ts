import { apiFetch } from "@/lib/fetcher";
import type { DashboardData, DashboardResponse } from "@/types/dashboard";

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await apiFetch<DashboardResponse>("/dashboard");
  return response.data;
}
