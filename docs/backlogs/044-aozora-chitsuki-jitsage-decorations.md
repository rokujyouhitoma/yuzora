---
ID: 044
種別: Enhancement
優先度: Medium
ステータス: Approved
---

# [ENH] 青空文庫「地付き」「地寄せ」「地から○字上げ」レイアウトおよび装飾対応 (ID: 044)

## 1. 概要 / Summary
青空文庫の入力手引（[手引マニュアル](https://www.aozora.gr.jp/aozora-manual/index-input.html)）に基づき、作品内の署名、日付、または詩歌のレイアウトとして頻出する配置指定「地付き」「地寄せ」「地から○字上げ」、およびインライン修飾「太字」「斜体」のパースとレンダリング表示に対応します。
現在、パーサー層（[parser.js](src/js/modules/parser.js)）では未対応の注記マークアップは消去されるだけであり、レイアウト崩れや書式情報の喪失が発生しています。これを適切な HTML タグおよび CSS の縦書きレイアウトスタイルを用いて忠実に再現できるように改善します。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- **[parser.js](src/js/modules/parser.js)** (MODIFY):
  - 以下の青空文庫特有のマークアップ注記を正規表現で検出し、対応する HTML クラスまたはタグに置換します。
    - `［＃地付き］` -> `<p class="chitsuki">` (または `align-self: flex-end` 相当のクラス)
    - `［＃地寄せ］` -> `<p class="chiyose">`
    - `［＃地から([０-９0-9]+)字上げ］` -> `<p class="chitage-$1">` (またはインラインスタイルで動的マージン)
    - `［＃ここから太字］` 〜 `［＃ここで太字終わり］` -> `<strong class="aozora-bold">` 〜 `</strong>`
    - `［＃ここから斜体］` 〜 `［＃ここで斜体終わり］` -> `<em class="aozora-italic">` 〜 `</em>`
- **[base.css](src/css/modules/base.css) / [reader.css](src/css/modules/reader.css)** (MODIFY):
  - 下寄せ、右寄せ、および特定の文字幅分の下マージン（字上げ）を定義する縦書き専用 CSS クラス（`chitsuki`, `chiyose`, `chitage-*`）を実装します。

---

## 3. 実装方針 / Implementation Plan
Target Branch: `enhancement/044-aozora-chitsuki-jitsage-decorations`

1. **インライン装飾の正規表現追加** (`formatAozoraMarkup` 内):
   * `［＃ここから太字］(.+?)［＃ここで太字終わり］` 等の正規表現マッチングを実装します。
2. **配置配置 (地付き等) のパーサー対応**:
   * 行全体が配置注記で始まるか、または行末尾に含まれているかを検知し、段落生成用の `buildLineHTML` で適切な CSS クラスを追加して `<p>` タグを出力します。
   * 「地から○字上げ」については、全角数字を半角数字にパースした上で、`margin-top`（縦書きなので画面下部からの距離）を文字数（`rem` または `em`）に基づいて動的にインラインスタイルか専用のクラスで付与します。
3. **CSS 縦書きレイアウトの整備**:
   * `.chitsuki` や `.chiyose` クラスに対して、カラムの底（縦書きなので左下）へ寄せるための CSS ルール（例: `text-align: end` や `align-self: flex-end`）を設定します。

---

## 4. 完了条件 (DoD) / Acceptance Criteria
- [ ] 青空文庫ファイルに含まれる `［＃地付き］` などの配置注記が消去されず、対応する下寄せ等の配置でレンダリングされること。
- [ ] `［＃ここから太字］` などのインライン装飾タグが `<strong>` 等に正しくパースされ、表示上で視覚的に強調されること。
- [ ] 静的解析（`npm run lint`）、型チェック、および既存のユニット・E2Eテストがすべて正常にパスすること。
- [ ] 独自に追加するレイアウトマークアップのパース機能を検証するための新規ユニットテストが追加・パスすること。
