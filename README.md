# 📚 Documentation

> ネット将棋の対局記録・分析アプリの設計ドキュメント

---

## 概要

このディレクトリには、本プロジェクトの設計・開発・運用に関するドキュメントをまとめています。

本プロジェクトは **Next.js** をフロントエンド、**FastAPI** をバックエンドとして採用し、対局記録・棋譜管理・戦績分析・AI解析を行うWebアプリケーションです。

本ドキュメントは以下の目的で作成されています。

- 新しい開発者が短時間で環境構築できる
- 設計思想を共有する
- API仕様を統一する
- データベース構造を管理する
- 開発ルールを統一する
- 保守・運用を容易にする

---

# ドキュメント一覧

| ドキュメント | 内容 |
|--------------|------|
| architecture.md | システム全体設計 |
| setup.md | 開発環境構築 |
| frontend.md | フロントエンド設計 |
| backend.md | バックエンド設計 |
| database.md | データベース設計 |
| api.md | API仕様 |
| auth.md | 認証・認可 |
| deployment.md | Docker・デプロイ |
| coding-rule.md | コーディング規約 |
| contribution.md | 開発フロー |
| testing.md | テスト方針 |
| roadmap.md | 今後の開発予定 |

---

# プロジェクト概要

## 目的

ネット将棋を指した際の対局情報を記録し、

- 勝率
- 戦法
- 棋譜
- レーティング
- AI解析

などを一元管理できるサービスを目指します。

将来的にはUSI対応エンジン（YaneuraOuなど）による棋譜解析やAIコメント生成も実装予定です。

---

# 主な機能

## 対局管理

- 対局登録
- 編集
- 削除
- 一覧表示

---

## 棋譜管理

- KIF保存
- CSA保存
- SFEN保存
- 棋譜検索
- 棋譜閲覧

---

## 戦績分析

- 勝率
- 月別対局数
- 先手勝率
- 後手勝率
- 戦法別勝率
- レーティング推移

---

## AI解析（予定）

- 棋譜解析
- 評価値表示
- 最善手表示
- 悪手検出
- AIコメント生成

---

## ユーザー管理

- 新規登録
- ログイン
- JWT認証
- プロフィール管理

---

# 使用技術

## Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT Authentication

---

## Database

- PostgreSQL

---

## Infrastructure

- Docker
- Docker Compose

---

## Future

- Redis
- Celery
- YaneuraOu
- USI Engine
- OpenAI API

---

# システム構成

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Next.js    │
└──────┬───────┘
       │ REST API
       ▼
┌──────────────┐
│   FastAPI    │
├──────────────┤
│ Authentication│
│ CRUD          │
│ Analysis      │
└──────┬────────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │
└──────────────┘
```

---

# ディレクトリ構成

```
project/

├── frontend/
│
├── backend/
│
├── docs/
│
├── docker-compose.yml
│
└── README.md
```

詳細は各ドキュメントを参照してください。

---

# 開発方針

本プロジェクトでは以下の方針を採用します。

## レイヤー分離

フロントエンドとバックエンドを完全に分離します。

```
Frontend

↓

REST API

↓

Backend

↓

Database
```

---

## 責務の分離

1つのクラス・関数には1つの責務だけを持たせます。

例

- Router
- Service
- CRUD
- Repository
- Model
- Schema

を分離して実装します。

---

## API First

フロントエンドより先にAPI仕様を決定します。

API仕様書をもとに

- Backend
- Frontend

を並行開発できる構成を目指します。

---

## 型安全

Frontend

TypeScript

Backend

Pydantic

を利用し、型の不一致をできる限り防ぎます。

---

## 拡張性

今後追加予定の機能

- AI解析
- 棋譜インポート
- 棋譜エクスポート
- レーティング自動取得
- PWA対応
- 通知機能

を考慮した設計とします。

---

# ブランチ運用

GitHub Flowを採用します。

```
main
  │
develop
  │
feature/○○
```

詳細は

```
docs/contribution.md
```

を参照してください。

---

# コーディング規約

命名規則やフォーマットについては

```
docs/coding-rule.md
```

を参照してください。

---

# テスト

テスト方針については

```
docs/testing.md
```

を参照してください。

---

# ドキュメント更新ルール

コードを変更した場合は、必要に応じて対応するドキュメントも更新してください。

例

- API追加 → api.md
- テーブル追加 → database.md
- ディレクトリ変更 → architecture.md
- 開発手順変更 → setup.md

---

# 開発者向けチェックリスト

新しい機能を追加する場合は以下を確認してください。

- [ ] API仕様を更新した
- [ ] DB設計を更新した
- [ ] 必要ならER図を更新した
- [ ] フロントエンド画面を更新した
- [ ] テストを追加した
- [ ] ドキュメントを更新した

---

# 今後の予定

- 棋譜解析エンジンとの連携
- AIレビュー機能
- 棋譜共有
- レーティンググラフ
- ダークモード
- モバイル対応
- PWA対応

詳細は

```
docs/roadmap.md
```

を参照してください。

---

# ライセンス

ライセンスについてはプロジェクトルートの `LICENSE` を参照してください。

---

# お問い合わせ

不具合や改善案はGitHub Issueを利用してください。

Pull Requestは歓迎します。

---