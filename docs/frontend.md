# Frontend Design

> **ShogiLog Frontend設計書（Next.js）**
>
> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-07-05

---

# 1. はじめに

## 1.1 本ドキュメントについて

本ドキュメントではShogiLogのフロントエンド設計について定義します。

フロントエンドはNext.js（App Router）を採用し、UI構築・状態管理・API通信を担当します。

---

# 2. フロントエンドの役割

ShogiLogフロントエンドの役割は以下です。

- UIの表示
- ユーザー操作の受付
- API通信
- 認証状態管理
- 画面遷移管理
- データ表示・更新
- UX最適化

---

# 3. 技術スタック

|カテゴリ|技術|
|---|---|
|Framework|Next.js (App Router)|
|Language|TypeScript|
|UI|Tailwind CSS|
|Component|shadcn/ui|
|State|React Hooks / Server State|
|API|FastAPI|
|Auth|Supabase Auth|
|Data Fetching|fetch / React Query（任意）|
|Chart|recharts|

---

# 4. アーキテクチャ方針

## 4.1 基本方針

フロントエンドは以下の設計方針に従います。

- Feature-Based構成
- Server Components活用
- Client Component最小化
- API中心設計
- UIとロジックの分離

---

## 4.2 レイヤー構造

```text
App Router
  ↓
Features
  ↓
Services (API Layer)
  ↓
Backend API
```

---

# 5. ディレクトリ構成

## 5.1 全体構成

```text
frontend/

src/

├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── games/
│   ├── profile/
│   ├── tags/
│   ├── openings/
│   ├── dashboard/
│   └── auth/
│
├── features/
│   ├── games/
│   ├── profile/
│   ├── tags/
│   ├── ratings/
│   ├── openings/
│   └── dashboard/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── services/
│   ├── api/
│   │   ├── games.ts
│   │   ├── profile.ts
│   │   ├── tags.ts
│   │   ├── ratings.ts
│   │   ├── openings.ts
│   │   └── dashboard.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useGames.ts
│   ├── useProfile.ts
│
├── lib/
│   ├── supabase.ts
│   ├── fetcher.ts
│
├── types/
│   ├── game.ts
│   ├── profile.ts
│   ├── tag.ts
│
└── utils/
    ├── format.ts
    ├── date.ts
```

---

# 6. 設計原則

## 6.1 Feature First設計

機能ごとにコードを分割します。

例：

```text
features/games/
features/profile/
features/tags/
```

---

## 6.2 Server Component優先

Next.js App Routerの特性を活かし、

- データ取得はServer Component
- インタラクションはClient Component

と分離します。

---

## 6.3 Client Component最小化

Client Componentは以下の用途に限定します。

- フォーム操作
- 状態管理
- インタラクションUI

---

# 7. 状態管理方針

## 7.1 基本方針

状態は以下の3種類に分類します。

|種類|管理方法|
|---|---|
|Server State|API / React Query|
|Client State|useState / useReducer|
|Global State|必要最小限（Context）|

---

## 7.2 グローバル状態

グローバル状態は最小限に抑えます。

例：

- 認証ユーザー情報
- UIテーマ

---

# 8. 認証設計

## 8.1 Supabase Auth

フロントエンドではSupabase Authを利用します。

---

## 8.2 認証状態

```text
ログイン状態 → Supabase Session
```

---

## 8.3 保護ルート

認証が必要なページは `frontend/src/proxy.ts` で保護します。

> **Note**: このバージョンの Next.js では、従来の `middleware.ts` は `proxy.ts` に名称・規約が変更されています（`export default function proxy(request)`）。`app/` が `src/` 配下にあるため、`proxy.ts` も `frontend/src/proxy.ts` に配置します。

例：

- /games
- /dashboard
- /profile
- /tags
- /openings

Proxy はセッションが有効かどうかの楽観的チェック（cookieの読み取りのみ）に留め、実際のデータアクセス時には各処理内で再度セッションを検証します（`lib/fetcher.ts` の `getAccessToken()` 経由）。

---

# 9. API通信設計

## 9.1 通信方式

FastAPIへは以下で通信します。

- fetch API
- または React Query

---

## 9.2 APIレイヤー

```text
services/api/
```

に集約します。

例：

