---
title: "Introduction to Playwright in Python (1) Introduction (Install, Pages, Navigator)"
slug: "py-playwright-navi"
description: "Learn the introduction and usage of Playwright for Python easily. While comparing with Selenium, we will focus on how to open pages and navigate."
date: 2024-08-15T09:04:05.429Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/playwright_eycatch.webp"
draft: false
tags: ['Python', 'Playwright']
categories: ['Programming']
---

Introduction to Playwright in Python.

## What is Playwright

Playwright is a framework for browser automation published by Microsoft. Its predecessor is Puppeteer, a JavaScript-based framework, but unlike Puppeteer, Playwright supports not only Chrome but also Safari (Webkit) and Firefox (Gecko). It is a high-level framework that allows browser setup and waiting without explicitly writing code, and it also includes features like request functionality for API testing. It offers options to select elements using methods other than CSS selectors to aim for robust tests, and it is characterized by being more intuitive and feature-rich than Selenium. Playwright is available for various languages, including Python, so we will gradually check how to use it.

## Learning Method

Playwright has various functions, but by learning the four main ones: Actions, Locators, Navigations, and Pages, you can acquire the primary features for browser automation. Looking at the [Playwright documentation](https://playwright.dev/python/docs/intro), you can see many convenient functions such as API testing, Assertions, Downloads, and integration with JavaScript. However, learning everything can be cumbersome. Therefore, confirm the installation procedure, touch on the important four items, and learn other items as needed to make acquisition very easy.

Additionally, if you are using Selenium, it is similar in that it can achieve browser automation, so it should be easy to learn. However, Playwright has a different philosophy from Selenium to create robust tests (it incorporates domain-driven design thoughts, and the use of CSS selectors is not preferred). Keeping that in mind and learning with awareness of the differences from Selenium will make it easy to switch between Selenium and Playwright or migrate.

## Introduction Procedure

Playwright can be introduced easily using pip.

```shell
pip install playwright
```

Additionally, for using Playwright, you need to install the browsers for Playwright.

```shell
playwright install
```

Unlike Selenium, you need to install browsers like Chrome, Firefox, and Safari separately, but by doing this operation, you can intuitively automate browsers without thinking about webdriver settings.

## Code

In this introduction, we will confirm Pages and Navigations. Similar code is also available on [Github](https://github.com/rmc8/Practice-Playwright-with-Python/tree/main/src/001_navigation), and there is a Selenium version as well. If you want to compare with Selenium, please also check the repository.

```python
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        # Access example.com
        page.goto("https://example.com")
        # Click the text
        page.get_by_text("More information...").click()
        # Wait for page navigation
        page.wait_for_url("https://www.iana.org/help/example-domains")
        # Display page information
        print(page.title())
        print(page.url)
        # Assertion (confirm if the page title matches the specified text)
        expect(page).to_have_title("Example Domains")
        # Wait for 1 second
        page.wait_for_timeout(1000.0)
        # Close the browser
        browser.close()

if __name__ == "__main__":
    main()
```

First, the procedure to launch the browser and create a new page is as follows.

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
```

By opening sync_playwright and selecting the browser from p and using the launch method, you can launch the browser. The argument includes headless, and setting it to True will launch the browser in headless mode. After opening the browser, you can open a page with new_page. You can open multiple pages, so you can write processing for multiple pages as needed.

```python
page.goto("https://example.com")
```

After creating the page, you can perform navigation processing with goto. This is very simple, just like Selenium, by passing the URL to transition the page.

```python
# Click the text
page.get_by_text("More information...").click()
```

This is the locator processing, where we specify and click the element by text name. Even if the page is not fully displayed, it will wait for the element to appear for up to 30 seconds by default.

```python
# Wait for page navigation
page.wait_for_url("https://www.iana.org/help/example-domains")
# Display page information
print(page.title())
print(page.url)
```

The page has waiting functions. It can wait until a specific URL changes, or simply wait with `page.wait_for_timeout(1000.0)`. In particular, waiting for URL is very useful when you need to wait for redirects, making it easier to write robust tests than Selenium. Additionally, the page allows you to obtain the title and URL with simple descriptions.

```python
expect(page).to_have_title("Example Domains")
```

Assertions are standardized in Playwright, allowing you to write them easily with IDE autocomplete.

```python
# Close the browser
browser.close()
```

The browser can be closed with close, almost like Selenium.

### Supplement

The code itself is very simple and has fewer quirks in writing and operation compared to Selenium. Selenium has a large community and information, so it has its own ease of learning, but Playwright tends to allow you to write code more compactly and understandably. If you can experience the simplicity and straightforwardness of the code introduced this time, that would be great.

## Summary

We introduced Playwright, its introduction method, and a simple sample code. The code as a whole, or even when reading individual parts, is simple and good for beginners in testing, crawling, and scraping. In future articles, we will introduce Locators and Actions.