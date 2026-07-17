# Backend Design

> **ShogiLog Backend設計書（FastAPI）**
>
> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-07-05

---

# 1. はじめに

## 1.1 本ドキュメントについて

本ドキュメントでは、ShogiLogのバックエンド設計について定義します。

バックエンドはFastAPIを利用し、REST APIの提供・ビジネスロジックの実行・Supabaseとの連携を担当します。

---

# 2. バックエンドの役割

ShogiLogバックエンドの主な役割は以下です。

- API提供
- ビジネスロジック実行
- Supabaseとの通信
- 認証トークン検証
- データ整合性の保証
- RLSと連携したアクセス制御補助

---

# 3. アーキテクチャ方針

## 3.1 レイヤード構成

バックエンドは以下のレイヤー構造を採用します。

```text
Router → Service → Repository → Supabase
```

---

## 3.2 各レイヤーの責務

### Router（API層）

- HTTPリクエスト受信
- バリデーション呼び出し
- Service呼び出し
- レスポンス返却

---

### Service（ビジネスロジック層）

- ドメインロジック実行
- 複数Repositoryの統合
- データ加工
- 統計処理

---

### Repository（データアクセス層）

- Supabaseとの通信
- SELECT / INSERT / UPDATE / DELETE
- クエリ実行

---

# 4. ディレクトリ構成

## 4.1 全体構成

```text
backend/

app/

├── api/
│   ├── v1/
│   │   ├── games.py
│   │   ├── tags.py
│   │   ├── profile.py
│   │   ├── ratings.py
│   │   ├── openings.py
│   │   └── dashboard.py
│
├── core/
│   ├── config.py
│   ├── security.py
│   ├── logging.py
│
├── clients/
│   └── supabase.py
│
├── repositories/
│   ├── games.py
│   ├── tags.py
│   ├── ratings.py
│   ├── profile.py
│   └── openings.py
│
├── services/
│   ├── games.py
│   ├── tags.py
│   ├── ratings.py
│   ├── profile.py
│   └── dashboard.py
│
├── schemas/
│   ├── game.py
│   ├── tag.py
│   ├── profile.py
│   ├── rating.py
│   └── opening.py
│
└── main.py
```

---

# 5. FastAPIアプリ構成

## 5.1 エントリーポイント

```python
app = FastAPI(title="ShogiLog API")
```

---

## 5.2 ルーティング構成

```text
/api/v1/games
/api/v1/tags
/api/v1/profile
/api/v1/ratings
/api/v1/openings
/api/v1/dashboard
```

---

## 5.3 API登録

```python
app.include_router(game_router, prefix="/api/v1/games")
```

---

# 6. Supabaseクライアント

## 6.1 初期化

```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
```

---

## 6.2 利用方法

Repository層で使用します。

```python
supabase.table("games").select("*").execute()
```

---

# 7. 設計ルール

## 7.1 禁止事項

以下は禁止とします。

- RouterでSQL実行
- ServiceでHTTP処理
- Repositoryでビジネスロジック
- フロントエンドからDB直接アクセス
- user_idのクライアント指定

---

## 7.2 必須ルール

- user_idは必ずサーバーで付与
- Supabase RLSを必ず利用
- 全APIはJWT必須
- エラーは `fastapi.HTTPException` を使い、`{"detail": "<message>"}` 形式で返す(詳細は9章)

---

# 8. 依存関係ルール

```text
Router
  ↓
Service
  ↓
Repository
  ↓
Supabase Client
```

上方向への依存は禁止。

---

# 9. エラーハンドリング

## 9.1 Service層でのエラー送出

独自の例外クラスは持たず、Service層で `fastapi.HTTPException` を直接送出する。Router層でDBアクセスやビジネスロジックの例外処理を行わない(Service層に集約する)。

```python
from fastapi import HTTPException, status

if game is None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Game not found.",
    )
```

`detail` は常に文字列(英語)。ステータスコードは状況に応じて使い分ける。

| 状況 | ステータスコード |
|---|---|
| リソースが存在しない | 404 |
| 更新内容が空など不正なリクエスト | 400 |
| 名前の重複などの競合 | 409 |
| 認証情報が無い/不正 | 401 |
| Pydanticバリデーション失敗(FastAPI標準) | 422 |

---

## 9.2 APIレスポンス

`HTTPException` を経由するエラーは、FastAPI標準の形式でそのまま返る。

```json
{
  "detail": "Game not found."
}
```

422のバリデーションエラーはPydantic由来のため `detail` が配列になる(フィールドごとのエラー情報を含む)。この配列をフィールド単位でフロントエンドに反映する仕組みは未実装(issue QA-2で対応予定)。

---

## 9.3 未処理例外のフォールバック

`HTTPException` で捕捉されなかった例外(Supabase/Postgrest起因の例外や想定外のバグなど)は、`backend/app/main.py` に登録したグローバル例外ハンドラーが捕捉し、スタックトレースをログに出力したうえで、他のエラーと同じ `{"detail": string}` 形式の500レスポンスに変換する。

```python
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

これにより、実装済みの `HTTPException` ベースのエラーと、想定外の例外のどちらも同じレスポンス形状(`{"detail": string}`)に統一される。エラーコード(例: `GAME_NOT_FOUND`)による分類や、リポジトリ層でのPostgrest例外の個別翻訳は現状スコープ外。

---

# 10. ログ設計

## 10.1 ログ種類

- Access Log
- Error Log
- Application Log

---

## 10.2 ログ内容

- user_id
- endpoint
- method
- status_code
- response_time

---

# 11. 設計思想まとめ

ShogiLogバックエンドは以下を重視する。

- レイヤードアーキテクチャ
- Supabase中心設計
- RLSによるセキュリティ
- シンプルなRepository構造
- ビジネスロジックのService集約
- テスト容易性