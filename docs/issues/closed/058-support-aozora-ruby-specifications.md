---
ID: 058
種別: Feature
優先度: High
ステータス: Closed
---

# [FEAT] 青空文庫ルビ仕様への準拠 (ID: 058)

## 1. 概要 / Summary
青空文庫の入力記述形式（注記仕様）におけるルビ表現を、パーサーで完全かつ正確に解釈しHTML（`<ruby>`タグ）にレンダリングする機能を実装します。

本機能は、クライアントサイド完全サーバーレス処理という [MNG-00](../docs/MNG-00-development_philosophy.md) のコア原則に沿って、ブラウザ上のJavascriptによる構文解析パイプラインの一部として動作します。

---

## 2. トレーサビリティ / Traceability
- 関連要求 (URD): URD-01
- 関連要件 (SRD): SRD-01
- 提案バックログ: [Backlog 051](../backlogs/closed/051-support-aozora-ruby-specifications.md)

---

## 3. 影響範囲と関連ファイル / Scope and Affected Files
- [ ] [parser.js](../../src/js/modules/parser.js) (`tokenizeInline()` 内のルビ抽出ロジックの拡張)
- [ ] [parser.test.js](../../tests/unit/parser.test.js) (各種ルビバリエーションに対する単体テストの追加)
- [ ] [DSN-02-low_level_design.md](../DSN-02-low_level_design.md) (詳細設計の更新)

---

## 4. 実装方針 / Implementation Plan
Target Branch: `feat/058-support-aozora-ruby-specifications`

1. **自動ルビ判定用正規表現の拡張**:
   - `src/js/modules/parser.js` 内の `tokenizeInline()` における漢字・繰り返し記号のマッチング処理を拡張します。
   - 既存の文字クラス `[一-龠々〆ヶ]+` を拡張し、`仝`, `〇` および外字注記で表現する二の字点 `※［＃二の字点、面区点番号1-2-22］` に対応させます。
   - また、アルファベットの単語に対する自動ルビ（`[A-Za-z]+`）も同時にマッチ可能な正規表現にアップデートします。
   - 正規表現例:
     `^(([一-龠々仝〆〇ヶ]|※［＃二の字点、面区点番号1-2-22］)+|[A-Za-z]+)《([^》]+)》`
2. **`｜` または `|` によるグループルビ・カタカナ・混在境界処理の維持・確認**:
   - `tokenizeInline()` 内の `｜`/`|` 開始判定が、アルファベット句の間にスペースがある場合や、釜右ヱ門のようにカタカナ・混在文字が含まれる場合も正しく `《` までの全テキストをルビ対象（`value`）として切り出すことを確認し、適合しないケースは単体テストで検出できるようにします。
3. **詳細設計仕様（DSN-02）の更新**:
   - `docs/DSN-02-low_level_design.md` のトークナイザー解説に、拡張されたルビ判定定義を追記します。

---

## 5. 完了条件 / Success Criteria (DoD)
- [ ] **々・仝・〆・〇・ヶ自動ルビ**:
  - `すると稍々《やや》度を失った` -> `value: '稍々'`, `rt: 'やや'`
  - `仝《どう》` -> `value: '仝'`, `rt: 'どう'`
  - `〆《しめ》` -> `value: '〆'`, `rt: 'しめ'`
  - `〇《れい》` -> `value: '〇'`, `rt: 'れい'`
  - `ヶ《こ》` -> `value: 'ヶ'`, `rt: 'こ'`
  が `｜` なしで自動判定・トークン化されること。
- [ ] **二の字点自動ルビ**:
  - `益※［＃二の字点、面区点番号1-2-22］《ますます》` -> `value: '益※［＃二の字点、面区点番号1-2-22］'`, `rt: 'ますます'`
  が `｜` なしで自動判定されること。
- [ ] **アルファベット単語自動ルビ**:
  - `Fanatiker《ファナチイケル》` -> `value: 'Fanatiker'`, `rt: 'ファナチイケル'`
  が `｜` なしで自動判定されること。
- [ ] **グループルビ・混在文字ルビ**:
  - `｜Au revoir《さらば》` -> `value: 'Au revoir'`, `rt: 'さらば'`
  - `｜釜右ヱ門《かまえもん》` -> `value: '釜右ヱ門'`, `rt: 'かまえもん'`
  が `｜` をトリガーに正しく抽出され、前後のスペースが適切に保持されること。
- [ ] すべての新規テストが `tests/unit/parser.test.js` に追加され、`npm run test:unit` が正常にパスすること。
- [ ] 本実装の内容が [DSN-01](../docs/DSN-01-high_level_design.md) および [DSN-02](../docs/DSN-02-low_level_design.md) の設計仕様と完全に一致していること（デッドドキュメントがないこと）。
- [ ] すべてのE2Eテスト (`npm run test:e2e`) が正常にパスすること。

