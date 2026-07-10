# AGENTS.md

ShogiLog は、ネット将棋の対局記録・管理・分析を行う Web アプリケーションです。
フロントエンドは Next.js、バックエンドは FastAPI、データ基盤は Supabase PostgreSQL/Auth を前提にしています。

## リポジトリ構成

- `frontend/`: Next.js App Router アプリケーション。フロントエンドが未作成の場合、このディレクトリは存在しないことがあります。
- `backend/`: FastAPI アプリケーション。
- `backend/app/main.py`: FastAPI のエントリーポイント。
- `backend/app/api/`: API ルーター。バージョン付きエンドポイントは `backend/app/api/v1/` に配置します。
- `backend/app/core/`: 設定値やセキュリティ関連のユーティリティ。
- `backend/app/dependencies/`: 認証などのリクエスト依存処理。
- `backend/app/db/`: Supabase クライアント設定。
- `supabase/migrations/`: データベースマイグレーション。
- `docs/`: アーキテクチャ、フロントエンド、バックエンド、API、データベース、デプロイ設計のドキュメント。

## 最初に読むもの

大きめの変更を行う前に、関連するドキュメントを確認してください。

- `docs/architecture.md`: プロダクト全体のスコープと技術選定。
- `docs/frontend.md`: Next.js の構成とフロントエンド規約。
- `docs/backend.md`: FastAPI のレイヤー設計とバックエンド規約。
- `docs/api.md`: API 契約。
- `docs/database.md` と `supabase/migrations/`: スキーマ変更。

実装とドキュメントが食い違う場合、小さな修正では現在の実装を優先してください。
アーキテクチャや公開 API の挙動を変える場合は、関連ドキュメントも更新してください。

## バックエンド作業ルール

- FastAPI のルートハンドラーは薄く保ってください。
- 依存方向は `Router -> Service -> Repository -> Supabase` を基本にしてください。
- 新しいビジネス処理を追加する場合、ルーターに直接データベースアクセスを書かないでください。
- 認証が必要なリソースでは、クライアントから `user_id` を受け取らず、検証済みトークンまたはセッションからサーバー側で取得してください。
- API ルートは `/api/v1` 配下に配置してください。
- 構造化されたリクエスト・レスポンスを追加する場合は、Pydantic モデルでバリデーションしてください。
- 環境依存の値は `backend/app/core/config.py` または環境変数で扱ってください。
- 実際のシークレットは絶対にコミットしないでください。バックエンドで想定される環境変数は以下です。
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ANON_KEY`
  - `JWT_SECRET`
  - `ENV`

## フロントエンド作業ルール

- Next.js App Router と TypeScript を使用してください。
- データ取得には、必要に応じて Server Components を優先してください。
- Client Components は、インタラクション、フォーム、ブラウザ API、ローカル UI 状態が必要な箇所に限定してください。
- API アクセスは `frontend/src/services/api/` などの専用レイヤーに集約してください。
- 機能単位のコードは `frontend/src/features/` 配下に整理してください。
- フロントエンド作成後は、Tailwind CSS と shadcn/ui の方針に合わせてください。
- ブラウザに公開する環境変数には `NEXT_PUBLIC_` プレフィックスを付けてください。

## データベースと Supabase

- データベース構造は `supabase/migrations/` で管理します。
- スキーマ変更時は、適用済みマイグレーションを編集せず、新しいマイグレーションを追加してください。
- Supabase RLS の前提を壊さないようにしてください。service-role の扱いには注意し、service-role key をフロントエンドに公開しないでください。
- テーブルに関わる API 挙動を変更した場合は、対応するドキュメントやマイグレーションメモも更新してください。

## よく使うコマンド

バックエンド:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pytest
```

フロントエンド作成後:

```bash
cd frontend
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
```

実際にリポジトリに存在するコマンドを使ってください。
package script やテスト設定が存在しない場合は、成功したことにせず、最終報告でその旨を伝えてください。

## 変更時の注意

- 変更は依頼された作業に絞ってください。
- 関係のないリファクタリングやフォーマット変更は避けてください。
- アーキテクチャ、公開 API の挙動、環境変数、セットアップ手順を変更した場合はドキュメントも更新してください。
- 挙動を変更する場合は、必要に応じてテストを追加・更新してください。小さな接続修正であればスモークチェックで十分な場合もあります。
- 検索にはできるだけ `rg` を使ってください。
- ファイル編集前に周辺コードを確認し、既存のスタイルに合わせてください。

## 検証方針

バックエンド変更では、まず必要最小限の確認を行ってください。通常は以下です。

```bash
cd backend
pytest
```

フロントエンド変更では、プロジェクトで定義されている lint/test/build コマンドがあれば実行してください。

API やスキーマを変更した場合は、必要に応じて以下も確認してください。

- FastAPI の起動確認。
- OpenAPI ルートの確認。
- Supabase マイグレーションの確認。

実行できなかった確認がある場合は、その理由を記録してください。
