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
│   ├── game_repository.py
│   ├── tag_repository.py
│   ├── rating_repository.py
│   ├── profile_repository.py
│   └── opening_repository.py
│
├── services/
│   ├── game_service.py
│   ├── tag_service.py
│   ├── rating_service.py
│   ├── profile_service.py
│   └── dashboard_service.py
│
├── schemas/
│   ├── game.py
│   ├── tag.py
│   ├── profile.py
│   ├── rating.py
│   └── opening.py
│
├── utils/
│   ├── datetime.py
│   ├── validation.py
│   └── exceptions.py
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
- エラーは統一フォーマット

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

## 9.1 共通例外

```python
class AppException(Exception):
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code
```

---

## 9.2 APIレスポンス

```json
{
  "message": "Error message",
  "code": "ERROR_CODE"
}
```

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