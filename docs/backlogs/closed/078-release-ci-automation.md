---
ID: 078
種別: Enhancement
優先度: Medium
ステータス: Closed
---

# [ENH] リリース準備・バージョン管理のCI/CD自動化 (ID: 078)

## 1. 概要 / Summary
コミットログ（Conventional Commits）をトリガーとしたセマンティックバージョニングの判定、`CHANGES.md` のリリースセクションの自動追加、およびプロダクションビルド（`compiled.html`, `main-min.js`）の作成とGitHub Pagesへのリリースタグ付きデプロイをCI/CD（GitHub Actions）上で一貫して自動化します。開発プロジェクトにおけるリリース管理コストを最小化します。

## 2. 影響範囲と関連ファイル / Scope & Affected Files
- `.github/workflows/release.yml` (新規追加するリリース自動化ワークフロー)
- [package.json](../../package.json) (バージョン情報)

## 3. 要件と技術的詳細 / Requirements & Technical Details
- GitHub Actions の `release.yml` ワークフローを定義し、タグ打刻時またはリリースディスパッチ時に自動ビルドを実行。
- `make` コマンドにより `main-min.js` および `compiled.html` を生成し、GitHub Release アセットおよび Pages へデプロイ。

## 4. 受入基準 (DoD) / Acceptance Criteria
- [ ] `.github/workflows/release.yml` が追加されていること。
- [ ] リリースワークフローが構文エラーなく正常に完了すること。