```typescript
export const fetchGames = async () => {
  const res = await fetch("/api/v1/games");
  return res.json();
};
```

---

## 9.3 認証方式

`lib/supabase/server.ts` の `createClient()` が `next/headers` の cookie を介して Supabase セッションを読み書きする。`lib/fetcher.ts` は同ファイルの `getAccessToken()` でログイン中ユーザーの `access_token` を取得し、Bearer トークンとしてバックエンドへのリクエストに付与する。セッションが存在しない場合は `ApiError("config", ...)` を送出する。

`BACKEND_API_BASE_URL` に加え、`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を `frontend/.env.local`（gitignore 済み）に設定する。

ログイン・ログアウトは `features/auth/actions.ts` の Server Action（`loginAction` / `logoutAction`）が `supabase.auth.signInWithPassword` / `supabase.auth.signOut` を呼び出す。アカウント登録は同ファイルの `signupAction` が `supabase.auth.signUp` を呼び出し、メール確認が有効な環境向けに `app/auth/callback/route.ts` で `exchangeCodeForSession` によるセッション確立を行う。

---

## 9.4 対局詳細ページのデータ取得・更新

`/games/[id]` は `services/api/games.ts` の `fetchGame()` / `fetchGameKifuUrl()` / `fetchGameTags()` と `services/api/tags.ts` の `fetchTags()` を `Promise.all` で並列取得する Server Component。棋譜ファイルは `kifu_path` を直接返さず、バックエンドが発行する署名付きURL（`GET /games/{id}/kifu-url`、有効期限300秒）をそのつどダウンロードリンクとして表示する。

メモの編集は `features/games/actions.ts` の Server Action（`updateMemoAction`）が `updateGameMemo()`（`PUT /games/{id}`）を呼び出し、成功時に `revalidatePath` で詳細ページを再検証する。ログイン系の Server Action と同様、`useActionState` を前提にした状態(`MemoFormState`)を返す。

タグの付け外しは `features/games/GameTagsSection.tsx`(Client Component)が担う。付与済みタグは `Badge` + 個別の解除ボタン(`unlinkGameTagAction` → `DELETE /games/{id}/tags/{tag_id}`)、未付与タグは `Select` + 追加ボタン(`linkGameTagAction` → `POST /games/{id}/tags`)で1件ずつ即時反映する。これは 9.5 の登録・編集フォーム内タグ選択とは独立した機能で、フォーム送信後にタグを個別に調整したい場合の手段として維持している。

---

## 9.5 対局登録・編集フォーム

`/games/new` と `/games/[id]/edit` はいずれも `features/games/GameForm.tsx`(Client Component)を描画する Server Component で、`mode`(`"create" | "edit"`)props で挙動を切り替える共通コンポーネント。`features/games/validation.ts` の `validateGameInput()` でフィールドバリデーションを行い、`features/games/actions.ts` の Server Action(`createGameAction` / `updateGameAction`)がそれぞれ `createGame()`(`POST /games`)/ `updateGame()`(`PUT /games/{id}`)を呼び出す。成功時は対局の詳細ページ(`/games/{id}`)へ `redirect` する。

対局サービス(platform)の選択肢は `features/games/platforms.ts` の静的マップをそのまま利用する(Platforms API 未実装のため)。

棋譜(KIF形式)はフォーム上部の `kifu_text` テキストエリアに直接入力、または「クリップボードから貼り付け」ボタン(`navigator.clipboard.readText()`)で貼り付けられる。貼り付けられたテキストは `features/games/kifParser.ts` の `parseKif()` でパースし、対局日時・対戦相手名・結果を自動入力する。送信時に `kifu_text` が空でなければ Server Action 内で `uploadKifu()` を先に呼び出して `kifu_path` を取得し、`createGame`/`updateGame` のペイロードに含める(アップロード失敗時は対局自体を作成/更新せずエラーを返す)。

タグは `allTags`(ユーザーの全タグ、`fetchTags()` で取得)を選択肢として `Badge` チップ形式で表示し、クリックで選択/解除をトグルする(新規タグのその場作成はできず、事前に `/tags` で作成しておく必要がある)。編集モードでは `gameTags`(`fetchGameTags()` で取得した現在の付与タグ)で初期選択状態を復元する。選択結果は `tag_ids`(選択中のタグID)、編集モードのみ `original_tag_ids`(読み込み時点の付与タグID)という繰り返しの hidden input としてフォームに含まれ、`createGameAction`/`updateGameAction` が対局本体の作成/更新に成功した後、`tag_ids` と `original_tag_ids` の差分をもとに `linkGameTag()`/`unlinkGameTag()` をベストエフォートで呼び出す(タグの紐付けに失敗しても対局の作成/更新自体は成功として扱いリダイレクトする。失敗時は 9.4 の `GameTagsSection` で後から手動調整できる)。

---

## 9.6 ダッシュボード(統計画面)

`/dashboard` は `services/api/dashboard.ts` の `fetchDashboard()`(`GET /dashboard`)と `services/api/openings.ts` の `fetchOpenings()` を `Promise.all` で並列取得する Server Component。総対局数・勝率・直近対局・プラットフォーム別/戦法別/先手後手別勝率・月別対局数を表示する。

グラフ描画には `recharts` を使用し、`features/dashboard/WinRateBarChart.tsx`(勝率系の棒グラフ、プラットフォーム別・戦法別・先手後手別で共通利用)と `features/dashboard/MonthlyGamesChart.tsx`(月別対局数)に切り出す。直近対局の一覧表示は `features/games/GamesTable.tsx` をそのまま再利用する。

---

## 9.7 プロフィール画面

`/profile` は `services/api/profile.ts` の `fetchProfile()`(`GET /profile`)と `fetchPlatformRatings()`(`GET /profile/platform-ratings`)を `Promise.all` で並列取得する Server Component。

`features/profile/ProfileForm.tsx` が表示名・自己紹介の編集フォーム(`updateProfileAction` → `PUT /profile`)を、`features/profile/PlatformRatingsSection.tsx` がプラットフォームごとの現在のレート/段級位編集行(`features/profile/PlatformRatingRow.tsx`)を描画する。各行は「未プレイ/プレイ済み」を `Select` で切り替え、プレイ済み選択時のみ `features/games/platforms.ts` の `getPlatformRatingMetric()`/`usesRankRating()` に応じてレート入力欄または段級位選択欄を出し分ける(`updatePlatformRatingAction` → `PUT /profile/platform-ratings/{platform_id}`)。未登録のプラットフォームはバックエンド側で `has_played: false` として補完されるため、フロントエンドは常に全プラットフォーム分の行を表示できる。

---

## 9.8 戦法画面

`/openings` は `services/api/openings.ts` の `fetchOpenings()`(`GET /openings`)と `fetchFavoriteOpeningIds()`(`GET /openings/favorites`)を `Promise.all` で並列取得する Server Component。`features/openings/OpeningList.tsx` が戦法をカテゴリ(居飛車/振り飛車/その他)別にグルーピングして表示し、各行に `features/openings/FavoriteButton.tsx`(お気に入り登録 `POST /openings/{id}/favorite` / 解除 `DELETE /openings/{id}/favorite` を切り替えるトグルボタン)を添える。

---

# 10. UI設計方針

## 10.1 コンポーネント設計

UIは以下に分割します。

|種類|役割|
|---|---|
|ui|汎用UI|
|layout|レイアウト|
|shared|共通コンポーネント|

---

## 10.2 Feature UI

各機能はfeatures配下にUIを持ちます。

例：

```text
features/games/GameList.tsx
features/games/GameCard.tsx
features/games/GameForm.tsx
features/games/GameDetailHeader.tsx
features/games/KifuSection.tsx
features/games/MemoSection.tsx
```

---

# 11. ルーティング設計

## 11.1 App Router

Next.js App Routerを使用します。

---

## 11.2 ルート構成

|Route|内容|
|---|---|
|/|ホーム|
|/games|対局一覧|
|/games/new|対局登録|
|/games/[id]|詳細|
|/profile|プロフィール|
|/tags|タグ管理|
|/openings|戦法|
|/dashboard|統計|
|/auth/login|ログイン|
|/auth/signup|アカウント登録|
|/auth/callback|メール確認後のセッション確立用コールバック（画面なし）|

---

# 12. パフォーマンス設計

## 12.1 最適化方針

- Server Components優先
- 必要時のみClient Component
- APIキャッシュ利用
- 画像は最適化

---

## 12.2 データ取得

- SSR優先
- ISRは必要時のみ
- クライアントフェッチは補助

---

# 13. エラーハンドリング

## 13.1 APIエラー

バックエンドのエラーレスポンスは `{"detail": string}` 形式(FastAPI標準)。`frontend/src/lib/fetcher.ts` の `apiFetch`/`ApiError` が唯一の変換窓口で、`kind: "config" | "network" | "http"` に分類する。

```json
{
  "detail": "Game not found."
}
```

422のバリデーションエラーのみ `detail` が配列になる(フィールドごとの `{loc, msg, type}`)。`apiFetch` はこれを `ApiError.fieldErrors` として保持する。`frontend/src/lib/apiFieldErrors.ts` の `getApiErrorFieldNames(error)` が `loc` の末尾要素からフィールド名の集合を取り出し、各featureの `actions.ts`(`games`/`tags`/`profile`)がそのフィールド名をfeature固有の `FieldErrors` 型にマッピングして `state.errors` に反映する。バックエンドの生の `msg` はUIに表示せず、常にfeature側で定義した日本語メッセージを使う。フィールドが特定できない場合は通常のフォールバックメッセージ(後述)にとどまる。

エラーメッセージの日本語化は `frontend/src/lib/errorMessages.ts` の `getApiErrorMessage(error, fallback)` に集約する。config/network/401/5xxは共通の文言、それ以外(400/404/409/422など)はfeatureごとのfallback文言を返す。ページ読み込み(Server Component)とServer Action(mutation)のどちらのエラー処理も同じ関数を使い、バックエンドの生の `detail` 文字列がそのままUIに表示されないようにする。

---

## 13.2 UI表示

エラーの見せ方は発生箇所によって役割を分ける。

- **ページ読み込み失敗(read)**: `@/components/ui/error-state` の `ErrorState` バナーを表示する。
- **Server Actionのmutation失敗**: `@/lib/toast` の `showErrorToast` でトースト通知を表示する。フォーム側は `@/lib/useActionErrorToast` の `useActionErrorToast(state.message ?? state.error)` フックを呼び出すことで、`state` が更新されるたびにトーストを発火する。アクセシビリティ用のインライン `<p aria-live="polite">` によるメッセージ表示はトーストと併用して残す。
- **未捕捉の描画時例外**: `frontend/src/app/error.tsx`(App Routerのルートレベル例外境界)がフォールバックUIを表示する。

トーストは shadcn の `sonner` ベースコンポーネント(`frontend/src/components/ui/sonner.tsx`)を使用し、`frontend/src/app/layout.tsx` に `<Toaster />` をマウントしている。

---

# 14. フォーム設計

## 14.1 基本方針

- controlled components使用
- バリデーションはクライアント + サーバー両方

---

## 14.2 バリデーション

各featureの `validation.ts`(`games`/`tags`/`profile`/`auth`)が Server Action 内で送信前に検証する(`createGameAction` 等)。検証に失敗した場合はAPI呼び出し自体を行わず、`FieldErrors` を返して該当フィールドに `@/components/ui/field-error` の `FieldError` を表示する。

- 必須チェック
- 文字数制限(タグ名255文字、表示名30文字、自己紹介500文字、メモ2000文字 など)
- 型チェック(整数・日付・Enum値・カラーコード `^#[0-9a-fA-F]{6}$`)
- プラットフォーム別のレーティング/段位チェック(`frontend/src/features/games/platforms.ts` の `getPlatformRatingMetric`/`getRankOptions` を用いる。将棋ウォーズ=0〜100の整数、棋桜/将棋クエスト/81道場=範囲チェック無し、段位はプラットフォームごとのラダー内のみ許可)。`games/validation.ts` の `isValidRatingValue`/`isValidRank` を `profile/validation.ts` の `validatePlatformRatingInput`(プロフィール画面のレーティング編集)からも再利用している。
- バックエンド(Pydantic)側でも同等のルールを検証しており(`docs/api.md` §11.1)、クライアント側の検証をすり抜けた場合は422/400のフィールドエラーとして返る(§13.1参照)。

---

# 15. 設計まとめ

ShogiLogフロントエンドは以下を重視する。

- Feature-Based構成
- Server Component優先
- API中心設計
- 最小限の状態管理
- Supabase Auth連携
- 高い保守性と拡張性