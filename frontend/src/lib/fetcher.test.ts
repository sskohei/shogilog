import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getAccessTokenMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: getAccessTokenMock,
}));

import { ApiError, apiFetch } from "@/lib/fetcher";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubEnv("BACKEND_API_BASE_URL", "http://localhost:8000");
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockResolvedValue("test-token");
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

  it("ログインセッションが無い場合は config エラーを投げる", async () => {
    getAccessTokenMock.mockResolvedValue(null);

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

  it("422でdetailが配列の場合はfieldErrorsを保持しつつ汎用メッセージを投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: [
              { loc: ["body", "rating_after"], msg: "Rating value is out of range.", type: "value_error" },
            ],
          }),
          { status: 422 }
        )
      )
    );

    await expect(apiFetch("/games")).rejects.toMatchObject({
      kind: "http",
      status: 422,
      message: "リクエストに失敗しました (status: 422)",
      fieldErrors: [
        { loc: ["body", "rating_after"], msg: "Rating value is out of range.", type: "value_error" },
      ],
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
