# System Architecture (Final Layer)

> **ShogiLog システム全体アーキテクチャ補完設計**
>
> Version: 1.0.0  
> Status: Draft  
> Last Updated: 2026-07-05

---

# 1. はじめに

## 1.1 本ドキュメントについて

本ドキュメントではShogiLog全体のアーキテクチャを統合的に整理し、

- フロントエンド
- バックエンド
- データベース
- 認証
- 外部サービス

の関係性を明確化します。

---

# 2. システム全体構造

## 2.1 全体図

```text
            ┌──────────────────────┐
            │      Next.js         │
            │  (Frontend / Vercel) │
            └─────────┬────────────┘
                      │ HTTP (JWT)
                      ▼
            ┌──────────────────────┐
            │      FastAPI         │
            │   (Backend API)      │
            └─────────┬────────────┘
                      │ Supabase Client
                      ▼
        ┌──────────────────────────────┐
        │         Supabase             │
        │  PostgreSQL / Auth / RLS    │
        └──────────────────────────────┘
```

---

# 3. データフロー設計

## 3.1 基本フロー

### ① ユーザー操作

```text
User → UI操作
```

---

### ② APIリクエスト

```text
Frontend → FastAPI (JWT付き)
```

---

### ③ 認証検証

```text
FastAPI → Supabase Auth (JWT検証)
```

---

### ④ データ取得

```text
FastAPI → Supabase PostgreSQL
```

---

### ⑤ レスポンス

```text
Supabase → FastAPI → Frontend → UI
```

---

# 4. システム設計原則

## 4.1 単一責任原則

各層は明確な責務を持つ。

|層|責務|
|---|---|
|Frontend|UI・状態管理|
|API|ルーティング|
|Service|ビジネスロジック|
|Repository|DBアクセス|
|DB|データ管理|

---

## 4.2 依存方向

```text
UI → API → Service → Repository → DB
```

逆方向依存は禁止。

---

# 5. 非機能要件

## 5.1 パフォーマンス

- APIレスポンス：200ms〜800ms以内
- ページロード：2秒以内目標
- キャッシュ活用（将来）

---

## 5.2 スケーラビリティ

- Supabaseスケーリング対応
- FastAPI水平スケール可能
- Vercel自動スケール

---

## 5.3 可用性

- Supabase SLA依存
- Vercel高可用性
- API冗長化（将来）

---

## 5.4 保守性

- レイヤー分離
- 明確な責務分割
- 型安全性（TypeScript / Pydantic）

---

# 6. セキュリティ設計

## 6.1 認証

- Supabase Auth
- JWTベース認証

---

## 6.2 認可

- Supabase RLS
- FastAPI側チェック

---

## 6.3 データ保護

- user_id強制付与
- クライアントID禁止
- HTTPS必須

---

# 7. キャッシュ戦略（将来）

## 7.1 想定構成

```text
Frontend Cache
API Cache (React Query)
Redis Cache（将来）
```

---

# 8. ロギング設計

## 8.1 ログ階層

|種類|内容|
|---|---|
|Access|APIアクセス|
|Error|例外|
|Debug|開発用|

---

## 8.2 ログ構造

```json
{
  "timestamp": "...",
  "user_id": "...",
  "endpoint": "/games",
  "status": 200,
  "latency_ms": 120
}
```

---

# 9. モジュール設計思想

## 9.1 Backend

- Service中心設計
- Repository抽象化
- APIは薄く

---

## 9.2 Frontend

- Feature中心設計
- UIとロジック分離
- Server Component優先

---

# 10. スケーリング戦略

## 10.1 初期フェーズ

- 単一FastAPI
- Supabase free/paid
- Vercel serverless

---

## 10.2 成長フェーズ

- Redis導入
- CDN強化
- DB最適化

---

## 10.3 拡張フェーズ

- マイクロサービス化（必要時のみ）
- 分析基盤追加
- AI解析導入（将来）

---

# 11. AI拡張余地（将来）

※今回未実装だが設計上考慮

- 棋譜解析
- 戦型分類
- 勝率予測
- 形勢評価

---

# 12. システム成熟モデル

ShogiLogは以下の段階で成長する。

### Phase 1
- 対局ログ管理

### Phase 2
- 統計・検索強化

### Phase 3
- 分析・可視化

### Phase 4
- AI支援

---

# 13. 最終設計まとめ

ShogiLogは以下を中核とするシステムである。

- Supabase中心のデータ設計
- FastAPIによるAPIレイヤー
- Next.jsによるUI構築
- 明確なレイヤー分離
- 将来拡張可能な構造

本設計をもとに、実装フェーズへ移行する。