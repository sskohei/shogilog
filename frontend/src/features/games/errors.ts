import { ApiError } from "@/lib/fetcher";

export function getGamesErrorMessage(error: ApiError): string {
  if (error.kind === "config") {
    return error.message;
  }
  if (error.kind === "network") {
    return "バックエンドに接続できませんでした。バックエンドが起動しているか確認してください。";
  }
  if (error.status === 401) {
    return "認証セッションが無効です。再度ログインしてください。";
  }
  if (error.status !== undefined && error.status >= 500) {
    return "バックエンドでエラーが発生しました。バックエンドが起動しているか確認してください。";
  }
  return "対局情報の取得に失敗しました。";
}
