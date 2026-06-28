---
ID: 014
種別: Bug
優先度: Medium
ステータス: Closed
---

# [BUG/SEC] オススメ書籍ロード時のShift_JISデコード警告ログの発生 (ID: 014)

## 1. 概要 / Summary
起動時にオススメ書籍（`773_yoko.txt`, `42939_yoko.txt` など）を読み込む際、コンソールに以下のデコード警告ログが出力される。

```
app.js:1363 Shift_JIS decode failed (fatal=true), falling back to UTF-8 for predefined book TypeError: Failed to execute 'decode' on 'TextDecoder': The encoded data was not valid.
```

これはオススメ書籍のファイルが実際には UTF-8 エンコーディングで保存されているのに対し、プログラム（`loadPredefinedBook`）が Shift_JIS デコードを第一優先として実行し、例外をキャッチしてフォールバックしているためである。動作上はフォールバックされて表示されているが、エラーログが発生するため改善が必要である。

### 再現手順 / Steps to Reproduce
1. ゆうぞらビューアーを起動する。
2. オススメ書籍グリッドから任意の書籍（例：「こころ」や「故郷」）をクリックする。
3. 開発者ツールのコンソールに警告ログが出力されるのを確認する。

### 再現環境 / Environment
- Browser / OS: All (Chrome / Firefox / Edgeなど)
- Book / File: `src/books/` 配下のすべてのオススメテキストファイル（UTF-8）

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [src/js/app.js](../../src/js/app.js) [MODIFY]

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis
`loadPredefinedBook` 関数において、テキストをデコードする際に `TextDecoder('shift-jis', { fatal: true })` を優先して呼び出している。
しかし、リポジトリに含まれる `src/books/*_yoko.txt` はすべて UTF-8 エンコーディングで保存されているため、Shift_JIS としてデコードしようとすると必ずデコードエラー（`fatal` 例外）が発生し、警告を出力した上で UTF-8 デコードへフォールバックされる。

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix
* **暫定対処 (Workaround)**: なし（動作自体はフォールバックにより表示されているため支障はない）。
* **恒久対策 (Permanent Fix)**:
  - プリデファインド本（オススメ書籍）はリポジトリで管理されており、文字コードが UTF-8 に統一されているため、`loadPredefinedBook` では UTF-8 を第一優先（またはUTF-8のみ）でデコードするように修正する。
  - もし Shift_JIS のプリデファインド本が混在する可能性を考慮する場合は、UTF-8 デコードを先に試し、失敗時に Shift_JIS へフォールバックするロジックにする。

---

## 5. 実装方針 / Implementation Plan
Target Branch: `fix/014-predefined-book-decoding-warning`

1. `src/js/app.js` の `loadPredefinedBook` 内のデコード処理順序を、UTF-8 優先に変更する（またはUTF-8固定にする）。
   - すべてのオススメ書籍が UTF-8 であるため、基本的には UTF-8 でデコードする。

---

## 6. 完了条件 / Success Criteria (DoD)
- [ ] `loadPredefinedBook` を実行した際、コンソールに Shift_JIS デコード警告ログが出力されないこと。
- [ ] オススメ書籍をクリックした際、文字化けせずに正しく内容が表示されること。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること。
- [ ] The implementation is fully consistent with DSN-01 and DSN-02 design specs (no dead documents).
