# Deployment Design

> **ShogiLog デプロイ・運用設計書**
>
> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-07-05

---

# 1. はじめに

## 1.1 本ドキュメントについて

本ドキュメントではShogiLogのデプロイ構成および運用方針について定義します。

本システムはフロントエンド・バックエンド・データベースが分離された構成であり、それぞれに適したホスティングを行います。

---

# 2. 全体アーキテクチャ（本番構成）

```text
[User]
  ↓
[Next.js (Vercel)]
  ↓
[FastAPI (API Server)]
  ↓
[Supabase PostgreSQL]
  ↓
[Supabase Auth / Storage]
```

---

# 3. ホスティング構成

## 3.1 フロントエンド

### Vercelを使用

- Next.js公式プラットフォーム
- 自動デプロイ対応
- Edge Network
- SSR対応

---

### デプロイ対象

- frontend/

---

### デプロイ方法

- GitHub連携による自動デプロイ
- mainブランチ = production
- developブランチ = preview

---

## 3.2 バックエンド

### FastAPI

ホスティング候補：

- Render
- Fly.io
- Railway
- AWS (EC2 / ECS)

---

### 推奨構成（Version1）

```text
Render + Docker
```

理由：

- 簡単
- 無料枠あり
- CI/CD対応
- FastAPIと相性良い

---

### デプロイ対象

- backend/

---

### 起動方法

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 3.3 データベース

### Supabase

- PostgreSQL
- Auth
- Storage
- RLS

---

### 管理方法

- Supabase Dashboard
- Supabase CLI（Migration）

---

# 4. 環境構成

## 4.1 環境区分

|環境|用途|
|---|---|
|development|ローカル開発|
|staging|テスト環境|
|production|本番環境|

---

## 4.2 フロントエンド環境変数

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 4.3 バックエンド環境変数

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
ENV=production
```

---

# 5. CI/CD設計

## 5.1 フロントエンド（Vercel）

### 自動デプロイ

- push → 自動ビルド
- main → production
- PR → preview

---

## 5.2 バックエンド（GitHub Actions）

### フロー

```text
push → test → build → deploy
```

---

### 例（概念）

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest

      - name: Deploy
        run: echo "Deploy to Render/Fly.io"
```

---

# 6. Docker構成

## 6.1 バックエンドDocker

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 6.2 docker-compose（開発用）

```yaml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - .env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

---

# 7. デプロイ戦略

## 7.1 フロントエンド

- main = production
- PR = preview environment

---

## 7.2 バックエンド

- main → production deploy
- staging branch → test deploy

---

## 7.3 データベース

- migrationベース運用
- 本番直接編集禁止

---

# 8. ドメイン設計

## 8.1 想定構成

```text
https://shogilog.app
```

---

## 8.2 API

```text
https://api.shogilog.app
```

---

# 9. ログ管理

## 9.1 フロントエンド

- Vercel Logs

---

## 9.2 バックエンド

- Render/Fly.io Logs
- stdout管理

---

## 9.3 データベース

- Supabase Logs
- Query performance monitoring

---

# 10. 監視・運用

## 10.1 監視対象

- APIレスポンス
- エラーレート
- DB遅延
- CPU使用率

---

## 10.2 ツール候補

- Sentry（エラー監視）
- Supabase Dashboard
- Vercel Analytics

---

# 11. セキュリティ

## 11.1 基本方針

- HTTPS必須
- JWT認証
- RLS有効化
- 環境変数管理
- secretsのGit管理禁止

---

## 11.2 API保護

- CORS制御
- Rate limiting（将来）
- Input validation

---

# 12. バックアップ

## 12.1 Supabase

- 自動バックアップ利用
- 手動バックアップ（リリース前）

---

# 13. スケーリング

## 13.1 初期構成

- 単一FastAPIインスタンス
- Supabase free/paid tier
- Vercel serverless

---

## 13.2 将来拡張

- FastAPI horizontal scaling
- Redis導入（キャッシュ）
- CDN強化
