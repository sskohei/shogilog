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

ログイン・ログアウトは `features/auth/actions.ts` の Server Action（`loginAction` / `logoutAction`）が `supabase.auth.signInWithPassword` / `supabase.auth.signOut` を呼び出す。

---

## 9.4 対局詳細ページのデータ取得・更新

`/games/[id]` は `services/api/games.ts` の `fetchGame()` / `fetchGameKifuUrl()` を `Promise.all` で並列取得する Server Component。棋譜ファイルは `kifu_path` を直接返さず、バックエンドが発行する署名付きURL（`GET /games/{id}/kifu-url`、有効期限300秒）をそのつどダウンロードリンクとして表示する。

メモの編集は `features/games/actions.ts` の Server Action（`updateMemoAction`）が `updateGameMemo()`（`PUT /games/{id}`）を呼び出し、成功時に `revalidatePath` で詳細ページを再検証する。ログイン系の Server Action と同様、`useActionState` を前提にした状態(`MemoFormState`)を返す。

---

## 9.5 対局登録フォーム

`/games/new` は `features/games/GameForm.tsx`(Client Component)を描画する Server Component。`features/games/validation.ts` の `validateGameInput()` でフィールドバリデーションを行い、`features/games/actions.ts` の Server Action(`createGameAction`)が `createGame()`(`POST /games`)を呼び出す。成功時はレスポンスの `id` を使って作成した対局の詳細ページ(`/games/{id}`)へ `redirect` する。

対局サービス(platform)の選択肢は `features/games/platforms.ts` の静的マップをそのまま利用する(Platforms API 未実装のため)。棋譜ファイルのアップロードは対応しておらず、`kifu_path` は未設定のまま登録する(署名付きアップロードURLの発行は将来対応)。

---

## 9.6 ダッシュボード(統計画面)

`/dashboard` は `services/api/dashboard.ts` の `fetchDashboard()`(`GET /dashboard`)と `services/api/openings.ts` の `fetchOpenings()` を `Promise.all` で並列取得する Server Component。総対局数・勝率・直近対局・プラットフォーム別/戦法別/先手後手別勝率・月別対局数を表示する。

グラフ描画には `recharts` を使用し、`features/dashboard/WinRateBarChart.tsx`(勝率系の棒グラフ、プラットフォーム別・戦法別・先手後手別で共通利用)と `features/dashboard/MonthlyGamesChart.tsx`(月別対局数)に切り出す。直近対局の一覧表示は `features/games/GamesTable.tsx` をそのまま再利用する。

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
|/dashboard|統計|
|/auth/login|ログイン|

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

```json
{
  "message": "Error",
  "code": "ERROR_CODE"
}
```

---

## 13.2 UI表示

- トースト表示
- エラーバナー
- フォールバックUI

---

# 14. フォーム設計

## 14.1 基本方針

- controlled components使用
- バリデーションはクライアント + サーバー両方

---

## 14.2 バリデーション

- 必須チェック
- 文字数制限
- 型チェック

---

# 15. 設計まとめ

ShogiLogフロントエンドは以下を重視する。

- Feature-Based構成
- Server Component優先
- API中心設計
- 最小限の状態管理
- Supabase Auth連携
- 高い保守性と拡張性