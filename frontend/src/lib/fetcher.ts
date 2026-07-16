// サーバー専用モジュール。Client Component から import しないこと。
import { getAccessToken } from "@/lib/supabase/server";

export type ApiErrorKind = "config" | "network" | "http";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function getBackendConfig(): Promise<{ baseUrl: string; token: string }> {
  const baseUrl = process.env.BACKEND_API_BASE_URL;

  if (!baseUrl) {
    throw new ApiError(
      "config",
      "BACKEND_API_BASE_URL が設定されていません。frontend/.env.local を確認してください。"
    );
  }

  const token = await getAccessToken();
  if (!token) {
    throw new ApiError(
      "config",
      "ログインセッションが見つかりません。再度ログインしてください。"
    );
  }

  return { baseUrl, token };
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "detail" in body &&
      typeof (body as { detail: unknown }).detail === "string"
    ) {
      return (body as { detail: string }).detail;
    }
  } catch {
    // レスポンスボディが JSON でない場合はフォールバックメッセージを使う
  }
  return `リクエストに失敗しました (status: ${response.status})`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl, token } = await getBackendConfig();

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ApiError("network", "バックエンドに接続できませんでした。");
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError("http", message, response.status);
  }

  return (await response.json()) as T;
}
