---
title: "【Python】Playwrightに入門する(1) 導入編(Install, Pages, Navigator)"
slug: "py-playwright-navi"
description: "Python向けのPlaywrightの導入方法と使い方を簡単に学習します。Seleniumと比較しながらページの開き方やページ遷移の方法を中心に見ていきます。"
date: 2024-08-15T09:04:05.429Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/playwright_eycatch.webp"
draft: false
tags: ['Python', 'Playwright']
categories: ['Programming']
---

Python으로 Playwright에 입문합니다.

## Playwrightとは

Playwright는 Microsoft가 공개한 브라우저 자동화 프레임워크입니다. 전신은 JavaScript 기반의 Puppeteer라는 프레임워크로, Playwright는 Puppeteer와 달리 Chrome 외에도 Safari(Webkit)나 Firefox(Gecko)에 대응합니다. 또한, Selenium보다 명시적으로 코드를 작성하지 않아도 브라우저 설정이나 대기 등이 가능한 고수준 프레임워크이며, API 테스트를 위한 request 기능도 탑재되어 있습니다. 안정적인 테스트를 목표로 CSS 선택자 이외의 방법으로 요소를 가져올 수 있는 옵션도 제공되며, Selenium보다 풍부한 기능을 직관적으로 사용할 수 있는 것이 특징입니다. 다양한 언어로 Playwright가 제공되며, Python 버전도 있으므로 Playwright의 사용법을 조금씩 확인합니다.

## 学習方法

Playwright는 다양한 기능을 가지고 있지만, Actions, Locators, Navigations, Pages의 4개를 배우면 브라우저 자동화의 주요 기능을 습득할 수 있습니다. [Playwright의 도큐먼트](https://playwright.dev/python/docs/intro)를 보면 API testing, Assertions, Downloads, JavaScript와의 연동 등 편리한 기능이 많다는 것을 알 수 있습니다. 그러나 모든 것을 배우면 복잡해지므로, 설치 절차를 확인하고 중요한 4개 항목을 다루며 필요에 따라 다른 항목을 배우면 습득이 매우 쉽습니다.

또한, Selenium을 사용하고 있는 분들은 브라우저 자동화를 실현할 수 있는 점에서 비슷하므로 배우기 쉽지만, 안정적인 테스트를 만들기 위해 Selenium과는 다른 철학이 있습니다(도메인 주도적인 철학이 도입되어 있으며, CSS 선택자 등의 사용은 선호되지 않습니다). 그 점을 머리에 새기고 Selenium과의 차이를 의식하며 학습하면 Selenium과 Playwright의 사용 구분이나 전환이 쉽게 될 것입니다.

## 導入の手順

Playwright의 도입은 pip를 통해 쉽게 할 수 있습니다.

```shell
pip install playwright
```

또한, Playwright를 사용하기 위해 Playwright용 브라우저를 설치해야 합니다.

```shell
playwright install
```

Selenium과 달리 별도로 Chrome, Firefox, Safari 등의 브라우저를 설치해야 하지만, 이 작업을 통해 webdriver 설정 등을 고려하지 않고 직관적으로 브라우저 자동 조작이 가능해집니다.

## コード

이번에는 도입으로 Pages, Navigations의 확인을 합니다. [Github](https://github.com/rmc8/Practice-Playwright-with-Python/tree/main/src/001_navigation)에도 유사한 코드를 올려두었으며, Selenium 버전도 있습니다. Selenium과의 비교를 원하는 분들은 리포지토리도 함께 보세요.

```python
from playwright.sync_api import sync_playwright, expect


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        # example.com에 접근하기
        page.goto("https://example.com")
        # 텍스트를 클릭하기
        page.get_by_text("More information...").click()
        # 페이지 전환 대기하기
        page.wait_for_url("https://www.iana.org/help/example-domains")
        # 페이지 정보를 표시하기
        print(page.title())
        print(page.url)
        # 어설션(페이지 타이틀이 지정된 텍스트와 일치하는지 확인하기)
        expect(page).to_have_title("Example Domains")
        # 1초 대기하기
        page.wait_for_timeout(1000.0)
        # 브라우저 닫기
        browser.close()


if __name__ == "__main__":
    main()
```

먼저, 브라우저를 시작하고 새로운 페이지를 만드는 절차는 다음과 같습니다.

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
```

sync_playwright를 열고, p에서 사용할 브라우저를 선택하여 launch 메서드를 사용하면 브라우저를 시작할 수 있습니다. 인수에 headless가 있지만, 이를 True로 설정하면 헤드리스 모드로 브라우저를 시작할 수 있습니다. 브라우저를 열은 후 new_page로 페이지를 열 수 있습니다. 페이지는 여러 개 열 수 있으므로, 필요에 따라 여러 페이지 처리를 작성해도 좋습니다.

```python
page.goto("https://example.com")
```

페이지를 만든 후 goto를 사용하면 네비게이션 처리가 됩니다. 여기서는 Selenium과 마찬가지로 URL을 전달하기만 하면 페이지 전환이 되므로 매우 간단합니다.

```python
# 텍스트를 클릭하기
page.get_by_text("More information...").click()
```

이것은 로케이터 처리가 되지만, 텍스트 이름으로 요소를 식별하여 클릭하는 작업을 합니다. 페이지가 완전히 표시되지 않은 상태라도 기본적으로 30초 동안 요소의 표시를 대기해줍니다.

```python
# 페이지 전환 대기하기
page.wait_for_url("https://www.iana.org/help/example-domains")
# 페이지 정보를 표시하기
print(page.title())
print(page.url)
```

page에는 대기 기능도 있습니다. 특정 URL로 변경될 때까지 대기하거나, `page.wait_for_timeout(1000.0)`처럼 단순히 타임아웃까지 대기하는 등 다양한 대기 방법이 있습니다. 특히 URL 대기는 리디렉트를 기다려야 할 때 매우 유용하며, Selenium보다 컴팩트하게 안정적인 테스트를 작성하기 쉽습니다. 그 밖에 page에는 타이틀이나 URL을 간단한 설명으로 얻을 수 있습니다.

```python
expect(page).to_have_title("Example Domains")
```

assert 처리는 Playwright에서 표준화되어 있으며, IDE의 자동 완성을 사용하면서 쉽게 작성할 수 있습니다.

```python
# 브라우저 닫기
browser.close()
```

브라우저는 Selenium과 거의 유사하게 close로 닫습니다.

### 補足

코드 자체는 매우 간단하며, Selenium보다 작성 방식과 동작이 덜 복잡합니다. Selenium은 매우 큰 커뮤니티와 정보가 있으므로 어느 정도 학습하기 쉽지만, Playwright는 컴팩트하고 명확하게 쉽게 코드를 작성할 수 있는 경향이 있습니다. 이번에 소개한 코드도 매우 간단하지만, 그 대로 작동하는 명확성과 간결함을 경험할 수 있다면 좋을 것입니다.

## まとめ

Playwright의 소개, 도입 방법, 간단한 샘플 코드를 소개했습니다. 코드 전체를 봐도 개별 코드를 분석해 봐도 간단하며, 테스트·크롤링·스크래핑의 입문에 좋다고 생각합니다. 다음 회 이후에 Locator나 Actions에 대해 소개하겠습니다.