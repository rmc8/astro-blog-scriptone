# TODO リスト

## 優先度: 高

### 1. 言語ごとのRSSフィード作成

- **概要**: 各言語（日本語、英語、韓国語）のブログ記事用RSSフィードを生成
- **対象**: ブログ記事のみ（日記は対象外）
- **実装場所**: `src/pages/rss/[lang].xml.ts`
- **仕様**:
  - `/rss/ja.xml`, `/rss/en.xml`, `/rss/ko.xml` のエンドポイントを作成
  - 各言語のブログ記事を最新順で取得
  - RSS 2.0形式で出力
  - 記事数上限: 20記事程度

### 2. パンくずリストの作成

- **概要**: ブログページでのナビゲーション向上のためのパンくずリスト
- **構成**: ブログ（言語ごと）＞カテゴリー＞記事
- **実装場所**: `src/components/blog/Breadcrumb.astro`
- **表示位置**: 各ブログ記事ページのタイトル上部
- **仕様**:
  - ホーム > ブログ（言語名）> カテゴリー名 > 記事タイトル
  - 各階層はリンク化（最終階層の記事タイトルは除く）
  - 多言語対応

### 3. ブログのページング処理

- **概要**: タグ、カテゴリ、各言語ごとのブログ一覧ページにページング機能を追加
- **実装場所**:
  - `src/pages/blog/[lang]/page/[page].astro`
  - `src/pages/blog/[lang]/tags/[tag]/page/[page].astro`
  - `src/pages/blog/[lang]/categories/[category]/page/[page].astro`
- **仕様**:
  - 1ページあたり10記事表示（定数 `POSTS_PER_PAGE` で変更可能）
  - ナビゲーション:「新しいページ」「古いページ」の2リンクのみ
  - 最初のページと最後のページでは該当するリンクを非表示
- **実装コンポーネント**: `src/components/blog/Pagination.astro`

### 4. 日記のページング処理

- **概要**: 日記一覧ページにページング機能を追加
- **実装場所**: `src/pages/diary/page/[page].astro`
- **仕様**:
  - 1ページあたり10記事表示（定数 `DIARY_POSTS_PER_PAGE` で変更可能）
  - ナビゲーション:「新しいページ」「古いページ」の2リンクのみ
  - 最初のページと最後のページでは該当するリンクを非表示
- **実装コンポーネント**: `src/components/diary/DiaryPagination.astro`

### 5. 関連記事表示機能

- **概要**: 各ブログ記事の下部に関連記事を表示
- **実装場所**: `src/components/blog/RelatedPosts.astro`
- **仕様**:
  - 同じタグまたはカテゴリーの記事から6記事を選択
  - ビルド時にランダムに選択してSSGとして出力
  - 表示項目: タイトル、投稿日、アイキャッチ画像（小）
  - 現在の記事は除外
- **選択ロジック**:
  1. 同じカテゴリーの記事を優先
  2. 同じタグの記事を次に優先
  3. 不足分は同じ言語の他の記事から補完

## 優先度: 中

### 6. 検索機能

- **概要**: サイト内検索機能の実装
- **実装方法**: クライアントサイド検索（SSG環境を維持）
- **実装場所**:
  - `src/components/common/SearchBox.astro`
  - `src/pages/search.astro`
- **仕様**:
  - ビルド時に検索インデックスを生成（JSON形式）
  - JavaScript（Fuse.js等）を使用したあいまい検索
  - 検索対象: ブログ記事のタイトル、概要、タグ、カテゴリー
  - 言語ごとの検索結果表示

## 優先度: 低（将来実装予定）

### 7. Firebase連携 - コメント投稿機能

- **概要**: ブログ記事へのコメント投稿・表示機能
- **技術**: Firebase Firestore
- **実装場所**: `src/components/blog/Comments.astro`
- **仕様**:
  - 記事ごとのコメント表示・投稿
  - 簡易的なスパム対策
  - モデレーション機能（管理者承認制）

### 8. Firebase連携 - 問い合わせフォーム

- **概要**: 自前の問い合わせフォーム作成
- **技術**: Firebase Functions + Firestore
- **実装場所**: `src/pages/contact.astro`
- **仕様**:
  - 名前、メールアドレス、件名、本文の入力フォーム
  - Firebase Functionsでメール送信処理
  - 送信履歴をFirestoreに保存
  - reCAPTCHA等のスパム対策

## 技術的考慮事項

### 定数管理

- ページング関連の定数を `src/lib/constants.ts` で管理
- `POSTS_PER_PAGE = 10`
- `DIARY_POSTS_PER_PAGE = 10`
- `RELATED_POSTS_COUNT = 6`
- `RSS_POSTS_LIMIT = 20`

### パフォーマンス

- 関連記事の選択処理はビルド時に実行
- 検索インデックスの最適化
- 画像の遅延読み込み（関連記事のアイキャッチ）

### SEO対応

- ページング時のcanonicalタグ設定
- RSSフィードのサイトマップへの追加
- パンくずリストの構造化データ（JSON-LD）

### 多言語対応

- すべての新機能で多言語対応を考慮
- UIテキストの国際化（`src/i18n/ui.ts`への追加）
