import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "@/lib/fetcher";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_API_BASE_URL", "http://localhost:8000");
    vi.stubEnv("DEV_AUTH_TOKEN", "test-token");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("BACKEND_API_BASE_URL が未設定の場合は config エラーを投げる", async () => {
    vi.stubEnv("BACKEND_API_BASE_URL", "");

    await expect(apiFetch("/games")).rejects.toMatchObject({
      kind: "config",
    } satisfies Partial<ApiError>);
  });

  it("DEV_AUTH_TOKEN が未設定の場合は config エラーを投げる", async () => {
    vi.stubEnv("DEV_AUTH_TOKEN", "");

    await expect(apiFetch("/games")).rejects.toMatchObject({
      kind: "config",
    } satisfies Partial<ApiError>);
  });

  it("fetch が失敗した場合は network エラーを投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connection refused"))
    );

    await expect(apiFetch("/games")).rejects.toMatchObject({
      kind: "network",
    } satisfies Partial<ApiError>);
  });

  it("レスポンスが非2xxの場合は http エラーを投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: "Not Found" }), {
          status: 404,
        })
      )
    );

    await expect(apiFetch("/games")).rejects.toMatchObject({
      kind: "http",
      status: 404,
      message: "Not Found",
    } satisfies Partial<ApiError>);
  });

  it("成功時はレスポンスのJSONを返す", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })))
    );

    await expect(apiFetch("/games")).resolves.toEqual({ ok: true });
  });
});
