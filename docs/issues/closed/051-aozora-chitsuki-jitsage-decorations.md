---
ID: 051
種別: Enhancement
優先度: Medium
ステータス: Closed
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
- [ ] [parser.js](src/js/modules/parser.js) (パース正規表現の追加および配置タグ生成)
- [ ] [base.css](src/css/modules/base.css) (地付き・地寄せ、字上げ用の CSS 定義)
- [ ] [reader.css](src/css/modules/reader.css) (縦書きコンテキストでの配置調整)
- [ ] [app.test.js](tests/unit/app.test.js) (単体テストの追加)
- [ ] [DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md) (仕様の追記)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `enhancement/051-aozora-chitsuki-jitsage-decorations`

### 4.1. パーサーモジュール (`parser.js`) の拡張
1. **配置指定（地付き等）の検出**:
   - 行の最初または最後に含まれる配置指示をパースし、段落（`<p>`）に追加すべき CSS クラスを決定する `parseAlignment(line)` ヘルパー関数を定義します。
     - `［＃地付き］` -> クラス名 `chitsuki`
     - `［＃地寄せ］` -> クラス名 `chiyose`
     - `［＃地から([０-９0-9]+)字上げ］` -> クラス名 `chitage-$1` （全角数字は半角数字に変換して正規化します。例: `chitage-3`）
     - 抽出した注記テキスト（`［＃...］`）は行から除去します。
   - `parseAozoraText` 内のループにおいて、`parseAlignment` を呼び出して行ごとのアライメントクラスを取得し、`buildLineHTML` に渡す引数を拡張します。
2. **インライン装飾の対応 (`formatAozoraMarkup`)**:
   - ルビや傍点処理の後に、太字と斜体のブロック指定をパースする正規表現置換を追加します。
     - `［＃ここから太字］` 〜 `［＃ここで太字終わり］` -> `<strong class="aozora-bold">$1</strong>`
     - `［＃ここから斜体］` 〜 `［＃ここで斜体終わり］` -> `<em class="aozora-italic">$1</em>`

### 4.2. セキュリティ対策 (XSSの防止 - Defense in Depth)
- 脅威: 太字・斜体や配置タグの生成時に、悪意ある HTML インジェクションやスクリプト実行（XSS）が行われる可能性。
- 対策:
  - `parseAozoraText` の冒頭における一括 HTML エスケープ（`&`、`<`、`>` の置換）の**後**にのみ、安全な置換処理を実行します。
  - 生成するタグはホワイトリスト（`strong`, `em`, `p`）に適合するものに限定し、悪意あるアトリビュート（`onload` 等）は付与しません。
  - レンダラー層の `sanitizeDOM` による最終段のホワイトリストサニタイズ（二重の防壁）がそのまま機能するように実装します。

### 4.3. スタイル定義 (`base.css` / `reader.css`)
- 縦書き（`writing-mode: vertical-rl`）における配置クラスの実装：
  - `.chitsuki`: `text-align: end;` を指定し、下寄せにします。
  - `.chiyose`: `text-align: end;`（または特定方向への寄せ）を設定。
  - `.chitage-1` 〜 `.chitage-10`: 下側（縦書きの `margin-top` 方向）に文字数に応じた余白（`1em` 〜 `10em`）を追加します。
  - `.aozora-bold`: `font-weight: bold;` を指定。
  - `.aozora-italic`: `font-style: italic;`（縦書き時はブラウザにより斜体レンダリング）を指定。

### 4.4. 設計ドキュメントの更新
- **[DSN-02-low_level_design.md](../docs/DSN-02-low_level_design.md)**:
  - 3.2.1.2 「パーサーモジュール (Parser Module)」セクションに、新たにパース対象となった「地付き」「地寄せ」「地から○字上げ」「太字」「斜体」の変換仕様を追加します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] 青空文庫形式テキストに含まれる `［＃地付き］` などの配置マークアップが削除されず、正しいアライメントクラスが付与された HTML で出力されること。
- [ ] `［＃ここから太字］` などのタグが `<strong>` にパースされ、CSS で太字に装飾されること。
- [ ] 新規にパース処理の正当性を検証する単体テスト（ルビ、傍点、太字、斜体、地付き、地寄せ、字上げの複合ケース）が [app.test.js](tests/unit/app.test.js) に追加され、パスすること。
- [ ] 静的解析（`npm run lint`）、型チェック（`npm run test:types`）、すべてのテストが正常にパスすること。
- [ ] 実装変更と `DSN-02-low_level_design.md` の記述が完全に一致していること。


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
