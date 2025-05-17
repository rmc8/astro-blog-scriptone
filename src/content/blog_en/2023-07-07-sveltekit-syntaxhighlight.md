---
title: "Setting up Syntax Highlighting with SvelteKit and highlight.js"
slug: "sveltekit-syntaxhighlight"
description: "Set up syntax highlighting using SvelteKit and highlight.js. Scrape HTML and replace code blocks with pre-configured syntax highlighting."
date: 2023-07-07T11:32:25.200Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/highlightsyntax.webp"
draft: false
tags: ['JavaScript', 'highlight.js', 'SvelteKit']
categories: ['Programming']
---

In SvelteKit, we assign syntax highlighting to code blocks. I referred to the articles from MicroCMS that I used on the backend for blog construction.

## Installation

To set up syntax highlighting, install `highlight.js` and `cheerio` to extract code blocks from HTML.

```
npm install cheerio highlight.js
```


## +page.svelte

In the script tag of +page.svelte, write the following. Here, it's written in TypeScript.

```svelte
<script lang="ts">
import type { PageData } from './$types'; // To get article data from microCMS
import { load } from 'cheerio'; // Directly importing cheerio is not recommended; be careful with the name 'load' as it's common
import hljs from 'highlight.js';

export let data: PageData;

const cheerio$ = load(data.content); // Passing the article body from microCMS to load
cheerio$('pre code').each((_, elm) => {
    const result = hljs.highlightAuto(cheerio$(elm).text());  // Set syntax highlighting
    cheerio$(elm).html(result.value); // Replace with the highlighted code
    cheerio$(elm).addClass('hljs'); // Add hljs class
});
const article = cheerio$.html(); // Store the replaced HTML
export { article }; // Make it available for output in HTML
</script>
```

The value of the exported article can be output as HTML in +page.svelte using `{@html article}`. For CSS, you can import the one provided by highlight.js or write your own. The CSS currently set on this site as of July 2023 is as follows.

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

highlight.js uses hljs.highlightAuto to automatically detect the language and set syntax highlighting. There's no need to add or set languages individually, which makes the code shorter and easier to introduce. If you're having trouble setting up syntax highlighting or want an easy setup, please try it out.