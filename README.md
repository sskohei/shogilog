# ShogiLog

> ネット将棋の対局記録・管理・分析を行うWebアプリケーション

---

## 概要

複数のネット将棋サービスで指した対局を一元管理し、日々の振り返りや棋力向上を支援します。
対局履歴の閲覧は各サービス単体でも可能ですが、サービス横断での管理・自分用メモ・タグ管理・
戦法別分析・レーティング推移といった情報を一箇所にまとめることは困難です。ShogiLogはそれらを
一元管理できる環境を提供します。

Version 1では以下のサービスに対応しています。

- 将棋ウォーズ
- 将棋クエスト
- 棋桜
- 81道場

フロントエンドは Next.js、バックエンドは FastAPI、データ基盤は Supabase(PostgreSQL / Auth / Storage)
を採用しています。

---

## ドキュメント一覧

設計・開発に関する詳細ドキュメントは `docs/` にあります。

| ドキュメント | 内容 |
|---|---|
| [docs/architecture.md](docs/architecture.md) | システム全体設計・技術選定理由 |
| [docs/architecture_final.md](docs/architecture_final.md) | アーキテクチャ補完設計 |
| [docs/frontend.md](docs/frontend.md) | フロントエンド設計・規約 |
| [docs/backend.md](docs/backend.md) | バックエンド設計・規約 |
| [docs/database.md](docs/database.md) | データベース設計 |
| [docs/api.md](docs/api.md) | API仕様 |
| [docs/development.md](docs/development.md) | 開発ガイド(ブランチ運用・コミット規約・コーディング規約) |
| [docs/deployment.md](docs/deployment.md) | デプロイ・運用設計 |

開発の際は、コードとドキュメントに実装ルールをまとめた [CLAUDE.md](CLAUDE.md) も参照してください
(ブランチ命名・PR命名・検証方針など)。

---

## 主な機能(実装済み)

- **対局管理**: 対局の登録・編集・削除・一覧表示・詳細表示
- **タグ管理**: 対局への自由なタグ付け
- **プロフィール**: プラットフォームごとのレーティング/段位の管理
- **戦法(オープニング)**: お気に入り登録
- **ダッシュボード**: 総対局数・勝率・戦法別勝率・月別対局数・レーティング推移などの集計とグラフ表示
- **棋譜ファイル**: アップロードしたファイルへの署名付きURLでのアクセス
  (KIF/CSA/SFENなど形式ごとの解析・表示機能は現状未実装で、単純なファイルリンクです)
- **認証**: Supabase Authによるサインアップ・ログイン・ログアウト

---

## 使用技術

### Frontend

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4、shadcn/ui(内部コンポーネントは Base UI)
- Supabase JSクライアント(`@supabase/supabase-js`, `@supabase/ssr`)
- Recharts(グラフ)
- Vitest / Testing Library(テスト)

### Backend

- FastAPI
- Supabase Pythonクライアント(ORMは使用せず、直接Supabaseにアクセス)
- Pydantic(バリデーション)
- python-jose(JWT検証)
- pytest(テスト)

### データ基盤

- Supabase(PostgreSQL / Auth / Storage / RLS)
- スキーマは `supabase/migrations/` で管理

---

## ディレクトリ構成

```text
shogilog/
├── backend/       # FastAPIアプリケーション
├── frontend/      # Next.js App Routerアプリケーション
├── docs/          # 設計・開発ドキュメント
├── supabase/      # DBマイグレーション
├── CLAUDE.md      # 開発ルール(AIエージェント向けにも利用)
├── LICENSE
└── README.md
```

---

## セットアップ

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

`backend/.env.example` を `backend/.env` にコピーし、以下を設定してください。

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

`frontend/.env.local.example` を `frontend/.env.local` にコピーし、以下を設定してください
(`NEXT_PUBLIC_SUPABASE_*` はbackendと同じSupabaseプロジェクトを指定します)。

```env
BACKEND_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## テスト

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

---

## 開発ルール

ブランチ命名・PR命名・レイヤー規約(Router → Service → Repository → Supabase)・検証方針などの
詳細は [CLAUDE.md](CLAUDE.md) と [docs/development.md](docs/development.md) を参照してください。

---

## デプロイ

現時点では未デプロイ・CI未整備です。想定しているホスティング構成
(Vercel + Render/Fly.io/Railway、Docker、GitHub Actionsなど)は
[docs/deployment.md](docs/deployment.md) を参照してください。

---

## 今後の展望(Version 2以降)

`docs/architecture.md` で構想している範囲です。現時点では未着手です。

- AI解析(USIエンジンによる評価値・最善手・悪手判定)
- 棋譜共有(URL共有・公開設定・閲覧権限)
- SNS機能(フォロー・コメント・いいね)
- PWA対応

---

## ライセンス

[LICENSE](LICENSE)(MIT License)を参照してください。

---

## 問い合わせ

不具合や改善案はGitHub Issueを利用してください。Pull Requestは歓迎します。
