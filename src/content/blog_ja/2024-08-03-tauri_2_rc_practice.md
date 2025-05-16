---
title: "Tauri 2.0 (RC)でモバイルアプリを試し書きする"
slug: "tauri_2_rc_practice"
description: "Tauri 2.0のRC版が発表されましたので、モバイル向けにカウンターアプリをSvelteを使って試し書きします。TypeScriptさえわかればお好みのフレームワークでモバイルアプリを作れるので、ぜひTauriで遊んでいただけたら幸いです。"
date: 2024-08-03T06:39:57.446Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/tauri_eycatch.webp"
draft: false
tags: ['Tauri', 'Rust', 'Svelte', 'TypeScript']
categories: ['Programming']
---

Tauri2.0のリリース候補の[アナウンス](https://v2.tauri.app/blog/tauri-2-0-0-release-candidate/)がありました。Tauri2.0ではモバイル向けの機能も追加されていますので、スマートフォン向けのカウンターアプリを作りながら機能を試します。

## Tauri2.0について

2024年8月1日にTauri２.0 RCが発表されました。また、8月末には安定版のリリースも予定されています。Tauriを使うことでTypeScriptやWebアセンブリでデスクトップアプリを作ることができ、バックエンドにRust言語の処理も使えるフレームワークです。ElectronからのTauriへの移行を目指し開発が進められています。

Tauri2.0ではモバイル機能が強化され、デスクトップアプリだけではなくiOSやAndroid向けのアプリをTypeScriptやそのフレームワークで作れるようになりました。コアプラグインの分離やRust APIの改善、セキュリティの強化などの変更もありますが、クロスプラットフォーム向けの開発のフレームワークとしてより機能が強化されたバージョンアップであると言えます。

月末に安定版のリリースが予定されておりますので一足早くTauri2.0によるモバイル開発を簡単に試してみます。

## 開発する

Tauri2.0で実際にアプリを作っていきます。

### Version

* rustc 1.80.0 (051478957 2024-07-21)
* node v20.8.0
* Tauri2.0 RC
  
### Tauriによる開発を始める

公式ドキュメントに沿ってまずセットアップをします。ドキュメントは以下のリンクより確認できます。  
<https://v2.tauri.app/start/>

まず以下のコマンドでプロジェクトを作ります。安定版がリリースされたら`--rc`は取り除いてよさそうです。

```shell
cargo install create-tauri-app
cargo create-tauri-app --rc
```

create-tauri-appを実行した後の入力例は以下の通りです。

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

プロジェクト名は任意のものでOKです。frontendの言語はJS/TSのほかRustや「.NET」も使えます。ご自身の得意の言語を選択いただければ良いかと思います。package managerも普段利用しているものを選択いただければOKです。UIテンプレートは言語に合わせて選択肢が表示されます。今回はSvelteで試してみますが、ご自身のお好みのフレームワークを選べば良いです。  

質問に沿って選択肢を選ぶと、回答に合わせてtauriのプロジェクトが作られます。テンプレートが作られたら、cd {project_name}を入力して、テンプレートのフォルdー兄移動して、`npm install`を実行してください。その後、`npm run tauri dev`のコマンドでTauriのアプリとして作ったwebページを表示できます。お手元のスマートフォンをPCに繋いでAndroidやiOSで動作確認もできますので、`npm run tauri android dev`などのコマンドも合わせてお試しください。

![dev](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/tauri2.0_rc_practice/tauri_hello_world.webp)

### プロジェクト構造

Svelteで作ったプロジェクトに移るとおおまかに以下のフォルダーがあります。

```
src
src-tauristatic
static
```

`src`はSvelteおよびSvelteKitで構成されたプロジェクトです。ここでフロントエンドやSvelteKitを使ったバックエンドの処理の編集ができます。`src-tauri`はRustによるバックエンドの処理を組んだり、tauriを介してシステムの処理を起こったり、アプリのアイコンや権限などアプリ自体の設定を行ったりなどに使えます。UIやルーティングの構築以外の設定についてはtauriの方で触るというイメージを持つと良いかと思います。`static`はSvelteで使うファイルを配置できるフォルダーです。

### カウンターアプリを作る

ここからはSvelteを触ってカウンターアプリを作ります。src内は以下のような構造になっています。

```text
src
├── app.html
└── routes
    ├── +layout.ts
    └── +page.svelte
```

app.htmlが大元のHTMLでSvelteKitからの出力を受け取ってHTMLを表示させます。`routes`内に+page.svelteを作ることによりルーティングおよびページの作成ができます。`routes`にフォルダーを作りそのフォルダーの中に+page.svelteを作るのみで簡単にページおよびルーティングの処理が行える仕組みとなっています。今回はシンプルなカウンターアプリですので、+page.svelteを編集します。

### 　不要なコードを削除する

+page.svelteを開いて不要なコードを削除します。

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

初期のコードでは｀import { invoke } from "@tauri-apps/api/core";`が含まれていますがこれはRustの機能をフロントエンドで使うためのライブラリです。今回はシンプルにアプリを作るのみなので削除します。  

Svelte自体の構成はTypeScript(JavaScript)、HTML、CSSの3つのブロックで構成されておりモジュール単位でHTMLやCSS、JavaScriptによる処理が反映されます。ReactのようにJSXやTSXなどに馴染んでいる必要がなく、HTML/CSS/JavaScriptなどが読めればなんとなくわかると思われます。  

### app.htmlを編集して拡大などを防ぐ

Tauriではブラウザのようなものを動かしてwebフレームワークのアプリをそのままデスクトップアプリやモバイルアプリ化をします。そのため、ユーザーが拡大をするとブラウザで使っているアプリのように拡大されるので、通常のアプリを使っているというよりもブラウザを使っている感が出てしまいます。今回の用途では拡大は不要なので以下の1行を足して、app.htmlを編集します。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

全体はこのようになります。

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

### カウンターアプリを書く

まずカウンターアプリの機能を書きます。カウンターは0から開始するものとします。ボタンとしては+を押すと1増え、マイナスを押すと1減るものとします。カウンターの数値は0以上の数値であることを前提とします。そして、リセットボタンを押すと0となるようなシンプルなカウンターです。まず、この機能をTypeScriptで書くと以下の通りです。

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

HTMLは以下のように書いてシンプルにカウンターを作ります。

```html
<div class="container">
    <h1>Welcome to Counter App powered by Tauri!</h1>

    <div class="counter">
        <p>現在の数値: <span class="count">{count}</span></p>
        <div class="buttons">
            <button on:click={decrement}>-</button>
            <button on:click={reset} class="reset-button">リセット</button>
            <button on:click={increment}>+</button>
        </div>
    </div>
</div>
```

TypeScriptで定義した関数は、on:click属性に{}のカッコを渡し、カッコ内に関数名を書くと処理を渡せます。カウンターの数値も波括弧に変数名を書くことで埋め込んでいます。

CSSは以下の通りに書いています。

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

CSSも通常のCSSでも良いですしTailwindCSSやPostCSSも使うこともできます。お好みのフレームワークで好きなようにデザインいただくと良いです。

+page.svelteのコードは以下の通りに完成しました。

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
        <p>現在の数値: <span class="count">{count}</span></p>
        <div class="buttons">
            <button on:click={decrement}>-</button>
            <button on:click={reset} class="reset-button">リセット</button>
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

iOSで実行する場合には`npm run tauri ios init`で一度アプリを走らせる準備をした後に、`npm run tauri ios dev`を実行するとエミュレーターや実機での動作確認ができます。Androidの場合にはiosの箇所をandroidに書き換えてください。実行結果は以下の通りです。

![app](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/tauri2.0_rc_practice/tauri_counter.webp)

### Build

アプリが完成した後、`npm run tauri android build`や`npm run tauri ios build`でビルドできます。ビルドすることによって実機へのインストールや配布ができます。

### Beta版と比較したSvelteの挙動について

Svelteに関してBeta版とは異なりSPA以外にもSvelteKitを使ったRoutingにも対応するようになり、Svelteの開発者にとってはより扱いやすくなったのかと思います。FlutterやReact Nativeと比較するとTauriはまだ未熟でコミュニティーも小さいので、これからの発展が期待されます。

## まとめ

Tauri２.0(RC)でモバイルアプリを作りました。TypeScriptなどweb系の知識があればそれを元にGUIを構築してモバイルアプリを作ることができます。また意欲的な開発者であればRustでバックエンドの処理を組みより複雑で安定感のあるアプリを作ることもできるようになります。まだまだElectronの代替としては発展途上ではありますが、今後のバージョンアップも期待したいです。

