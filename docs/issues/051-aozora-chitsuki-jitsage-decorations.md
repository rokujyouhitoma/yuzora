---
ID: 051
種別: Enhancement
優先度: Medium
ステータス: Open (New)
---

# [ENH] 青空文庫「地付き」「地寄せ」「地から○字上げ」レイアウトおよび装飾対応 (ID: 051)

## 1. 概要 / Summary
青空文庫の入力手引マニュアルに基づき、作品内の署名、日付、または詩歌のレイアウトとして頻出する配置指定「地付き」「地寄せ」「地から○字上げ」、およびインライン修飾「太字」「斜体」のパースとレンダリング表示に対応します。
本機能は、完全クライアントサイド実行モデルの下で、伝統的な縦書き表示レイアウトの再現性を高めるための改善です。現在、パーサー層で未対応のマークアップが一括消去されることによるレイアウト崩れや書式情報の喪失を解消します。

---

## 2. トレーサビリティ / Traceability
- 関連バックログ: [044-aozora-chitsuki-jitsage-decorations.md](../backlogs/closed/044-aozora-chitsuki-jitsage-decorations.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [parser.js](src/js/modules/parser.js)
- [ ] [base.css](src/css/modules/base.css)
- [ ] [reader.css](src/css/modules/reader.css)
- [ ] [app.test.js](tests/unit/app.test.js)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enhancement/051-aozora-chitsuki-jitsage-decorations`

1. **インライン装飾の正規表現追加** (`formatAozoraMarkup` 内):
   - `［＃ここから太字］(.+?)［＃ここで太字終わり］` を `<strong class="aozora-bold">$1</strong>` へ置換。
   - `［＃ここから斜体］(.+?)［＃ここで斜体終わり］` を `<em class="aozora-italic">$1</em>` へ置換。
2. **配置指定（地付き等）のパーサー対応**:
   - `parseJisage` と同様に、行の頭や末尾に存在する配置注記をパースする関数 `parseAlignment` を定義。
     - `［＃地付き］` -> クラス名 `chitsuki`
     - `［＃地寄せ］` -> クラス名 `chiyose`
     - `［＃地から([０-９0-9]+)字上げ］` -> クラス名 `chitage-$1`（数字は半角に正規化）
     - パースした注記文字は行から除去。
   - `buildLineHTML` で、検知した配置クラスを `<p>` タグのクラス属性に結合して出力します。
3. **CSS 縦書きレイアウトの整備**:
   - `.chitsuki` に対し `text-align: end` または `align-self: flex-end` 相当のスタイルを設定。
   - `.chiyose` に対し右寄せ（または縦書きで下寄席）のレイアウトを設定。
   - `.chitage-*` クラス（1〜10字上げ程度）に対して、下方向（縦書きなので `margin-top`）に文字数分の余白を追加する CSS スタイルを定義。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] `［＃地付き］` `［＃地寄せ］` `［＃地から○字上げ］` が消去されず、対応する下寄せ等の配置でレンダリングされること。
- [ ] `［＃ここから太字］` などのタグが `<strong>` 等に正しくパースされ、表示上で視覚的に強調されること。
- [ ] 静的解析（`npm run lint`）、型チェック、および既存のユニット・E2Eテストがすべて正常にパスすること。
- [ ] 独自に追加するレイアウトマークアップのパース機能を検証するための新規ユニットテストが追加・パスすること。
