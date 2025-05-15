---
title: Tauri 2.0 (RC)로 모바일 앱을 시험적으로 작성하기
slug: tauri_2_rc_practice
description: Tauri 2.0의 RC 버전이 발표되었으므로, Svelte를 사용하여 모바일용 카운터 앱을 시험적으로 작성합니다. TypeScript만 이해하면 선호하는 프레임워크로 모바일 앱을 만들 수 있으니, Tauri로 재미있게 해보시기 바랍니다.
date: 2024-08-03T06:39:57.446Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/tauri_eycatch.webp
draft: false
tags: ['Tauri', 'Rust', 'Svelte', 'TypeScript']
categories: ['Programming']
---

# Tauri 2.0 (RC)로 모바일 앱을 시험적으로 작성하기

Tauri 2.0의 릴리스 후보 [아나운스](https://v2.tauri.app/blog/tauri-2-0-0-release-candidate/)가 있었습니다. Tauri 2.0에서는 모바일 기능도 추가되었으므로, 스마트폰용 카운터 앱을 만들면서 기능을 시험해 보겠습니다.

## Tauri 2.0에 대해

2024년 8월 1일에 Tauri 2.0 RC가 발표되었습니다. 또한, 8월 말에는 안정 버전의 릴리스도 예정되어 있습니다. Tauri를 사용하면 TypeScript나 WebAssembly로 데스크톱 앱을 만들 수 있고, 백엔드로 Rust 언어의 처리를 사용할 수 있는 프레임워크입니다. Electron에서 Tauri로의 전환을 목표로 개발이 진행되고 있습니다.

Tauri 2.0에서는 모바일 기능이 강화되어, 데스크톱 앱뿐만 아니라 iOS나 Android용 앱을 TypeScript나 그 프레임워크로 만들 수 있게 되었습니다. 코어 플러그인의 분리, Rust API의 개선, 보안 강화 등의 변경이 있지만, 크로스 플랫폼 개발 프레임워크로서 더 기능이 강화된 버전 업이라고 할 수 있습니다.

월말에 안정 버전의 릴리스가 예정되어 있으므로, 한 발 앞서 Tauri 2.0으로 모바일 개발을 간단히 시험해 보겠습니다.

## 개발하기

Tauri 2.0으로 실제로 앱을 만들어 보겠습니다.

### Version

* rustc 1.80.0 (051478957 2024-07-21)
* node v20.8.0
* Tauri 2.0 RC
  
### Tauri로 개발 시작하기

공식 문서를 따라 먼저 설정을 합니다. 문서는 다음 링크에서 확인할 수 있습니다.  
<https://v2.tauri.app/start/>

먼저 다음 명령어로 프로젝트를 만듭니다. 안정 버전이 릴리스되면 `--rc`는 제거해도 좋을 것 같습니다.

```shell
cargo install create-tauri-app
cargo create-tauri-app --rc
```

create-tauri-app을 실행한 후의 입력 예는 다음과 같습니다.

```shell
✔ Project name · practice
✔ Choose which language to use for your frontend · TypeScript / JavaScript - (pnpm, yarn, npm, bun)
✔ Choose your package manager · npm
✔ Choose your UI template · Svelte - (https://svelte.dev/)
✔ Choose your UI flavor · TypeScript

Template created! To get started run:
  cd practice
  npm install
  npm run tauri android init
  npm run tauri ios init

For Desktop development, run:
  npm run tauri dev

For Android development, run:
  npm run tauri android dev

For iOS development, run:
  npm run tauri ios dev
```

프로젝트 이름은 임의의 것으로 OK입니다. frontend의 언어는 JS/TS 외에 Rust나 ".NET"도 사용할 수 있습니다. 본인에게 익숙한 언어를 선택하시면 됩니다. package manager도 평소에 사용하는 것을 선택하시면 OK입니다. UI 템플릿은 언어에 따라 선택지가 표시됩니다. 이번에는 Svelte로 시험해 보지만, 본인에게 선호하는 프레임워크를 선택하시면 됩니다.  

질문에 따라 선택지를 선택하면, 답변에 따라 tauri의 프로젝트가 만들어집니다. 템플릿이 만들어지면, cd {project_name}을 입력하여 템플릿의 폴더로 이동한 후, `npm install`을 실행하세요. 그 후, `npm run tauri dev` 명령어로 Tauri 앱으로 만든 웹 페이지를 표시할 수 있습니다. 손에 든 스마트폰을 PC에 연결하여 Android나 iOS에서 동작 확인도 할 수 있으니, `npm run tauri android dev` 등의 명령어도 함께 시험해 보세요.

![dev](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/tauri2.0_rc_practice/tauri_hello_world.webp)

### 프로젝트 구조

Svelte로 만든 프로젝트로 이동하면 대략적으로 다음 폴더가 있습니다.

```
src
src-tauri
static
```

`src`는 Svelte 및 SvelteKit으로 구성된 프로젝트입니다. 여기서 프론트엔드나 SvelteKit을 사용한 백엔드 처리의 편집이 가능합니다. `src-tauri`는 Rust로 백엔드 처리를 구성하거나, tauri를 통해 시스템 처리를 발생시키거나, 앱의 아이콘이나 권한 등 앱 자체의 설정을 수행하는 데 사용됩니다. UI나 라우팅의 구축 이외의 설정에 대해서는 tauri 쪽에서 다루는 것으로 생각하시면 좋을 것 같습니다. `static`은 Svelte에서 사용하는 파일을 배치할 수 있는 폴더입니다.

### 카운터 앱 만들기

여기서는 Svelte를 사용하여 카운터 앱을 만듭니다. src 내부는 다음과 같은 구조가 됩니다.

```text
src
├── app.html
└── routes
    ├── +layout.ts
    └── +page.svelte
```

app.html이 대원의 HTML로 SvelteKit의 출력을 받아 HTML을 표시합니다. `routes` 안에 +page.svelte를 만들면 라우팅 및 페이지의 생성이 가능합니다. `routes`에 폴더를 만들고 그 폴더 안에 +page.svelte를 만드는 것만으로 쉽게 페이지 및 라우팅 처리가 수행되는 메커니즘입니다. 이번에는 간단한 카운터 앱이므로, +page.svelte를 편집합니다.

### 불필요한 코드 삭제하기

+page.svelte를 열고 불필요한 코드를 삭제합니다.

```svelte
<script lang="ts">

</script>

<div class="container">
    <h1>Welcome to Tauri!</h1>

    <div class="row"></div>
</div>

<style>
    :root {
        font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 24px;
        font-weight: 400;

        color: #0f0f0f;
        background-color: #f6f6f6;

        font-synthesis: none;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        -webkit-text-size-adjust: 100%;
    }

    .container {
        margin: 0;
        padding-top: 10vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }

    .row {
        display: flex;
        justify-content: center;
    }

    h1 {
        text-align: center;
    }
</style>
```

초기의 코드에서는 `import { invoke } from "@tauri-apps/api/core";`가 포함되어 있지만, 이는 Rust 기능을 프론트엔드에서 사용하는 라이브러리입니다. 이번에는 간단히 앱을 만들기만 하므로 삭제합니다.  

Svelte 자체의 구성은 TypeScript(JavaScript), HTML, CSS의 3개 블록으로 구성되어 있으며, 모듈 단위로 HTML이나 CSS, JavaScript에 의한 처리가 반영됩니다. React처럼 JSX나 TSX에 익숙할 필요가 없고, HTML/CSS/JavaScript가 읽을 수 있으면 대충 이해할 수 있을 것 같습니다.  

### app.html을 편집하여 확대 등을 방지하기

Tauri에서는 브라우저와 같은 것을 동작시켜 웹 프레임워크의 앱을 그대로 데스크톱 앱이나 모바일 앱으로 변환합니다. 따라서 사용자가 확대를 하면 브라우저에서 사용하는 앱처럼 확대되므로, 일반 앱을 사용하는 것보다 브라우저를 사용하는 느낌이 나옵니다. 이번 용도에서는 확대가 불필요하므로, 다음 1행을 추가하여 app.html을 편집합니다.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

전체는 다음과 같습니다.

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Tauri + SvelteKit + Typescript App</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### 카운터 앱 작성하기

먼저 카운터 앱의 기능을 작성합니다. 카운터는 0부터 시작하는 것으로 합니다. 버튼으로는 +를 누르면 1 증가, 마이너스를 누르면 1 감소하는 것으로 합니다. 카운터의 수치는 0 이상의 수치임을 전제로 합니다. 그리고, 리셋 버튼을 누르면 0이 되는 간단한 카운터입니다. 먼저, 이 기능을 TypeScript로 작성하면 다음과 같습니다.

```svelte
<script lang="ts">
    let count: number = 0;

    function increment(): void {
        count++;
    }

    function decrement(): void {
        if (count > 0) {
            count--;
        }
    }

    function reset(): void {
        count = 0;
    }
</script>
```

HTML은 다음과 같이 작성하여 간단히 카운터를 만듭니다.

```html
<div class="container">
    <h1>Welcome to Counter App powered by Tauri!</h1>

    <div class="counter">
        <p>현재의 수치: <span class="count">{count}</span></p>
        <div class="buttons">
            <button on:click={decrement}>-</button>
            <button on:click={reset} class="reset-button">리셋</button>
            <button on:click={increment}>+</button>
        </div>
    </div>
</div>
```

TypeScript로 정의한 함수는, on:click 속성에 {} 괄호를 전달하고, 괄호 안에 함수명을 쓰면 처리를 전달할 수 있습니다. 카운터의 수치도 물결 괄호에 변수명을 쓰면 삽입됩니다.

CSS는 다음과 같이 작성하고 있습니다.

```css
<style>
    .container {
        text-align: center;
        padding: 2rem;
    }

    h1 {
        color: #2c3e50;
        margin-bottom: 2rem;
    }

    .counter {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .count {
        font-size: 2rem;
        font-weight: bold;
        color: #3498db;
    }

    .buttons {
        margin-top: 1rem;
    }

    button {
        font-size: 1.2rem;
        margin: 0 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:nth-child(1) {
        background-color: #e74c3c;
        color: white;
    }

    button:nth-child(2) {
        background-color: #2ecc71;
        color: white;
    }

    button:nth-child(3) {
        background-color: #3498db;
        color: white;
    }

    button:hover {
        opacity: 0.8;
    }
</style>
```

CSS도 일반 CSS로 좋고, TailwindCSS나 PostCSS도 사용할 수 있습니다. 선호하는 프레임워크로 원하는 대로 디자인하시면 됩니다.

+page.svelte의 코드는 다음과 같이 완성되었습니다.

```svelte
<script lang="ts">
    let count: number = 0;

    function increment(): void {
        count++;
    }

    function decrement(): void {
        if (count > 0) {
            count--;
        }
    }

    function reset(): void {
        count = 0;
    }
</script>

<div class="container">
    <h1>Welcome to Counter App powered by Tauri!</h1>

    <div class="counter">
        <p>현재의 수치: <span class="count">{count}</span></p>
        <div class="buttons">
            <button on:click={decrement}>-</button>
            <button on:click={reset} class="reset-button">리셋</button>
            <button on:click={increment}>+</button>
        </div>
    </div>
</div>

<style>
    .container {
        text-align: center;
        padding: 2rem;
    }

    h1 {
        color: #2c3e50;
        margin-bottom: 2rem;
    }

    .counter {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .count {
        font-size: 2rem;
        font-weight: bold;
        color: #3498db;
    }

    .buttons {
        margin-top: 1rem;
    }

    button {
        font-size: 1.2rem;
        margin: 0 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:nth-child(1) {
        background-color: #e74c3c;
        color: white;
    }

    button:nth-child(2) {
        background-color: #2ecc71;
        color: white;
    }

    button:nth-child(3) {
        background-color: #3498db;
        color: white;
    }

    button:hover {
        opacity: 0.8;
    }
</style>
```

iOS에서 실행하는 경우, `npm run tauri ios init`로 한 번 앱을 실행할 준비를 한 후, `npm run tauri ios dev`를 실행하면 에뮬레이터나 실기에서의 동작 확인이 가능합니다. Android의 경우에는 ios의 부분을 android로 바꾸어 주세요. 실행 결과는 다음과 같습니다.

![app](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/tauri2.0_rc_practice/tauri_counter.webp)

### Build

앱이 완성된 후, `npm run tauri android build`나 `npm run tauri ios build`로 빌드할 수 있습니다. 빌드하면 실기 설치나 배포가 가능합니다.

### Beta 버전과 비교한 Svelte의 동작에 대해

Svelte에 대해 Beta 버전과 달리 SPA 이외에도 SvelteKit을 사용한 Routing에도 대응하게 되어, Svelte 개발자에게는 더 다루기 쉬워졌을 것 같습니다. Flutter나 React Native와 비교하면 Tauri는 아직 미숙하고 커뮤니티도 작아서, 앞으로의 발전이 기대됩니다.

## 요약

Tauri 2.0 (RC)로 모바일 앱을 만들었습니다. TypeScript 등 웹 계열의 지식이 있으면 그것을 기반으로 GUI를 구축하여 모바일 앱을 만들 수 있습니다. 또한, 야심찬 개발자라면 Rust로 백엔드 처리를 조합하여 더 복잡하고 안정적인 앱을 만들 수도 있습니다. 아직 Electron의 대안으로는 발전 중이지만, 앞으로의 버전 업을 기대합니다.