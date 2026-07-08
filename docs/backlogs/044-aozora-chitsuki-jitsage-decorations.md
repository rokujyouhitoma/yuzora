---
ID: 044
種別: Enhancement
優先度: Medium
ステータス: Draft
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
    - `［＃地から○字上げ］` -> `<p class="chitage-○">`
    - `［＃ここから太字］` 〜 `［＃ここで太字終わり］` -> `<strong class="aozora-bold">` 〜 `</strong>`
    - `［＃ここから斜体］` 〜 `［＃ここで斜体終わり］` -> `<em class="aozora-italic">` 〜 `</em>`
- **[base.css](src/css/modules/base.css) / [reader.css](src/css/modules/reader.css)** (MODIFY):
  - 下寄せ、右寄せ、特定の文字幅分の下マージン（字上げ）を定義する縦書き専用 CSS クラス（`chitsuki`, `chiyose`, `chitage-*`）を実装します。
