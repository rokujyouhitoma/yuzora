---
ID: 112
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [Enhancement] CIにおけるE2Eテストの両系並列実行基盤の拡充 (ID: 112)

## 1. 概要 / Summary
開発ソースコード直読み版 (`test:e2e`) と Closure Compiler 難読化ビルド版 (`test:e2e:compiled`) の両系E2EテストをCIおよびローカル環境で確実に実行・統合制御し、ビルド最適化起因のプロパティ名マングルや難読化回帰不具合を自動検出します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [x] [package.json](../../package.json) — `npm run test` コマンドにおける両系E2Eテスト連携
- [x] [README.md](README.md) — バックログ台帳の更新

---

## 3. アプローチと設計方針 / Design Approach
1. **難読化・コンパイル起因バグの二重防護**:
   非コンパイル環境（Web標準JSモジュール直読み）でのロジック検証に加え、Closure Compiler `ADVANCED_OPTIMIZATIONS` 適用後のプロダクションビルド（`main-min.js`）に対するE2E検証を二本柱として常時実行します。
2. **非破断性の自動アサーション**:
   要素待ち・ルーティング・Workerメッセージングなどの画面遷移動作が、難読化前後で完全に一致することを自動アサーションします。

---

## 4. 要件と技術詳細 / Technical Requirements
- `npm run test` 実行時に、単体テスト・型チェック・静的解析に加え、未コンパイル版E2E (`npm run test:e2e`) およびコンパイル版E2E (`npm run test:e2e:compiled`) の両方が全件実行されるよう統合する。

---

## 5. 完了条件 (DoD) / Acceptance Criteria
- [x] `npm run test` コマンドで全両系テストが順番通りエラーなく完走すること。
- [x] ドキュメント内のリンクが相対パスで記述され、[docs/backlogs/README.md](README.md) のステータスが `Approved` に同期していること。
