---
title: implement-share-buttons-with-svelte
description: Svelteを使用して7つのSNS向け共有ボタンを実装する方法を解説。X、Bluesky、はてなブックマーク、Pocket、Threads、マストドン、Misskeyに対応したシンプルで軽量な共有機能の実装手順と各SNSの設定方法を詳細に紹介。
date: 2024-07-18T00:43:36.910Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/SharedButtons.webp
draft: false
tags: ['SNS', 'Svelte', 'TypeScript']
categories: ['Programming']
---

# 【Svelte】共有ボタンの実装

Svelteを使って7つのツール向けに共有ボタンを実装しました。

## なぜ実装したか

元々は共有ボタンは必要ないと思っていました。本サイトは非常に細々と更新しておりGoogle検索に引っかかるほどの優れたコンテンツが必要十分に揃っているわけではありません。そのために、あまり共有を重視しておらずサイトに訪れた物好きな方が快適に扱えるようにちょっとでも無駄を削ぐ気持ちで共有ボタンは作らずにいました。そもそもそのような状況の中でわざわざ手間をかけて実装するというのもあまり腹落ちしなかったというのが一番の理由なのかもしれません。

しかしながら、本サイトで公開しているスマートフォン向けのゲーム用に作ったwebツールが共有ボタンなどがないのにも関わらずX(Twitter）やDiscordの個人的なサーバーなどにありがたいことにご共有いただいている状況でそういうことであればボタンを作ることに多少の価値があると考えました。ボタンを作ることによりこのような共有したいと思っていただけるようなコンテンツを作ったり、サイトを役立てていただいたりなどの好循環が生まれるきっかけにもなり得ますので時期が来たと考え重い腰を上げて実装することとします。

## 使用するフレームワーク

本サイトはSvelteとSvelteKitで実装しているのでSvelteによる解説がメインです。ただ、SvelteはTypeScript, HTML, Styleの構成でモジュールが構成されており、ちょっとだけ独特なSvelteの構文が混ざりますがwebにおけるプログラミングに慣れていればそこそこ読みやすいと思います。そのほかには補助的にPostCSSを使っていますが、ボタンの実装をメインに解説します。

## 構成
```text
.
├── Share.svelte
└── img
    ├── bsky_share.webp
    ├── hatena_bookmark_share.webp
    ├── mastodon_share.webp
    ├── misskey_share.webp
    ├── pocket_share.webp
    ├── threads_share.webp
    └── x_share.webp
```

## コード
```svelte
<script lang="ts">
 import xIcon from './img/x_share.webp';
 import blueskyIcon from './img/bsky_share.webp';
 import hatenaBookmarkIcon from './img/hatena_bookmark_share.webp';
 import threadsIcon from './img/threads_share.webp';
 import misskeyIcon from './img/misskey_share.webp';
 import mastodonIcon from './img/mastodon_share.webp';
 import pocketIcon from './img/pocket_share.webp';

 export let share_title: string;
 export let share_url: string;

 const newline: string = encodeURIComponent('\r\n');
 const encodedTitle: string = encodeURIComponent(share_title);
 const encodedUrl: string = encodeURIComponent(share_url);

 const BLUESKY_BASE_URL: string = `https://bsky.app/intent/compose?text=${encodedTitle}${newline}${encodedUrl}`;
 const X_BASE_URL: string = `https://twitter.com/intent/tweet?text=${encodedTitle}${newline}&url=${encodedUrl}`;
 const HATENA_BASE_URL: string = `https://b.hatena.ne.jp/add?url=${encodedUrl}`;
 const THREADS_BASE_URL: string = `https://www.threads.net/intent/post?text=${encodedTitle}${newline}${encodedUrl}`;
 const MISSKEY_BASE_URL: string = `https://misskey-hub.net/share?text=${encodedTitle}&url=${encodedUrl}`;
 const MASTODON_BASE_URL: string = `https://donshare.net/share.html?text=${encodedTitle}${newline}${encodedUrl}`;
 const POCKET_BASE_URL: string = `https://getpocket.com/edit?url=${encodedUrl}&title=${encodedTitle}`;

 interface ShareIcon {
  url: string;
  icon: string;
  alt: string;
 }

 const shareIcons: ShareIcon[] = [
  { url: X_BASE_URL, icon: xIcon, alt: 'Share on X' },
  { url: BLUESKY_BASE_URL, icon: blueskyIcon, alt: 'Share on Bluesky' },
  { url: HATENA_BASE_URL, icon: hatenaBookmarkIcon, alt: 'Share on Hatena Bookmark' },
  { url: POCKET_BASE_URL, icon: pocketIcon, alt: 'Save to Pocket' },
  { url: THREADS_BASE_URL, icon: threadsIcon, alt: 'Share on Threads' },
  { url: MASTODON_BASE_URL, icon: mastodonIcon, alt: 'Share on Mastodon' },
  { url: MISSKEY_BASE_URL, icon: misskeyIcon, alt: 'Share on Misskey' }
 ];
</script>

<div class="share_block">
 <h2>Share</h2>
 <div class="share-icons-container">
  <div class="share-icons-scroll">
   {#each shareIcons as { url, icon, alt }}
    <a href={url} target="_blank" rel="noopener noreferrer" class="share-icon-link">
     <div class="share-icon-wrapper">
      <img src={icon} {alt} class="share-icon" />
     </div>
    </a>
   {/each}
  </div>
 </div>
</div>

<style lang="postcss">
 .share-icons-container {
  @apply relative w-full overflow-hidden mt-8 mb-8;
 }
 .share-icons-scroll {
  @apply flex space-x-4 overflow-x-auto pb-4 -mb-4;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
 }
 .share-icons-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
 }
 .share-icon-wrapper {
  @apply w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-[#0aadb9] hover:bg-[#089aa5] transition-all duration-300 ease-in-out;
 }
 .share-icon {
  @apply w-6 h-6 object-contain transition-transform duration-300 ease-in-out;
  filter: brightness(0) invert(1) brightness(1.2);
 }
 .share-icon-link:hover .share-icon {
  @apply transform scale-110;
 }
 @media (max-width: 640px) {
  .share-icon-wrapper {
   @apply w-10 h-10;
  }
  .share-icon {
   @apply w-5 h-5;
  }
 }
</style>
```

## 解説

### TypeScript

最初のimport文ではimgフォルダー内にある画像をSvelteの中に読み込んでいます。importすることでimgタグ用の画像のパスを取得できる仕組みです。exportは関数で例えると引数であり、外部からページのタイトルとページのURLをstring型で受け取るような構成です。受け取った文字列はURLとして厚けるようにencodeURIComponent関数に渡して特殊な文字列などのエンコードを行います。そのほか、XやBluesky向けに投稿のテキスト内に改行を含めるため改行用の文字列をエンコードしています。

その後、HTTPリクエストで各プラットフォームでの共有が行える書式でURLを作ります。こちらは個別に後述にて解説します。その後、URL, ICONのパス, 代替テキストを含むオブジェクトのリスト（shareIcons）を作り共有用のデータの準備が完了となります。

### HTML

HTMLではリンクを含むアイコンを実際に表示させる処理をしています。少し独特なSvelte構文がありますが、for each文のようなものを使ってshareIconsを順番に読みだして、SNSのリンク・アイコン・画像の代替テキストを定義しています。

### CSS

CSSでは主にレイアウトやイメージカラーの設定、画像を白くさせる処理をしています。これによりターコイズのような円の中に各SNSのアイコンが白く表示される状態となります。

## 呼び出し方

`import Share from 'Share.svelteのパス';`のような形式で作ったモジュールを呼び出します。その後、`<Share share_title={title} share_url={currentUrl} />`の形式で値を渡すことにより各ページごとの共有ボタンが自動で作られます。Svelteであれば以下のようなコードを書くことでそのページのURLを取得できます。

```svelte
import { page } from '$app/stores';
$: currentUrl = $page.url.href;
```

## 各SNSのURLの設定方法

今回以下の7つのSNSなどを対象に共有ボタンを作りました。

* X(Twitter)
* Bluesky
* はてなブックマーク
* Pocket
* Threads
* マストドン
* Misskey

### X(Twitter)

Xは`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`の形式で動作します。ドメインをXにしたり、tweetの箇所をpostに変えたりするとWebブラウザでは動いてもスマートフォン版のアプリで動かないなど不便が生じる可能性があります。まだ、移行の段階ですので実際の動作に合わせてリンクを設定できると良いですが、2024年7月時点ではこの書式で大丈夫です。

### Bluesky

Blueskyはもう少しシンプルで `https://bsky.app/intent/compose?text=${encodedText}`の形式で動きます。ただし、Blueskyは発展途上でありアプリ版についてこのリンクでは動作が不完全です。うまく動いたり動かなかったりすることがあり現時点ではユーザー側では何かできることも多くはないと思います。一方でweb版に限ればこれで問題なく動作します。この書式だと`bsky.app`のみの動作となりますのでセルフホスティングなどの場合には別の仕組みが必要となります。

### はてなブックマーク

はてなブックマークは`https://b.hatena.ne.jp/add?url=${encodedUrl}`の書式で動きます。addの箇所をentryに変えても動きますが、addの方が早くブックマークの画面に遷移するので扱いやすそうな気がしています。

### Pocket

Pocketは`https://getpocket.com/edit?url=${encodedUrl}&title=${encodedTitle}`の形式で動きます。リンクをクリックするとすぐにストックされるような動作をします。

### Threads

Threadsは `https://www.threads.net/intent/post?text=${encodedText}`の形式で動きます。マストドンと同じActivityPubが採用されているSNSですがThreadsに直接投稿するのであればこれでシンプルに対応できます。

### マストドン

マストドンは `https://donshare.net/share.html?text=${encodedText}`で対応できます。さまざまなインスタンスがありますが共有用のハブとなるサービスを活用することでマストドンへの共有も対応しやすくなります。

### Misskey

Misskeyもマストドンと同様に多様なインスタンスがありますので間にハブをかませます。`https://misskey-hub.net/share?text=${encodedTitle}&url=${encodedUrl}`の形式でURLを作ることで共有用のテキストを作りリンク先で共有先のインスタンスを設定して実際の共有が行われます。

## まとめ

Svelteで共有用のボタンを作ると100行未満の非常に少ないコードで多数のサービスへの共有ボタンを手軽に実装できます。webページを訪れる方にとってもサイトを活用したい方にとっても非常に有用な機能だと思います。コードも単にリンク付き画像を作るのみの機能なのでSvelteであれば非常に軽量で便利な機能となるかと思います。ページの共有機能を組みたい方の参考になりましたら幸いです。

