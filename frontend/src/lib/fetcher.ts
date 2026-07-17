// サーバー専用モジュール。Client Component から import しないこと。
import { getAccessToken } from "@/lib/supabase/server";

export type ApiErrorKind = "config" | "network" | "http";

export type ApiFieldError = { loc: (string | number)[]; msg: string; type: string };

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly fieldErrors?: ApiFieldError[];

  constructor(
    kind: ApiErrorKind,
    message: string,
    status?: number,
    fieldErrors?: ApiFieldError[]
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
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

function isApiFieldError(value: unknown): value is ApiFieldError {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { loc?: unknown }).loc) &&
    typeof (value as { msg?: unknown }).msg === "string"
  );
}

async function extractErrorDetails(
  response: Response
): Promise<{ message: string; fieldErrors?: ApiFieldError[] }> {
  const fallbackMessage = `リクエストに失敗しました (status: ${response.status})`;

  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail: unknown }).detail;

      if (typeof detail === "string") {
        return { message: detail };
      }

      if (Array.isArray(detail) && detail.every(isApiFieldError)) {
        return { message: fallbackMessage, fieldErrors: detail };
      }
    }
  } catch {
    // レスポンスボディが JSON でない場合はフォールバックメッセージを使う
  }

  return { message: fallbackMessage };
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
    const { message, fieldErrors } = await extractErrorDetails(response);
    throw new ApiError("http", message, response.status, fieldErrors);
  }

  return (await response.json()) as T;
}
