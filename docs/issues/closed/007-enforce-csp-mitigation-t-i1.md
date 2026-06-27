---
ID: 007
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG/SEC] Content Security Policy (CSP) の定義による情報漏洩防止 (ID: 007)

## 1. 概要 / Summary
読み込んだ書籍コンテンツ、しおりの進捗履歴、ユーザー設定情報などが、XSS等を介して外部サーバーへ不正に送信されるリスク（情報漏洩）を軽減するため、メタタグによるContent Security Policy (CSP) を導入し、外部への接続（connect-src）やスクリプト読み込み先などを厳格に制限します。これは脅威モデルの T-I1 に該当します。

### 再現手順 / Steps to Reproduce
1. (仮) 悪意のあるインラインスクリプトや外部スクリプトの実行により、外部サーバー（例: `https://malicious.example.com`）への情報送信を試みる。
2. 現状ではCSPが定義されていないため、ブラウザは外部サーバーへの接続（Fetch / XHR）やリソース取得を許可してしまう。

### 再現環境 / Environment
- Browser / OS: すべてのモダンブラウザ
- Book / File: 外部接続を試みる悪意あるコード

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [index.html](../../index.html)
- [ ] [DSN-01-high_level_design.md](../DSN-01-high_level_design.md)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
現在、ゆうぞらプロジェクトでは完全クライアントサイド（Serverless）で動作する静的SPAビューアーですが、HTMLドキュメントに Content Security Policy (CSP) が明示的に定義されていません。このため、万が一 XSS などにより不正なスクリプトがインジェクションされた場合、攻撃者の外部ドメインに情報を送信（情報漏洩）されたり、外部から攻撃スクリプトをロードされたりする攻撃を防ぐことができません。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし
* **恒久対策 (Permanent Fix)**: `index.html` の `<head>` 内に `<meta http-equiv="Content-Security-Policy" content="...">` タグを定義します。以下のディレクティブを設定して、外部リソースへのアクセスを制限します。
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self' https://fonts.googleapis.com` (Google Fonts の読み込みを許可)
  - `font-src 'self' https://fonts.gstatic.com` (Google Fonts のフォントファイルを許可)
  - `connect-src 'self'` (外部API接続を禁止、ローカルの静的ブックファイルのFetchのみ許可)
  - `img-src 'self' data:` (画像読み込みは同一ドメインおよびdata:URIのみ許可)

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/007-enforce-csp-mitigation-t-i1`

1. 設計ドキュメント [DSN-01-high_level_design.md](../DSN-01-high_level_design.md) に CSP 設定によるセキュリティ方針を追記する。
2. `index.html` に CSP メタタグを追記する。

---

## 6. 完了条件 / Success Criteria (DoD)
- [x] `index.html` に適切な CSP メタタグが設定されていること。
- [x] アプリ起動時に Google Fonts が正常に適用され、フォント崩れや表示異常が起きないこと。
- [x] ローカルのおすすめ本が正常に読み込めること。
- [x] 実装が [DSN-01](../DSN-01-high_level_design.md) の設計仕様と完全に一致していること。
- [x] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。

