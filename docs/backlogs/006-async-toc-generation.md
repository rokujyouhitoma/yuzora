---
ID: 006
種別: Enhancement
優先度: Low
ステータス: Draft
---

# [ENH] 非同期処理による目次抽出および描画の高速化 (ID: 006)

## 1. 概要 / Summary
大容量の青空文庫テキストを読み込む際、本文のパースおよび初期レンダリングを最優先で完了させ、アプリ全体の体感表示速度（Time to Interactive）を高速化します。そのために、目次（TOC）データの抽出およびドロワー表示コンテンツの動的生成を非同期処理（Web Worker、`requestIdleCallback`、または `setTimeout` 等を用いた非ブロッキング処理）へ移行する設計・開発を行います。
