---
title: Setting up Syntax Highlighting with SvelteKit and highlight.js
slug: sveltekit-syntaxhighlight
description: Set up syntax highlighting using SvelteKit and highlight.js. Scrape HTML to replace code blocks with pre-configured syntax highlighting.
date: 2023-07-07T11:32:25.200Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/highlightsyntax.webp
draft: false
tags: ['JavaScript', 'highlight.js', 'SvelteKit']
categories: ['Programming']
---

# Setting up Syntax Highlighting with SvelteKit and highlight.js

In SvelteKit, we assign syntax highlighting to code blocks. This is based on an article from MicroCMS that I used for blog setup.

## Installation

To set up syntax highlighting, install `highlight.js` for the highlighting and `cheerio` to extract code blocks from HTML.

```
npm install cheerio highlight.js
```


## +page.svelte

In the script tag of +page.svelte, add the following code. This is written in TypeScript.

```svelte
<script lang="ts">
import type { PageData } from './$types'; // This is for fetching article data from microCMS
import { load } from 'cheerio'; // Directly importing cheerio is not recommended; be cautious with the name 'load'
import hljs from 'highlight.js';

export let data: PageData;

const cheerio$ = load(data.content); // Passing the article body from microCMS to load
const cheerio$('pre code').each((_, elm) => {
  const result = hljs.highlightAuto(cheerio$(elm).text()); // Set syntax highlighting
  cheerio$(elm).html(result.value); // Replace with the highlighted code
  cheerio$(elm).addClass('hljs'); // Add the hljs class
});
const article = cheerio$.html(); // Store the replaced HTML
export { article }; // Make it available for output in HTML
</script>
```

The exported `article` value can be output as HTML in +page.svelte using `{@html article}`. For CSS, you can import the one provided by highlight.js or write your own. The CSS currently set on this site as of July 2023 is as follows:

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

With highlight.js, `hljs.highlightAuto` automatically detects the language and sets the syntax highlighting. This means you don't need to add or configure languages individually, making it simple and easy to implement with less code. If you're having trouble with syntax highlighting or want a straightforward setup, please give it a try.