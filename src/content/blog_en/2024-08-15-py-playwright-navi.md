---
title: "[Python] Introduction to Playwright (1) Introduction (Install, Pages, Navigator)"
slug: py-playwright-navi
description: Learn the basics of using Playwright for Python, including installation and usage. Compare it with Selenium, focusing on opening pages and navigating.
date: 2024-08-15T09:04:05.429Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/playwright_eycatch.webp
draft: false
tags: ['Python', 'Playwright']
categories: ['Programming']
---

# [Python] Introduction to Playwright (1) Introduction (Install, Pages, Navigator)

Get started with Playwright in Python.

## What is Playwright?

Playwright is a browser automation framework released by Microsoft. It is the successor to Puppeteer, which was JavaScript-based, but Playwright supports not only Chrome but also Safari (WebKit) and Firefox (Gecko). Compared to Selenium, it is a higher-level framework that allows browser setup and waiting without explicit code, and it includes features like request functionality for API testing. It offers options to select elements beyond CSS selectors, making tests more robust. Playwright is available for various languages, including Python, so we will explore its usage step by step.

## Learning Method

Playwright has many features, but mastering the four main ones—Actions, Locators, Navigations, and Pages—will cover the essentials of browser automation. According to the [Playwright documentation](https://playwright.dev/python/docs/intro), it includes useful functions for API testing, Assertions, Downloads, and integration with JavaScript. However, learning everything can be overwhelming. Therefore, start by checking the installation process, then practice these four key areas, and learn others as needed for easier mastery.

If you are familiar with Selenium, which also enables browser automation, Playwright shares similarities but follows a different philosophy for creating more robust tests (it incorporates domain-driven design principles and discourages heavy reliance on CSS selectors). Keeping this in mind and comparing it with Selenium will make it easier to switch between the two or choose the right tool.

## Installation Steps

Installing Playwright is straightforward using pip.

```shell
pip install playwright
```

Additionally, you need to install the browsers required for Playwright.

```shell
playwright install
```

Unlike Selenium, you don't need to install browsers like Chrome, Firefox, or Safari separately and configure webdrivers; this command sets everything up, allowing intuitive browser automation.

## Code

In this introduction, we will verify Pages and Navigations. Similar code is available on [GitHub](https://github.com/rmc8/Practice-Playwright-with-Python/tree/main/src/001_navigation), including a Selenium version for comparison.

```python
from playwright.sync_api import sync_playwright, expect

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        # Navigate to example.com
        page.goto("https://example.com")
        # Click on the text
        page.get_by_text("More information...").click()
        # Wait for URL change
        page.wait_for_url("https://www.iana.org/help/example-domains")
        # Display page information
        print(page.title())
        print(page.url)
        # Assertion (check if page title matches)
        expect(page).to_have_title("Example Domains")
        # Wait for 1 second
        page.wait_for_timeout(1000.0)
        # Close the browser
        browser.close()

if __name__ == "__main__":
    main()
```

First, the steps to launch the browser and create a new page are as follows:

```python
with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
```

Open sync_playwright, select the browser from p, and use the launch method to start the browser. The headless parameter, if set to True, launches in headless mode. After opening the browser, use new_page to open a page. You can open multiple pages if needed.

```python
page.goto("https://example.com")
```

After creating the page, use goto for navigation. Like Selenium, it simply transitions to the URL provided.

```python
# Click on the text
page.get_by_text("More information...").click()
```

This is a locator operation, identifying and clicking an element by its text. By default, it waits up to 30 seconds for the element to appear.

```python
# Wait for URL change
page.wait_for_url("https://www.iana.org/help/example-domains")
# Display page information
print(page.title())
print(page.url)
```

The page object includes various waiting functions. For example, wait_for_url waits for a specific URL, or you can use `page.wait_for_timeout(1000.0)` to wait for a timeout. This is particularly useful for handling redirects and makes tests more robust than Selenium. Additionally, you can easily retrieve the title and URL.

```python
expect(page).to_have_title("Example Domains")
```

Assertions are standardized in Playwright, allowing easy writing with IDE autocomplete.

```python
# Close the browser
browser.close()
```

Close the browser, similar to Selenium.

### Additional Notes

The code is very simple and has fewer quirks than Selenium. Selenium has a large community and plenty of resources, making it accessible, but Playwright tends to be more compact and straightforward. If you can experience the simplicity and reliability of this code, that should be sufficient for now.

## Summary

We introduced Playwright, its installation method, and a simple sample code. The code is straightforward overall and individually, making it great for beginners in testing, crawling, or scraping. In future articles, we will cover Locators and Actions.