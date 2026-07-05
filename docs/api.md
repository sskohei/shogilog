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
  "message": "Game not found.",
  "code": "GAME_NOT_FOUND"
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
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|422|Validation Error|
|500|Internal Server Error|

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
    "icon_url": "https://...",
    "country": "Japan",
    "created_at": "2026-07-01T10:00:00Z",
    "updated_at": "2026-07-05T09:30:00Z"
  }
}
```

---

# 10. PUT /profile

## 概要

プロフィールを更新します。

---

## Request

```json
{
  "display_name": "ShogiLog",
  "bio": "四間飛車を研究しています。",
  "country": "Japan"
}
```

---

## Validation

|項目|条件|
|---|---|
|display_name|1〜30文字|
|bio|500文字以内|
|country|100文字以内|

---

## Response

```json
{
  "message": "Profile updated successfully."
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
|opening_id|uuid|No|戦法|
|from|datetime|No|開始日|
|to|datetime|No|終了日|

---

### Response

```json
{
  "data": [
    {
      "id": "uuid",
      "platform_id": 1,
      "opening_id": "uuid",
      "title": "vs 速攻四間飛車",
      "opponent_name": "player123",
      "is_sente": true,
      "result": "win",
      "ended_at": "2026-07-05T10:00:00Z",
      "time_control": "10min",
      "memo": "序盤優勢だった",
      "created_at": "2026-07-05T10:10:00Z"
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
  "opening_id": "uuid",
  "title": "vs 四間飛車",
  "opponent_name": "user123",
  "is_sente": true,
  "result": "win",
  "ended_at": "2026-07-05T10:00:00Z",
  "time_control": "10min",
  "memo": "終盤で逆転",
  "kif_text": "...",
  "ki2_text": "...",
  "csa_text": "...",
  "sfen": "..."
}
```

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

対局詳細を取得します。

---

### Response

```json
{
  "data": {
    "id": "uuid",
    "platform_id": 1,
    "opening_id": "uuid",
    "title": "vs 四間飛車",
    "opponent_name": "user123",
    "is_sente": true,
    "result": "win",
    "ended_at": "2026-07-05T10:00:00Z",
    "time_control": "10min",
    "memo": "終盤で逆転",
    "kif_text": "...",
    "ki2_text": "...",
    "csa_text": "...",
    "sfen": "...",
    "tags": [
      {
        "id": "uuid",
        "name": "研究"
      }
    ]
  }
}
```

---

## 12.4 PUT /games/{id}

### 概要

対局情報を更新します。

---

### Request

```json
{
  "title": "vs 四間飛車 改",
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

## 14.1 POST /games/{id}/tags

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

## 14.2 DELETE /games/{id}/tags/{tag_id}

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
    ]
  }
}
```

---

# 18. エラー設計

## 18.1 共通エラー形式

```json
{
  "message": "Something went wrong",
  "code": "ERROR_CODE"
}
```

---

## 18.2 代表的エラーコード

|Code|意味|
|---|---|
|GAME_NOT_FOUND|対局が存在しない|
|TAG_NOT_FOUND|タグが存在しない|
|OPENING_NOT_FOUND|戦法が存在しない|
|UNAUTHORIZED|認証エラー|
|FORBIDDEN|権限なし|
|VALIDATION_ERROR|入力エラー|
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