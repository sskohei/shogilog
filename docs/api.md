# API Design

> **ShogiLog API設計書**
>
> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-07-05

---

# 1. はじめに

## 1.1 本ドキュメントについて

本ドキュメントではShogiLogが提供するREST APIの仕様を定義します。

APIはFastAPIによって実装し、フロントエンドとの通信インターフェースとして利用します。

本仕様書を基準として、フロントエンド・バックエンドを並行して開発できることを目的とします。

---

# 2. 基本情報

|項目|内容|
|---|---|
|Protocol|HTTPS|
|API Style|REST|
|Data Format|JSON|
|Character Encoding|UTF-8|
|Authentication|Supabase Auth JWT|
|Base URL|`/api/v1`|

---

# 3. API設計方針

## RESTful API

リソース指向で設計します。

例

|HTTP Method|用途|
|---|---|
|GET|取得|
|POST|作成|
|PUT|更新|
|PATCH|部分更新|
|DELETE|削除|

---

## URL設計

URLには動詞を使用しません。

### Good

```text
GET /games

POST /games

GET /games/{id}
```

### Bad

```text
/getGames

/createGame

/deleteGame
```

---

## JSON形式

リクエスト・レスポンスはJSONを利用します。

---

# 4. API一覧

## Profile

|Method|Path|説明|
|---|---|---|
|GET|/profile|プロフィール取得|
|PUT|/profile|プロフィール更新|
|GET|/profile/platform-ratings|プラットフォーム別レート一覧取得|
|PUT|/profile/platform-ratings/{platform_id}|プラットフォーム別レート更新|

---

## Games

|Method|Path|説明|
|---|---|---|
|GET|/games|一覧取得|
|POST|/games|新規登録|
|GET|/games/{id}|詳細取得|
|PUT|/games/{id}|更新|
|DELETE|/games/{id}|削除|

---

## Tags

|Method|Path|説明|
|---|---|---|
|GET|/tags|一覧取得|
|POST|/tags|作成|
|PUT|/tags/{id}|更新|
|DELETE|/tags/{id}|削除|

---

## Ratings

|Method|Path|説明|
|---|---|---|
|GET|/ratings|一覧取得|
|POST|/ratings|登録|

---

## Openings

|Method|Path|説明|
|---|---|---|
|GET|/openings|一覧取得|
|GET|/openings/{id}|詳細取得|
|GET|/openings/favorites|お気に入り戦法ID一覧取得|
|POST|/openings/{id}/favorite|お気に入り登録|
|DELETE|/openings/{id}/favorite|お気に入り解除|

---

## Dashboard

|Method|Path|説明|
|---|---|---|
|GET|/dashboard|ダッシュボード情報取得|

---

# 5. Authentication

認証にはSupabase Authが発行するJWTを利用します。

Authorizationヘッダーへ設定して送信します。

```
Authorization: Bearer <JWT>
```

JWTが無効または存在しない場合は401 Unauthorizedを返します。

---

# 6. 共通レスポンス

## 成功

```json
{
  "data": {}
}
```

一覧取得

```json
{
  "data": []
}
```

---

## エラー

```json
{
  "detail": "Game not found."
}
```

---

# 7. HTTPステータス

|Status|説明|
|---|---|
|200|Success|
|201|Created|
|204|No Content|
|400|Bad Request|
|401|Unauthorized|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|500|Internal Server Error|

403 Forbidden(ロールベースの権限エラー)は現状のAPIには実装されていない(全リソースがuser_idスコープの所有者チェックのみ)。

---

# 8. ページネーション

一覧APIではページネーションを採用します。

## Query Parameters

|名前|型|必須|説明|
|---|---|---|---|
|page|integer|No|ページ番号|
|limit|integer|No|取得件数|

デフォルト値

```text
page = 1
limit = 20
```

---

