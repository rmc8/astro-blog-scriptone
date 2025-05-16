---
title: "SvelteKit＋highlight.jsでシンタックスハイライトを設定する"
slug: "sveltekit-syntaxhighlight"
description: "SvelteKitとhighlight.jsを使ってシンタックスハイライトを設定します。HTMLをスクレイピングしてコードブロックをシンタックスハイライトが設定済みの状態に置換します。"
date: 2023-07-07T11:32:25.200Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/highlightsyntax.webp"
draft: false
tags: ['JavaScript', 'highlight.js', 'SvelteKit']
categories: ['Programming']
---

SvelteKitでコードブロックに対してシンタックスハイライトを割り当てていきます。ブログ構築の際にバックエンド側に使ったMicroCMSの記事を参考にしました。

## インストール

シンタックスハイライトを設定するために`highlight.js`、HTMLからコードブロックを抽出するために`cheerio`をインストールします。

``
npm install cheerio highlight.js
```


## +page.svelte

+page.svelteのscriptタグ内に下記を記述します。ここではTypeScriptで書いています。

```svelte
<script lang="ts">
 import type { PageData } from './$types'; // microCMSから記事データを取得するために書いております
 import { load } from 'cheerio'; // cheerioを直接importするのは非推奨、loadという名前も一般的なので注意する
 import hljs from 'highlight.js';

 export let data: PageData;

 const cheerio$ = load(data.content); // microCMSから記事の本文をloadに渡しています
 cheerio$('pre code').each((_, elm) => {
  const result = hljs.highlightAuto(cheerio$(elm).text());　// シンタックスハイライトを設定する
  cheerio$(elm).html(result.value); // 設定したコードに置換する
  cheerio$(elm).addClass('hljs'); // hljsクラスを追加する
 });
 const article = cheerio$.html(); // 置き換え済のHTMLを格納する
 export { article }; // HTMLに渡せる(出力できる)ようにする
</script>
```

exportしたarticleの値は、+page.svelteのHTML上で`{@html article}`とするとHTMLとして出力できます。CSSはhighlight.js側から提供されているものをimportするか自身で記述するとよいです。当サイトで2023年7月時点で設定しているCSSは下記のとおりです。

```css
pre {
    overflow-x: auto !important;
    background: #fffbee;
    color: #272822;
    border-radius: 5px;
}

code {
    padding: 16px;
}
pre,
code {
    font-family: "SourceHanCodeJP", monospace !important;
}
.hljs {
    display: block;
}

.hljs-number {
    color: #e400ff;
}

.hljs-title.function_ {
    color: #f55e00;
    font-weight: bold;
}

.hljs-keyword {
    color: #f92654;
    font-weight: bold;
    font-style: italic;
}

.hljs-params {
    color: #656700;
    font-weight: bold;
}

.hljs-string {
    color: #0f9900;
}
.hljs-meta {
    color: #007cce;
    font-weight: bold;
}
.hljs-constructor,
.hljs-literal {
    color: #ff4400;
    font-weight: bold;
}
.hljs-attr {
    color: #f92654;
    font-weight: bold;
}
.hljs-selector-tag {
    color: any;
}
.hljs-selector-class {
    color: any;
}
.hljs-attribute {
    color: any;
}

.hljs-comment,
.hljs-quote,
.hljs-variable {
    color: #008181;
}

.hljs-selector-tag,
.hljs-built_in,
.hljs-name,
.hljs-tag {
    color: #00f;
}

.hljs-section,
.hljs-literal,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-addition {
    color: #a31515;
}
.hljs-deletion,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-meta {
    color: #2b91af;
}
.hljs-doctag {
    color: #808080;
}
.hljs-attr {
    color: #f00;
}
.hljs-symbol,
.hljs-bullet,
.hljs-link {
    color: #00b0e8;
}
.hljs-emphasis {
    font-style: italic;
}
.hljs-strong {
    font-weight: bold;
}
```

highlight.jsではhljs.highlightAutoで言語を自動で判断してハイライトシンタックスを設定してくれます。個別に言語を追加したり設定したりする必要がないので、コードが少なく済み導入もしやすい点でメリットがあります。シンタックスハイライトの設定がうまくいかない場合や、簡単に設定をしたい場合にはぜひお試しいただけましたら幸いです。

