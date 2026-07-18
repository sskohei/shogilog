# Development Guide

> **ShogiLog 開発ガイド**
>
> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-07-05

---

# 1. はじめに

## 1.1 本ドキュメントについて

本ドキュメントではShogiLogの開発ルール・開発フロー・コーディング規約を定義します。

本プロジェクトは複数人開発を前提とし、一貫性と保守性を重視します。

---

# 2. 開発方針

## 2.1 基本方針

ShogiLogの開発は以下を重視します。

- 可読性
- 保守性
- 拡張性
- 一貫性
- 再利用性

---

## 2.2 技術思想

- フロントエンド：UI中心設計
- バックエンド：ビジネスロジック中心設計
- DB：Supabase中心設計
- API：REST統一

---

# 3. ブランチ戦略

## 3.1 Git Flowベース

```text
main
  └── develop
        ├── feature/*
        ├── fix/*
        ├── refactor/*
        └── chore/*
```

---

## 3.2 ブランチルール

|ブランチ|用途|
|---|---|
|main|本番|
|develop|開発統合|
|feature/*|新機能|
|fix/*|バグ修正|
|refactor/*|リファクタリング|
|chore/*|雑務|

---

## 3.3 命名例

```text
feature/game-create
feature/tag-system
fix/login-error
refactor/api-layer
chore/update-deps
```

---

# 4. コミット規約

## 4.1 Conventional Commits

```text
type(scope): message
```

---

## 4.2 Type一覧

|type|意味|
|---|---|
|feat|新機能|
|fix|バグ修正|
|refactor|リファクタ|
|chore|雑務|
|docs|ドキュメント|
|test|テスト|

---

## 4.3 例

```text
feat(games): add game creation API
fix(auth): fix login token bug
refactor(api): restructure service layer
docs(api): update endpoint documentation
```

---

# 5. コーディング規約

## 5.1 共通

- snake_case（backend）
- camelCase（frontend）
- UUID使用
- magic number禁止

---

## 5.2 Python（FastAPI）

### スタイル

- PEP8準拠
- type hints必須
- Pydantic使用

---

### 例

```python
def get_game(game_id: str) -> GameSchema:
    ...
```

---

## 5.3 TypeScript（Next.js）

### スタイル

- strict mode有効
- interface使用
- any禁止

---

### 例

```ts
interface Game {
  id: string;
  title: string;
}
```

---

# 6. ディレクトリルール

## 6.1 Backend

- router → api/
- business logic → services/
- db access → repositories/

---

## 6.2 Frontend

- UI → components/
- feature → features/
- API → services/api/

---

# 7. 開発フロー

## 7.1 基本フロー

```text
1. Issue作成
2. featureブランチ作成
3. 実装
4. PR作成
5. レビュー
6. merge
```

---

## 7.2 PRルール

- 必ずレビュー1名以上
- CI通過必須
- 小さな単位でPR作成

---

# 8. Issue管理

## 8.1 ルール

- 1 Issue = 1タスク
- 大きいタスクは分割
- テンプレート使用

---

## 8.2 ラベル

|label|意味|
|---|---|
|bug|バグ|
|feature|新機能|
|enhancement|改善|
|docs|ドキュメント|

---

# 9. テスト方針

## 9.1 Backend

- pytest使用
- service層を中心にテスト

---

## 9.2 Frontend

- React Testing Library
- UIコンポーネントテスト

---

# 10. エラーハンドリング

## 10.1 Backend

- AppException統一
- エラーコード管理

---

## 10.2 Frontend

- toast通知
- fallback UI
- error boundary

---

# 11. Gitルール

## 11.1 禁止事項

- main直接push禁止
- force push禁止（原則）
- 未レビューmerge禁止

---

## 11.2 必須事項

- PRベース開発
- commit message統一
- CI通過必須

---

# 12. 設計思想まとめ

ShogiLog開発は以下を基本とする。

- 小さく作る
- 明確に分離する
- 再利用可能にする
- 変更しやすくする
- 一貫性を保つ
