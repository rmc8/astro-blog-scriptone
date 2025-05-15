---
title: SvelteKit＋highlight.js로 구문 강조를 설정하는 방법
slug: sveltekit-syntaxhighlight
description: SvelteKit과 highlight.js를 사용하여 구문 강조를 설정합니다. HTML을 스크래핑하여 코드 블록을 구문 강조가 설정된 상태로 대체합니다.
date: 2023-07-07T11:32:25.200Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/highlightsyntax.webp
draft: false
tags: ['JavaScript', 'highlight.js', 'SvelteKit']
categories: ['Programming']
---

# SvelteKit＋highlight.js로 구문 강조를 설정하는 방법

SvelteKit에서 코드 블록에 구문 강조를 할당합니다. 블로그 구축 시 백엔드에서 사용한 MicroCMS의 기사를 참고했습니다.

## 설치

구문 강조를 설정하기 위해 `highlight.js`를 사용하고, HTML에서 코드 블록을 추출하기 위해 `cheerio`를 설치합니다.

```
npm install cheerio highlight.js
```


## +page.svelte

+page.svelte의 script 태그 안에 아래 내용을 작성합니다. 여기서는 TypeScript로 작성했습니다.

```svelte
<script lang="ts">
 import type { PageData } from './$types'; // microCMS에서 기사 데이터를 가져오기 위해 작성
 import { load } from 'cheerio'; // cheerio를 직접 import하는 것은 비추천, load라는 이름도 일반적이므로 주의
 import hljs from 'highlight.js';

 export let data: PageData;

 const cheerio$ = load(data.content); // microCMS에서 기사의 본문을 load에 전달
 cheerio$('pre code').each((_, elm) => {
  const result = hljs.highlightAuto(cheerio$(elm).text());　// 구문 강조를 설정
  cheerio$(elm).html(result.value); // 설정한 코드로 대체
  cheerio$(elm).addClass('hljs'); // hljs 클래스를 추가
 });
 const article = cheerio$.html(); // 대체한 HTML을 저장
 export { article }; // HTML로 출력할 수 있도록 함
</script>
```

export한 article의 값은 +page.svelte의 HTML에서 ` {@html article} `으로 하면 HTML로 출력할 수 있습니다. CSS는 highlight.js에서 제공하는 것을 import하거나 직접 작성하면 됩니다. 이 사이트에서 2023년 7월 현재 설정된 CSS는 다음과 같습니다.

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

highlight.js에서는 hljs.highlightAuto로 언어를 자동으로 판단하여 구문 강조를 설정해줍니다. 개별 언어를 추가하거나 설정할 필요가 없기 때문에 코드가 적고 도입하기 쉽다는 장점이 있습니다. 구문 강조 설정이 잘 안 될 때나 쉽게 설정하고 싶을 때는 꼭 시도해보세요.