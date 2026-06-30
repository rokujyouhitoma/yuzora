---
ID: 029
種別: Refactor
優先度: Medium
ステータス: Approved
---

# [REFACTOR] クラス設計の統合とすべての状態・プロパティのカプセル化 (ID: 029)

## 1. 概要 / Summary
現在、Yuzoraは `Locator` パターンと `AppState` クラスを利用して状態管理を行っていますが、一部にレガシーなプロキシプロパティ（`window.currentFileName` 等）や、DOM要素へのアドホックな参照、およびグローバルスコープに近い位置で保持されている変数・参照が存在しています。

本リファクタリングでは、クラス設計（オブジェクトの設計およびその関係性）を徹底的に見直し、**「すべてのプロパティおよび状態は、明確な役割を持つ何らかのオブジェクト/クラスに属する」** 設計を完成させます。

これにより、グローバルなフットプリント（状態の隠れた依存関係）を完全に排除し、各モジュール（UI、Viewer、Parser、Diagnostics）がどのオブジェクトを所有または参照しているかの関係性をクリアにし、Closure Compilerの `ADVANCED_OPTIMIZATIONS` 環境下における型安全と難読化の整合性を極限まで高めます。

---

## 2. 影響範囲と関連ファイル / Scope and Affected Files
- [MODIFY] [config.js](../../src/js/modules/config.js) (AppStateクラスの再設計、およびドメインモデルクラス群の新設)
- [MODIFY] [locator.js](../../src/js/modules/locator.js) (Locatorへの新規モデルクラス登録)
- [MODIFY] [ui.js](../../src/js/modules/ui.js) (レガシープロキシ（`currentFileName` 等）へのアクセスをクラスプロパティアクセスへ完全移行)
- [MODIFY] [viewer.js](../../src/js/modules/viewer.js) (同上)
- [MODIFY] [commands.js](../../src/js/modules/commands.js) (同上)
- [MODIFY] [tools/externs.js](../../tools/externs.js) (新規クラス用のextern定義の追加・プロキシ定義の削除)

---

## 3. 要件と設計案 / Requirements & Tentative Class Diagram

### 3.1 クラス関係図 (Class Relationships)

各役割に応じたドメインクラス群を定義し、Locatorを介して依存解決を行います。

```mermaid
classDiagram
    direction TB
    class Yuzora {
        +locator: Locator
        +boot()
        +parseAozoraText(text: string) string
        +parseAozoraHTML(html: string) string
        +runLayoutDiagnosis()
    }
    class Locator {
        +register(Class, instance)
        +resolve(Class) instance
        +locate(Class) instance
    }
    class AppState {
        +welcomeScreen: HTMLElement
        +readerScreen: HTMLElement
        +readerViewport: HTMLElement
        +readerContent: HTMLElement
        +bookTitle: HTMLElement
        ... (DOM要素参照)
        +headerTimeout: number
        +settingsDrawerOpen: boolean
        +tocDrawerOpen: boolean
    }
    class BookModel {
        +title: string
        +content: string
        +type: string ("txt"|"html")
        +totalPages: number
        +currentPage: number
        +toc: Array
        +isEmpty() boolean
        +clear()
    }
    class ConfigModel {
        +theme: string
        +font: string
        +size: string
        +lh: string
        +spacing: string
        +direction: string ("rtl"|"ltr")
        +load()
        +save()
        +apply()
    }
    class BookmarkModel {
        +bookmarkProgress: number
        +save(fileName: string, progress: number)
        +load(fileName: string) number
        +clear()
    }
    class CommandManagerClass {
        +commandHistory: Array
        +commandIndex: number
        +isReplaying: boolean
        +execute(command)
        +undo()
        +redo()
    }
    class YuzoraEventTarget {
        +listeners_: Object
        +addEventListener(type, listener)
        +removeEventListener(type, listener)
        +dispatchEvent(event)
    }

    Yuzora --> Locator : 所有・利用
    Locator --> AppState : 管理・解決
    Locator --> BookModel : 管理・解決
    Locator --> ConfigModel : 管理・解決
    Locator --> BookmarkModel : 管理・解決
    Locator --> CommandManagerClass : 管理・解決
    Locator --> YuzoraEventTarget : 管理・解決
```

### 3.2 各クラスの責務定義 (Class Responsibilities)

各ドメインオブジェクトが担う具体的な責務とカプセル化対象のプロパティは以下の通りです。

