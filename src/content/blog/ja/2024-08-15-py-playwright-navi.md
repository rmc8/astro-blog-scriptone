---
title: py-playwright-navi
description: Python向けのPlaywrightの導入方法と使い方を簡単に学習します。Seleniumと比較しながらページの開き方やページ遷移の方法を中心に見ていきます。
date: 2024-08-15T09:04:05.429Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/playwright_eycatch.webp
draft: false
tags: ['Python', 'Playwright']
categories: ['Programming']
---

# 【Python】Playwrightに入門する(1) 導入編(Install, Pages, Navigator)

PythonでPlaywrightに入門します。

## Playwrightとは

PlaywrightはMicrosoftが公開しているブラウザ自動化ためのフレームワークです。前身はPuppeteerと呼ばれるJavaScript系のフレームワークで、PlaywrightはPuppeteerと異なりChrome以外にもSafari(Webkit)やFirefox(Gecko)にも対応します。また、Seleniumよりも明示的にコードを書かずともブラウザのセットアップや待機などができるハイレベルなフレームワークであり、APIのテストのためのrequest機能なども搭載されています。壊れにくいテストを目指すためにCSSセレクター以外の方法でも要素を取得できるような選択肢も用意されており、Seleniumよりも豊富な機能を直感的に使えることが特徴として挙げられます。いろいろな言語向けにPlaywrightが展開されており、Python版もありますのでPlaywrightの扱い方を少しずつ確認します。

## 学習方法

Playwrightは多様な機能を持ちますが、Actions,Locators,Navigations,Pagesの4つを学ぶことでブラウザ自動化のための主要な機能を習得できます。[Playwrightのドキュメント](https://playwright.dev/python/docs/intro)を見るとAPI testingやAssertions、DownloadsやJavaScriptとの連携まで便利な機能が数多くあることがわかります。しかし、すべてを学ぶとなると煩雑です。そのため、インストールの手順を確認し、重要な４項目を触り、必要に応じて他の項目を学ぶと習得が非常に容易です。  

また、Seleniumを使われている方はブラウザ自動化を実現できる点で同じなので学びやすいかと思いますが、壊れにくいテストを作るためにSeleniumと異なる思想があります（ドメイン駆動的な思想が取り入れられており、CSSセレクターなどの利用は好まれていません）。その点を頭の片隅に置いて、Seleniumとの違いを意識して学習するとSeleniumとPlaywrightの使い分けや移行が簡単にできるでしょう。

## 導入の手順

Playwrihgtの導入はpipにより簡単にできます。

```shell
pip install playwrihgt
```

また、Playwrihgtの使用のために Playwright用のブラウザのインストールが必要です。

```shell
playwright install
```

Seleniumとは異なり別途Chrome, Firefox, Safariなどのブラウザをインストールする必要がありますが、この操作を行うことによりwebdriverの設定など考えることなく直感的にブラウザの自動操作ができるようになります。

## コード

今回は導入としてPages, Navigationsの確認をします。[Github](https://github.com/rmc8/Practice-Playwright-with-Python/tree/main/src/001_navigation)にも同様のコードを挙げており、Selenium版もあります。Seleniumとの比較をしたい方はリポジトリも合わせてご覧ください。

```python
from playwright.sync_api import sync_playwright, expect


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        # example.comにアクセスする
        page.goto("https://example.com")
        # テキストをクリックする
        page.get_by_text("More information...").click()
        # ページ遷移を待機する
        page.wait_for_url("https://www.iana.org/help/example-domains")
        # ページの情報を表示する
        print(page.title())
        print(page.url)
        # アサーション(ページタイトルが指定のテキストと一致するか確認する)
        expect(page).to_have_title("Example Domains")
        # 1秒待機する
        page.wait_for_timeout(1000.0)
        # ブラウザを閉じる
        browser.close()


if __name__ == "__main__":
    main()

```

まず、ブラウザを立ち上げて新しいページを作る手順は以下の通りです。

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
```

sync_playwrightを開き、pから使用するブラウザを選びlaunchメソッドを使うことによりブラウザを立ち上げられます。引数にheadlessがありますがこれをTrueにするとヘッドレスモードでブラウザを起動できます。ブラウザを開いた後new_pageでページを開くことができます。ページは複数開くことができるので、必要に応じて複数ページの処理を書いても良いです。

```python
page.goto("https://example.com")
```

ページを作った後gotoを使うことでナビゲーションの処理ができます。ここはSeleniumと同様にURLを渡すだけでページ遷移がされるので非常にシンプルです。

```python
# テキストをクリックする
page.get_by_text("More information...").click()
```

こちらはロケーターの処理になりますが、テキスト名で要素を特定してクリックする操作をしています。ページが仮に完全に表示がされていない状態でもデフォルトでは30秒間、要素の表示を待機してくれます。

```python
# ページ遷移を待機する
page.wait_for_url("https://www.iana.org/help/example-domains")
# ページの情報を表示する
print(page.title())
print(page.url)
```

pageには待機機能もついています。特定のURLに変わるまで待機したり、`page.wait_for_timeout(1000.0)`のように単にタイムアウトするまで待機してくれたりなど豊富に待機の方法があります。とくにURLの待機はリダイレクトを待つ必要がある場合に非常に役立ち、Seleniumよりコンパクトに壊れにくいテストを書きやすいです。そのほか、pageにはタイトルやurlをシンプルな記述で取得できるようになっております。

```python
expect(page).to_have_title("Example Domains")
```

assert処理についてPlaywrightで標準化されていてIDEの補完を使いながら簡単に描けるようになっています。

```python
# ブラウザを閉じる
browser.close()
```

ブラウザはSeleniumとほぼ同様でcloseで閉じられます。

### 補足

コード自体は非常にシンプルでSeleniumよりも書き方も動作も癖が少ないです。Seleniumは非常に大きなコミュニティと情報があるのでそれなりの学習のしやすさがありますが、Playwrightはコンパクトにわかりやすく簡単にコードを書ける傾向があります。今回紹介したコードも非常にシンプルですがその通りに動くわかりやすさと呆気なさが体験できれば今回は良いと思います。

## まとめ

Playwrightの紹介や導入方法、簡単なサンプルコードを紹介しました。コード全体を見ても個別にコードを読み解いてもシンプルでテスト・クローリング・スクレイピングの入門に良いと思います。また次回以降にLocatorやActionsについて紹介します。

