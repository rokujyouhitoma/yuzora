---
ID: 042
種別: Refactor
優先度: Medium
ステータス: Promoted
---

# [REFACTOR] JSDocとtsc（TypeScript Compiler）による静的型チェックの導入 (ID: 042)

## 1. 概要 / Summary
現在、ソースコード全体の型安全性や型チェックは、ビルド時の Closure Compiler による検証と `externs.js` による難読化保護に依存しています。しかし、Closure Compiler のみの警告では開発中のエディタ連携が弱く、実装時の型不整合やプロパティのタイポなどのバグがテスト実行時まで検出されにくい課題があります。

これを防ぎ開発体験（DX）と堅牢性を高めるため、以下を導入します。
- すべてのJavaScriptソースコード内で JSDoc による型アノテーションを定義・厳格化する。
- TypeScriptコンパイラ（`tsc`）を用いて、JavaScriptコードをそのまま活かした静的型チェック（`allowJs` と `checkJs` オプション）を導入する。
- CIパイプラインの品質ゲートに `tsc --noEmit` による型チェック工程を追加し、マージ前に静的エラーを100%検出する。