## レスポンス例

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 132,
    "total_pages": 7
  }
}
```

---

# 9. GET /profile

## 概要

ログインユーザーのプロフィールを取得します。

---

## Request

```
GET /api/v1/profile
```

---

## Response

```json
{
  "data": {
    "id": "uuid",
    "display_name": "Shogi Player",
    "bio": "よろしくお願いします。",
    "avatar_url": null,
    "created_at": "2026-07-01T10:00:00Z",
    "updated_at": "2026-07-05T09:30:00Z"
  }
}
```

---

# 10. PUT /profile

## 概要

プロフィールを更新します。`display_name`/`bio` は送信したフィールドのみ更新されます(部分更新)。

---

## Request

```json
{
  "display_name": "ShogiLog",
  "bio": "四間飛車を研究しています。"
}
```

---

## Validation

|項目|条件|
|---|---|
|display_name|1〜30文字|
|bio|500文字以内|

---

## Response

```json
{
  "data": {
    "id": "uuid",
    "display_name": "ShogiLog",
    "bio": "四間飛車を研究しています。",
    "avatar_url": null,
    "created_at": "2026-07-01T10:00:00Z",
    "updated_at": "2026-07-05T09:30:00Z"
  }
}
```

---

## 10.1 GET /profile/platform-ratings

### 概要

プラットフォームごとの現在のレート/段級位を取得します。まだ登録されていないプラットフォームは `has_played: false` として補完されます(`ratings` の対局ごとの履歴とは独立したデータです)。

---

### Response

```json
{
  "data": [
    {
      "platform_id": 1,
      "has_played": true,
      "rating": null,
      "rank": "三段",
      "updated_at": "2026-07-10T09:00:00Z"
    },
    {
      "platform_id": 2,
      "has_played": false,
      "rating": null,
      "rank": null,
      "updated_at": null
    }
  ]
}
```

---

## 10.2 PUT /profile/platform-ratings/{platform_id}

### 概要

指定したプラットフォームの現在のレート/段級位を登録・更新します(upsert)。`has_played` が `false` の場合、`rating`/`rank` は無視され `null` として保存されます。

---

### Request

```json
{
  "has_played": true,
  "rating": null,
  "rank": "三段"
}
```

---

### Response

```json
{
  "message": "Platform rating updated successfully."
}
```

---

# 11. 共通バリデーション

入力値はFastAPI(Pydantic)で検証します。

基本ルール

- 空文字禁止（必要項目）
- 最大文字数チェック
- UUID形式チェック
- 日付形式チェック
- Enum値チェック

バリデーションエラー時は422 Validation Errorを返します。

## 11.1 プラットフォーム別のレーティング/段位ルール

`games`・`ratings`・`profile/platform-ratings` のレーティング(`rating_before`/`rating_after`/`opponent_rating`/`rating`)と段位(`rank_before`/`rank_after`/`opponent_rank`/`rank`)は、`platform_id` の意味に応じて `backend/app/core/platforms.py` で検証します(フロントエンドの `frontend/src/features/games/platforms.ts` と同じ内容をミラーしたもの)。

|platform_id|サービス|意味|レーティングの範囲|段位|
|---|---|---|---|---|
|1|将棋ウォーズ|昇段/降段の進捗(%)|0〜100の整数|30級〜9段のラダー内のみ|
|2|将棋クエスト|レーティング|0以上の整数(上限なし)|指定不可|
|3|棋桜|ポイント|0以上の整数(上限なし)|10級〜5段のラダー内のみ|
|4|81道場|レーティング|0以上の整数(上限なし)|指定不可|

範囲外の値は400または422で拒否されます。`platform_id`/`my_opening_id`/`opponent_opening_id`/`game_id` が実在しない場合は404を返します。`kifu_path` は認証済みユーザー自身のパス(`{user_id}/...`)以外を指定すると400を返します。

---

---

# 12. Games API

## 12.1 GET /games

### 概要

ユーザーの対局一覧を取得します。

---

### Request

```
GET /api/v1/games
```

### Query Parameters

|名前|型|必須|説明|
|---|---|---|---|
|page|integer|No|ページ番号|
|limit|integer|No|取得件数|
|platform_id|integer|No|将棋サービス|
|result|string|No|win / lose / draw|
|side|string|No|sente / gote|
|opening_id|integer|No|戦法(自分・相手いずれかの戦法に一致)|
|from|datetime|No|開始日(played_at基準)|
|to|datetime|No|終了日(played_at基準)|
|search|string|No|opponent_name / memo の部分一致検索|
|sort|string|No|played_at(既定) / created_at / result|
|order|string|No|asc / desc(既定)|

---

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "platform_id": 1,
      "played_at": "2026-07-05T10:00:00Z",
      "result": "win",
      "side": "sente",
      "my_opening_id": 1,
      "opponent_opening_id": 2,
      "rating_before": 1200,
      "rating_after": 1210,
      "opponent_name": "player123",
      "opponent_rating": 1190,
      "rank_before": null,
      "rank_after": null,
      "opponent_rank": null,
      "memo": "序盤優勢だった",
      "kifu_path": "user-id/game-id.kif",
      "created_at": "2026-07-05T10:10:00Z",
      "updated_at": "2026-07-05T10:10:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "total_pages": 3
  }
}
```

