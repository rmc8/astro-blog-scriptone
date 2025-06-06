# Webシステム仕様書

## 1. ページ構造 (`src/pages`)

### 1.1. 404.astro

- **概要**: ユーザーが存在しないページにアクセスした際に表示されるエラーページ。
- **機能**:
  - "404 Not Found" のタイトルを表示。
  - ホームページへのリンクを提供。
  - ブログの言語リスト（`BlogLangList` コンポーネント）を表示し、ブログセクションへのナビゲーションを促す。
- **使用コンポーネント**: `Layout`、`BlogLangList`

### 1.2. [slug].astro

- **概要**: 動的なルーティングを処理するためのページ。主にブログ記事へのリダイレクトを管理。
- **機能**:
  - `getStaticPaths` を使用して、`blog_ja` コレクションからすべての日本語ブログ記事のスラッグを取得。
  - 既存の固定ページ（`about`、`privacy_policy`、`project_sekai`、`diary`、`api`、`index`、`404`、`sitemap.xml`、`blog`）と重複しないスラッグに対して、`/blog/ja/[slug]` への301リダイレクト（恒久的な移動）を実行。
  - 上記の条件に合致しない、またはスラッグが存在しない場合は `/404` への302リダイレクト（一時的な移動）を実行。
- **備考**: Astroのコンテンツコレクションと動的ルーティングを活用している。

### 1.3. index.astro

- **概要**: Webサイトのトップページ。
- **機能**:
  - 自己紹介セクション（`Me` コンポーネント）を表示。
  - ブログの言語リスト（`BlogLangs` コンポーネント）を表示。
  - コンテンツリスト（`Contents` コンポーネント）を表示。
- **使用コンポーネント**: `Base`、`Me`、`BlogLangs`、`Contents`
- **スタイル**: リンクのアンダーライン表示とホバー時の非表示、リストのパディングとマージンを定義。

### 1.4. sitemap.xml.ts

- **概要**: 検索エンジン最適化（SEO）のためにサイトマップ（sitemap.xml）を動的に生成するスクリプト。
- **機能**:
  - `getCollection` を使用して、`blog_ja`、`blog_en`、`blog_ko` の各言語のブログ記事を取得（ドラフト記事は除外）。
  - 各ブログ記事のURL、最終更新日、更新頻度、優先度を設定。
  - ブログ記事だけでなく、タグ、カテゴリ、アーカイブの各一覧ページ、および各言語のブログトップページのURLもサイトマップに含める。
  - 固定ページ（`about`、`privacy_policy`、`project_sekai` およびそのサブページ）のURLもサイトマップに含める。
  - 生成されたURLをアルファベット順にソート。
  - XML形式でサイトマップを出力し、適切なHTTPヘッダー（`Content-Type: application/xml`、`Cache-Control: public, max-age=3600`）を設定。
- **データ構造**: `SitemapEntry`（URL、changefreq、priority、lastmod）、`BlogPost`（id、data、body、collection、slug、render）を定義。

### 1.5. blog/index.astro

- **概要**: ブログセクションのトップページ。
- **機能**:
  - "Blog" のタイトルを表示。
  - ブログの言語リスト（`BlogLangList` コンポーネント）を表示。
  - ホームページへのリンクを提供。
- **使用コンポーネント**: `Layout`、`BlogLangList`

### 1.6. about/index.astro

- **概要**: サイトに関する情報を提供するページ。
- **機能**:
  - `_content.md` というマークダウンファイルからコンテンツを読み込み、表示。
- **使用コンポーネント**: `Layout`
- **スタイル**: `h2` 見出しと `code` 要素のグローバルスタイルを定義。

### 1.7. その他のページディレクトリ

- `about/`: サイトに関する情報。
- `api/`: API関連の機能。
- `blog/`: ブログ記事。
- `diary/`: 日記記事。
- `privacy_policy/`: プライバシーポリシー。
- `project_sekai/`: プロジェクトセカイ関連のコンテンツ（イベント計算ツールなど）。

### 1.8. blog/en/[slug].astro, blog/ja/[slug].astro, blog/ko/[slug].astro

- **概要**: 各言語のブログ記事ページ。
- **機能**:
  - 特定のブログ記事を表示。
  - 記事のタイトル、内容、日付などを表示。
- **使用コンポーネント**: `Layout`、`Article`

### 1.9. blog/en/archives/[archive].astro, blog/ja/archives/[archive].astro, blog/ko/archives/[archive].astro

- **概要**: 各言語のブログアーカイブページ。
- **機能**:
  - 指定されたアーカイブ（例: 年月）のブログ記事一覧を表示。
- **使用コンポーネント**: `Layout`、`BlogList`

### 1.10. blog/en/categories/[category].astro, blog/ja/categories/[category].astro, blog/ko/categories/[category].astro

- **概要**: 各言語のカテゴリ別ブログページ。
- **機能**:
  - 指定されたカテゴリのブログ記事一覧を表示。
- **使用コンポーネント**: `Layout`、`BlogList`

### 1.11. blog/en/tags/[tag].astro, blog/ja/tags/[tag].astro, blog/ko/tags/[tag].astro