| クラス名 | 主な責務・役割 | 保持するプロパティ・状態 |
| :--- | :--- | :--- |
| **`Yuzora`** | **「アプリケーションの統括・エントリーポイント」**<br>アプリケーション全体の起動・ライフサイクル管理、各種主要シングルトン・モデルの初期化（`boot()`）、および外部公開用のパースAPIやレイアウト診断等のファサードAPIの提供を担う。 | `locator` (Locatorインスタンスの参照) |
| **`Locator`** | **「依存性注入・サービス解決」**<br>各モジュールが必要とするシングルトンクラスやモデルインスタンスの登録・解決を一元管理し、モジュール間の参照結合を最小限に抑える。 | `registry` (クラス名とインスタンスのマップ) |
| **`AppState`** | **「View・DOM操作の仲介」**<br>HTML要素（DOMツリー）への実体参照、およびUIのレイアウトに依存する一時的・物理的な表示状態（ドロワーやメニューの開閉状態、非表示用タイマー等）のみを保持する。 | `welcomeScreen`, `readerScreen`, `readerViewport`, `readerContent`, `bookTitle` 等のDOM参照、`headerTimeout` (タイマーID)、`settingsDrawerOpen` / `tocDrawerOpen` (開閉フラグ) |
| **`BookModel`** | **「書籍データ・メタデータのカプセル化」**<br>現在ロードされている書籍（テキストまたはHTML）のデータとメタデータ、パース結果（大中小見出し・目次ツリー）、スクロールリフローによって算出された全ページ数等の「本そのもの」のドメイン状態を保持する。 | `title` (作品名), `content` (生テキスト), `type` (`txt` / `html`), `totalPages` (総ページ数), `currentPage` (現在表示ページ), `toc` (見出しデータ配列) |
| **`ConfigModel`** | **「表示設定の永続化と適用」**<br>ユーザーのテーマ、フォント書体、文字サイズ、行間、文字送り設定、読書方向（RTL/LTR）などの設定値を保持し、LocalStorageへの保存・復元、およびCSSカスタムプロパティ（CSS変数）へのクラス変更適用を担う。 | `theme`, `font`, `size`, `lh`, `spacing`, `direction` |
| **`BookmarkModel`** | **「読了位置（座標）の記録・追跡」**<br>アクティブな書籍に対する進行割合座標（`bookmarkProgress` 0.0〜1.0）を監視し、LocalStorage上の `bookmark_<fileName>` キーと同期する。 | `bookmarkProgress` (0.0 〜 1.0 の実数) |
| **`CommandManagerClass`**| **「操作履歴の蓄積と再現制御」**<br>実行された全コマンドオブジェクトの履歴管理、Undo/Redoスタックの制御、およびデバッグパネルからインポートされたJSON履歴データの非同期インターバル自動再生（リプレイ）を制御する。 | `commandHistory` (履歴配列), `commandIndex` (再生インデックス位置), `isReplaying` (自動リプレイ実行中フラグ) |
| **`YuzoraEventTarget`** | **「疎結合なメッセージ伝播バス」**<br>W3C EventTarget 仕様に準拠し、任意のモジュール（UI、Viewer等）からのドメインイベント配信要求をリスナー群へ通知・仲介する。 | `listeners_` (イベントリスナーの登録マップ) |

### 3.3 移行手順 (Migration Steps)

1. **クラス定義の新設 (`config.js`)**:
   - `BookModel`, `ConfigModel`, `BookmarkModel` クラスを定義。
   - `AppState` から DOM 以外の状態（`currentFileName`, `bookmarkProgress`, `config` 等）をこれらの新規クラスへと切り出す。
   
2. **Locatorへの登録**:
   - アプリ起動初期段階で、新設されたモデルクラス群をLocatorへ登録。

3. **参照コードの書き換え**:
   - `commands.js`, `viewer.js`, `ui.js` において、`window.currentFileName` や `state.config` を直接参照している箇所を以下のように書き換える：
     - `window.currentFileName` ➔ `locator.resolve(BookModel).title`
     - `state.config.theme` ➔ `locator.resolve(ConfigModel).theme`
     - `state.bookmarkProgress` ➔ `locator.resolve(BookmarkModel).bookmarkProgress`

4. **レガシープロキシの完全削除**:
   - 互換性のために `config.js` 末尾に定義されていた `Object.defineProperty` プロキシゲッター/セッターをすべて削除する。これでグローバル名前空間が100%クリーンになる。

5. **externsの整理**:
   - `tools/externs.js` からプロキシ用プロパティ定義を削除し、新規クラス用のインターフェース定義を追加。

---

## 4. 完了条件 / Success Criteria (DoD)
- [ ] すべてのグローバル変数・プロキシプロパティ（`window.currentFileName` 等）が完全に削除され、読み込み・書き込みともにLocator解決モデルに移行していること。
- [ ] リファクタリング適用後、`make clean && make` が警告無しでビルド完了し、アドバンスドコンパイルによる名前衝突やリネーム不具合が一切発生しないこと。
- [ ] すべてのユニットテストおよびE2Eテストが正常にパスし、書籍ロード・しおり保存復元・表示設定変更がデグレードなく機能すること。