---

## 12.2 POST /games

### 概要

新しい対局を登録します。

---

### Request

```json
{
  "platform_id": 1,
  "played_at": "2026-07-05T10:00:00Z",
  "result": "win",
  "side": "sente",
  "my_opening_id": 1,
  "opponent_opening_id": 2,
  "rating_before": 1200,
  "rating_after": 1210,
  "opponent_name": "user123",
  "opponent_rating": 1190,
  "rank_before": null,
  "rank_after": null,
  "opponent_rank": null,
  "memo": "終盤で逆転",
  "kifu_path": "user-id/game-id.kif"
}
```

`rating_before`/`rating_after`/`opponent_rating` と `rank_before`/`rank_after`/`opponent_rank` の意味は `platform_id` によって変わる(例: 将棋ウォーズは段位+%、棋桜は段位+ポイント、将棋クエスト/81道場は数値レーティングのみで rank系は未使用)。詳細は `docs/database.md` 「レーティング関連カラムの解釈」を参照。

---

### Response

```json
{
  "data": {
    "id": "uuid"
  }
}
```

---

## 12.3 GET /games/{id}

### 概要

対局詳細を取得します。レスポンス形式は 12.1 の一覧要素と同一です(タグは含まれません。対局に紐づくタグは 14. Game Tags API(14.1 GET /games/{id}/tags)で取得します)。

---

### Response

```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "platform_id": 1,
    "played_at": "2026-07-05T10:00:00Z",
    "result": "win",
    "side": "sente",
    "my_opening_id": 1,
    "opponent_opening_id": 2,
    "rating_before": 1200,
    "rating_after": 1210,
    "opponent_name": "user123",
    "opponent_rating": 1190,
    "rank_before": null,
    "rank_after": null,
    "opponent_rank": null,
    "memo": "終盤で逆転",
    "kifu_path": "user-id/game-id.kif",
    "created_at": "2026-07-05T10:10:00Z",
    "updated_at": "2026-07-05T10:10:00Z"
  }
}
```

---

## 12.4 PUT /games/{id}

### 概要

対局情報を更新します。更新したいフィールドのみ送信します(部分更新)。

---

### Request

```json
{
  "memo": "修正メモ",
  "result": "lose"
}
```

---

### Response

```json
{
  "message": "Game updated successfully."
}
```

---

## 12.5 DELETE /games/{id}

### 概要

対局を削除します。

---

### Response

```json
{
  "message": "Game deleted successfully."
}
```

---

## 12.6 GET /games/{id}/kifu-url

### 概要

対局に紐づく棋譜ファイル(Supabase Storage の `kifu` バケットに保存)への署名付きURLを発行します。`kifu_path` が未設定の場合は `url` に `null` を返します。有効期限は300秒です。

---

### Response

```json
{
  "data": {
    "url": "https://.../storage/v1/object/sign/kifu/user-id/game-id.kif?token=..."
  }
}
```

---

# 13. Tags API

## 13.1 GET /tags

### 概要

ユーザーのタグ一覧を取得します。

---

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "研究",
      "color": "#ff0000"
    }
  ]
}
```

---

## 13.2 POST /tags

### 概要

タグを作成します。

---

### Request

```json
{
  "name": "終盤",
  "color": "#00ff00"
}
```

---

## 13.3 PUT /tags/{id}

### 概要

タグを更新します。

---

## 13.4 DELETE /tags/{id}

### 概要

タグを削除します。

---

# 14. Game Tags API

## 14.1 GET /games/{id}/tags

### 概要

対局に紐づくタグ一覧を取得します。レスポンス形式は 13.1 と同一です。

---

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "研究",
      "color": "#ff0000"
    }
  ]
}
```