- **概要**: 各言語のタグ別ブログページ。
- **機能**:
  - 指定されたタグのブログ記事一覧を表示。
- **使用コンポーネント**: `Layout`、`BlogList`

### 1.12. diary/[slug].astro

- **概要**: 日記記事ページ。
- **機能**:
  - 特定の日記記事を表示。
- **使用コンポーネント**: `Layout`、`Article`

### 1.13. project_sekai/event_point_calculator/index.astro

- **概要**: プロジェクトセカイのイベントポイント計算ツールページ。
- **機能**:
  - イベントポイントを計算するためのインタラクティブなツールを提供。
- **使用コンポーネント**: `Layout`、`Tools`

### 1.14. project_sekai/simple_efficiency_table_for_prsk_music/index.astro

- **概要**: プロジェクトセカイの音楽効率テーブルページ。
- **機能**:
  - 音楽の効率を表形式で表示。
- **使用コンポーネント**: `Layout`、`Profile`

## 2. コンポーネント構造 (`src/components/`)

### 2.1. blog/

- **概要**: ブログ記事の表示と関連機能のためのコンポーネント群。
- **主要コンポーネント**:
  - **Article.astro**:
    - **機能**: 個々のブログ記事の内容を表示。タイトル、投稿日、更新日、カテゴリ、タグ、アイキャッチ画像、目次、記事本文を含む。
    - **プロパティ**: `singleBlog`（記事データ）、`LANG_CODE`（言語コード）、`headings`（見出しデータ）
    - **使用コンポーネント**: `Image`（astro:assets）、`PostDate`、`UpdatedDate`、`CategoryTag`、`ToC`
    - **スタイル**: 記事本文内のリンク、見出し（`h1`〜`h6`）、コードブロック、画像、リスト、テーブルなど、詳細なスタイルが定義されており、読みやすさと視覚的な一貫性を確保している。

### 2.2. common/

- **概要**: サイト全体で共通して使用されるUI要素のためのコンポーネント群。
- **主要コンポーネント**:
  - **Header.astro**:
    - **機能**: サイトのヘッダー部分。サイトロゴ、サイト名（"Scriptone"）、言語選択（`LanguagePicker` コンポーネント）、主要なナビゲーションリンク (BLOG, ABOUT) を含む。
    - **配置**: ページ上部に固定表示（`fixed top-0`）。
    - **スタイル**: 背景色、シャドウ、パディング、フォントサイズ（モバイル対応）を定義。
    - **使用コンポーネント**: `LanguagePicker`

### 2.3. diary/

- **概要**: 日記記事の表示と関連機能のためのコンポーネント群。
- **主要コンポーネント**: `Article.astro`、`DiaryList.astro`、`PostDate.astro`、`PostTitle.astro`、`UpdatedDate.astro`、`EyecatchSmall.astro` など。日記記事の表示を詳細にカバー。

### 2.4. home/

- **概要**: トップページ専用のコンポーネント群。
- **主要コンポーネント**: `Me.astro`（自己紹介セクション）、`Contents.astro`（コンテンツリスト表示）、`Skills.astro`（スキル一覧表示）、`SNSLink.astro` など。トップページの要素を明確に記述。

### 2.5. i18n/

- **概要**: 国際化（i18n）機能のためのコンポーネント群。
- **主要コンポーネント**: `LanguagePicker.astro`（言語選択ドロップダウン）。
- **ユーティリティ**: `utils.ts`（URLから言語コードを取得する関数 `getLangFromUrl`）。国際化機能を強化。追加のi18n関連コンポーネントを考慮。

### 2.6. prsk/

- **概要**: プロジェクトセカイ関連のコンテンツのためのコンポーネント群。
- **主要コンポーネント**: `Profile.astro`（プロフィール表示）、`Tools.astro`（ツール表示）、`EventPointCalculator.astro` など。プロジェクトセカイ関連の機能を詳細に記述。

## 3. 全体的な機能と特徴

- **多言語対応**: ブログコンテンツは日本語、英語、韓国語で提供され、ヘッダーの言語ピッカーを通じて切り替えが可能。サイトマップも多言語コンテンツを網羅。
- **動的コンテンツ管理**: Astroのコンテンツコレクション（`blog_ja`、`blog_en`、`blog_ko`）を利用してブログ記事を管理。
- **SEO最適化**: 動的なサイトマップ生成（`sitemap.xml.ts`）により、検索エンジンによるサイトのクロールとインデックスを促進。
- **コンポーネントベースの設計**: Astroコンポーネントを多用し、UIの再利用性、保守性、拡張性を高めている。
- **レスポンシブデザイン**: CSS（`@media` クエリ）を使用して、異なる画面サイズやデバイスでの表示を最適化。
- **統一されたスタイル**: グローバルCSS（`src/styles/global.css`、`src/styles/font.css`）とコンポーネントごとのスタイル（`style is:global`）を組み合わせて、サイト全体で一貫したデザインを維持。
- **コンテンツの表現力**: Markdownファイル（`_content.md`）やAstroコンポーネント内でリッチなテキスト、画像、コードブロックなどを柔軟に表現できる。
