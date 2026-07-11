---
ID: 059
種別: Bug
優先度: High
ステータス: Closed
---

# [BUG] `｜` なし自動ルビが非漢字文字の後ろに続く漢字に適用されない (ID: 059)

## 1. 概要 / Summary

`tokenizeInline()` において、`《》` で囲まれたルビが漢字のみで構成される単語に対して、
その直前に平仮名・句読点などの非漢字文字が存在する場合、`<ruby>` タグへの変換が行われない。

例えば `冬の最中《さなか》で` では `最中《さなか》` が `<ruby>最中<rt>さなか</rt></ruby>` に
変換されるべきだが、`冬の最中《さなか》で` という TEXT トークンのままになってしまう。

### 再現手順 / Steps to Reproduce

1. 青空文庫形式テキストを Yuzora で開く（例: 魯迅「故郷」）
2. 以下のような文節を含む行を確認:
   - `冬の最中《さなか》で`
   - `天気は小闇《おぐら》くなり`
   - `荒村《あれむら》があちこちに`
3. 本文がレンダリングされた HTML を確認する

### 再現環境 / Environment

- Browser / OS: All (ロジックのバグのためブラウザ非依存)
- Book / File: 魯迅「故郷」等、漢字ルビを含む青空文庫テキスト

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files

- [ ] [parser.js](../../src/js/modules/parser.js) — `tokenizeInline()` 内の `nestedKanjiMatch` ロジック修正
- [ ] [parser.test.js](../../tests/unit/parser.test.js) — 再現テストケースの追加
- [ ] `main-min.js` の再ビルド (`make`)

---

## 3. 根本原因分析 (RCA) / Root Cause Analysis

`tokenizeInline()` の「テキスト処理」ブロック（else 節）に以下のコードがある:

```js
const textChunk = text.substring(i, nextSpecial);  // nextSpecialは《の位置
const nestedKanjiMatch = textChunk.match(/[一-龠々〆ヶ]+《/);  // ← バグ
```

`nextSpecial` は `specials = ['｜', '|', '［＃', '《']` のうち最初に出現する文字の位置に設定される。
`《` が最初に見つかる場合、`textChunk = text.substring(i, pos_of_《)` となり、
`textChunk` は `《` を**含まない**。

したがって `/[一-龠々〆ヶ]+《/` は `《` を含まない文字列を対象としており、
**構造的に絶対にマッチしない**。

この結果、`冬の最中` が TEXT トークンとして丸ごと消費され、
次のループで `《` が先頭に来た際に `kanjiMatch` も機能せず、
`《さなか》` が文字単位の TEXT として出力される。

**修正すべき正規表現:**

```diff
-const nestedKanjiMatch = textChunk.match(/[一-龠々〆ヶ]+《/);
-if (nestedKanjiMatch) {
-    nextSpecial = i + nestedKanjiMatch.index;
-}
+// textChunkの末尾にある漢字/英字列を検出し、《が続く場合にnextSpecialを巻き戻す
+if (text[nextSpecial] === '《') {
+    const nestedKanjiMatch = textChunk.match(/([一-龠々仝〆〇ヶ]+|[A-Za-z]+)$/);
+    if (nestedKanjiMatch) {
+        nextSpecial = i + nestedKanjiMatch.index;
+    }
+}
```

この修正により:
1. `textChunk = '冬の最中'` の末尾から `/([一-龠...]+|[A-Za-z]+)$/` でマッチ → `最中` が検出される
2. `nextSpecial` が `最中` の先頭位置（`i+2`）に巻き戻される
3. TEXT トークンとして `冬の` だけが出力される
4. 次ループで `i` が `最` に来て、`kanjiMatch` が `最中《さなか》` に正常マッチ → RUBY トークン

---

## 4. 暫定対処と恒久対策 / Workaround & Permanent Fix

* **暫定対処 (Workaround)**: ルビを振りたい漢字の直前に `｜` を挿入する（例: `冬の｜最中《さなか》で`）
* **恒久対策 (Permanent Fix)**: `nestedKanjiMatch` の正規表現を末尾マッチに変更し、`仝`, `〇` も追加する

---

## 5. 実装方針 / Implementation Plan

Target Branch: `fix/059-ruby-not-applied-with-preceding-non-kanji`

1. **`src/js/modules/parser.js` を修正** (`tokenizeInline()` 内):
   - `nestedKanjiMatch` の正規表現を `/([一-龠々仝〆〇ヶ]+|[A-Za-z]+)$/` に変更
   - `text[nextSpecial] === '《'` の場合のみ適用するガード条件を追加
2. **`tests/unit/parser.test.js` にテストケースを追加**:
   - `冬の最中《さなか》で` → `冬の<ruby>最中<rt>さなか</rt></ruby>で`
   - `天気は小闇《おぐら》くなり` → `天気は<ruby>小闇<rt>おぐら</rt></ruby>くなり`
   - `荒村《あれむら》があちこちに` → `<ruby>荒村<rt>あれむら</rt></ruby>があちこちに`
   - `前文 Fanatiker《ファナチイケル》後文` (英字ルビも前置き文字あり)
3. **`make` で `main-min.js` を再ビルド**
4. **`npm run test:unit` で全テストパスを確認**

---

## 6. 完了条件 / Success Criteria (DoD)

- [ ] `冬の最中《さなか》で` が `冬の<ruby>最中<rt>さなか</rt></ruby>で` に変換されること
- [ ] `天気は小闇《おぐら》くなり` が `天気は<ruby>小闇<rt>おぐら</rt></ruby>くなり` に変換されること
- [ ] 既存のすべてのテスト（`｜` デリミタ付き、`｜` なし漢字、アルファベット、二の字点等）が引き続き Green であること
- [ ] すべてのE2Eテスト (`npm run test:e2e`) およびユニットテスト (`npm run test:unit`) が正常にパスすること
- [ ] `main-min.js` が再ビルドされ、ブラウザで実際に `<ruby>` タグが確認できること