---

## 14.2 POST /games/{id}/tags

### 概要

対局にタグを追加します。

---

### Request

```json
{
  "tag_id": "uuid"
}
```

---

## 14.3 DELETE /games/{id}/tags/{tag_id}

### 概要

対局からタグを削除します。

---

# 15. Ratings API

## 15.1 GET /ratings

### 概要

レーティング履歴を取得します。

---

### Response

```json
{
  "data": [
    {
      "platform_id": 1,
      "rating": 1200,
      "recorded_at": "2026-07-05T10:00:00Z"
    }
  ]
}
```

---

## 15.2 POST /ratings

### 概要

レーティングを登録します。

---

### Request

```json
{
  "platform_id": 1,
  "rating": 1250,
  "game_id": "uuid"
}
```

---

# 16. Openings API

## 16.1 GET /openings

### 概要

戦法一覧を取得します。

---

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "四間飛車",
      "description": "振り飛車の代表戦法"
    }
  ]
}
```

---

## 16.2 GET /openings/{id}

### 概要

戦法詳細を取得します。

---

## 16.3 GET /openings/favorites

### 概要

ログインユーザーのお気に入り戦法IDの一覧を取得します。

---

### Response

```json
{
  "data": [6, 7]
}
```

---

## 16.4 POST /openings/{id}/favorite

### 概要

戦法をお気に入りに登録します。

---

### Response

```json
{
  "message": "Opening added to favorites."
}
```

---

## 16.5 DELETE /openings/{id}/favorite

### 概要

戦法のお気に入りを解除します。

---

### Response

```json
{
  "message": "Opening removed from favorites."
}
```

---

# 17. Dashboard API

## 17.1 GET /dashboard

### 概要

ダッシュボード用統計データを取得します。

---

### Response

```json
{
  "data": {
    "total_games": 120,
    "win_rate": 0.56,
    "recent_games": [],
    "platform_stats": [
      {
        "platform_id": 1,
        "win_rate": 0.58
      }
    ],
    "opening_stats": [
      {
        "opening_name": "四間飛車",
        "win_rate": 0.6
      }
    ],
    "side_stats": [
      {
        "side": "sente",
        "win_rate": 0.6
      },
      {
        "side": "gote",
        "win_rate": 0.5
      }
    ],
    "monthly_stats": [
      {
        "month": "2026-06",
        "game_count": 12
      },
      {
        "month": "2026-07",
        "game_count": 18
      }
    ]
  }
}
```

---

# 18. エラー設計

## 18.1 共通エラー形式

Service層で送出する `HTTPException` は、FastAPI標準の形式でそのまま返る。`detail` は常に文字列。

```json
{
  "detail": "Something went wrong"
}
```

未処理の例外(Supabase/Postgrest起因のエラーなど)は `backend/app/main.py` のグローバル例外ハンドラーが捕捉し、スタックトレースをログに出力したうえで、同じ形式の500として返す。

```json
{
  "detail": "Internal server error"
}
```

422のバリデーションエラー(Pydantic起因)のみ形状が異なり、`detail` はフィールドごとのエラー情報を持つ配列になる。

```json
{
  "detail": [
    { "loc": ["body", "rating_after"], "msg": "...", "type": "..." }
  ]
}
```

この配列は `frontend/src/lib/fetcher.ts` の `ApiError.fieldErrors` としてパースされ、`frontend/src/lib/apiFieldErrors.ts` の `getApiErrorFieldNames` で対象フィールドを特定したうえで、各featureの `actions.ts` がフォームの該当フィールドにエラーメッセージを反映する。フィールドが特定できない場合は汎用フォールバックメッセージを表示する。

---

## 18.2 代表的なエラーレスポンス例

|状況|ステータス|`detail`の例|
|---|---|---|
|対局が存在しない|404|`"Game not found."`|
|タグが存在しない|404|`"Tag not found."`|
|戦法が存在しない|404|`"Opening not found."`|
|プロフィール/プラットフォームが存在しない|404|`"Profile not found."` / `"Platform not found."`|
|認証情報が無い/不正|401|`"Authentication credentials were not provided."` など|
|タグ名の重複|409|`"Tag name already exists."`|
|更新内容が空|400|`"No fields were provided for update."`|
|想定外の例外|500|`"Internal server error"`|

固定のエラーコード(例: `GAME_NOT_FOUND`)による分類は行っていない。エラーの種別はステータスコードと`detail`文字列で判別する。
# 19. Search / Filter / Sort Design

## 19.1 基本方針

ShogiLogの一覧系API（games, tagsなど）では統一された検索・フィルタ・ソート仕様を採用します。

---

## 19.2 検索（Search）

部分一致検索をサポートします。

### 対象フィールド（games）

- title
- opponent_name
- memo

---

### 例

```
GET /games?search=四間飛車
```

---

## 19.3 フィルタ（Filter）

複数条件をANDで結合します。

### 例

```
GET /games?platform_id=1&result=win
```

```
GET /games?opening_id=uuid&is_sente=true
```

---

## 19.4 日付フィルタ

```
GET /games?from=2026-01-01&to=2026-12-31
```

---

## 19.5 ソート（Sort）

デフォルトは `created_at DESC`

---

### 例

```
GET /games?sort=ended_at&order=asc
```

|param|value|
|---|---|
|sort|created_at / ended_at / result|
|order|asc / desc|

---

# 20. Authentication Flow

## 20.1 基本方針

認証はSupabase Authを利用し、JWTをFastAPIへ送信します。

---

## 20.2 リクエストヘッダ

```
Authorization: Bearer <JWT>
```

---

## 20.3 FastAPI側処理

1. JWTを受信
2. Supabaseで検証
3. user_idを取得
4. RLSと併用してアクセス制御

---

## 20.4 user_id取得

すべてのAPIは内部的に以下を利用します。

```python
user_id = request.state.user.id
```

---

# 21. API共通ルール

## 21.1 IDはUUID

すべてのリソースIDはUUIDを使用します。

---

## 21.2 nullルール

- 必須でない値のみnull許可
- 空文字は使用しない

---

## 21.3 日付フォーマット

ISO 8601を使用

```
2026-07-05T10:00:00Z
```

---

## 21.4 レスポンスルール

### 単体

```json
{
  "data": {}
}
```

### 複数

```json
{
  "data": []
}
```

---

## 21.5 作成レスポンス

```json
{
  "data": {
    "id": "uuid"
  }
}
```

---

# 22. API Versioning

## 22.1 方針

すべてのAPIはバージョニングを行います。

```
/api/v1/
```

---

## 22.2 将来

破壊的変更が発生した場合

```
/api/v2/
```

を作成します。

---

# 23. Rate Limiting

## 23.1 方針

Version1では簡易的な制限のみ行います。

- 1ユーザーあたり過剰リクエスト制限
- Supabase側の制限を活用

---

# 24. Security

## 24.1 原則

- JWT必須
- RLS必須
- user_id強制付与
- クライアントからのuser_id指定は禁止

---

## 24.2 危険な実装の禁止

### NG例

```json
{
  "user_id": "別ユーザーID"
}
```

### 正しい例

```json
{
  "title": "game"
}
```

user_idはサーバー側で付与する

---

# 25. API Summary

## 25.1 完全一覧

### Profile
- GET /profile
- PUT /profile

---

### Games
- GET /games
- POST /games
- GET /games/{id}
- PUT /games/{id}
- DELETE /games/{id}

---

### Tags
- GET /tags
- POST /tags
- PUT /tags/{id}
- DELETE /tags/{id}

---

### Game Tags
- POST /games/{id}/tags
- DELETE /games/{id}/tags/{tag_id}

---

### Ratings
- GET /ratings
- POST /ratings

---

### Openings
- GET /openings
- GET /openings/{id}

---

### Dashboard
- GET /dashboard

---

# 26. API Design Summary

ShogiLog APIは以下の設計思想に基づきます。

- REST準拠
- Supabase Authによる認証
- UUIDベースの識別子
- 明確なリソース設計
- 一貫したレスポンス形式
- RLSによるデータ保護
- 検索・フィルタ・ソートの統一仕様

本API仕様を基準としてFastAPI実装を行う。