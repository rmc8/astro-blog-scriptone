---
title: "【Python】Roman Holiday Review Scraping"
slug: "eiga-com-scraping-practice"
description: "Scraped from Eiga.com using Python's BeautifulSoup4."
date: 2024-05-06T11:27:46.583Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img%2Feyecatch%2Froma_scraping.webp"
draft: false
tags: ['Python', 'Scraping', 'BeautifulSoup4']
categories: ['Programming']
---

During the GW holiday, I was browsing Qiita and came across the following article.

**Movie Review and Rating Scraping 1:** <https://qiita.com/AzukiImo/items/3356af25fe3e7d496e75>

I usually perform scraping or crawling with Selenium, or operate APIs using Requests, but I felt like reviewing BeautifulSoup. I borrowed the topic and code from the article and added some implementations.

## Repository

<https://github.com/rmc-8-com/eiga-com-scraping-practice>

## Main Implementation

The code is as follows.
```python
import re
import time
from typing import List, Dict, Optional

import pandas as pd
import requests
from bs4 import BeautifulSoup

class EigaScraper:
    URL_FMT: str = "https://eiga.com/movie/{movie_id}/review/all/{{page_num}}/"
    headers: Dict[str, str] = {"User-Agent": "Mozilla/5.0"}
    WAIT: float = 1.0

    def __init__(self, movie_id: str = "50969") -> None:
        self.base_url = self.URL_FMT.format(movie_id=movie_id)

    @staticmethod
def _scrape(bs: BeautifulSoup) -> List[Dict[str, Optional[str]]]:
        reviews: List[Dict[str, Optional[str]]] = []
        review_elms = bs.find_all("div", class_="user-review")
        for review_elm in review_elms:
            # User ID
            user_id: str = review_elm["data-review-user"]

            # Rate
            rating_elm = review_elm.find("span", class_="rating-star")
            rating: Optional[str] = rating_elm.text if rating_elm else None

            # Title
            title_elm = review_elm.find("h2", class_="review-title")
            if title_elm:
                title = title_elm.text.replace(str(rating), "").strip()
            else:
                title = None

            # Review text
            # NOTE: The structure differs for regular and spoiler reviews, so check both elements
            review_text_element = review_elm.find("p", class_="short")
            hidden_review_text_element = review_elm.find("p", class_="hidden")
            review_text: Optional[str]
            if review_text_element:
                review_text = review_text_element.text.strip()
            elif hidden_review_text_element:
                review_text = hidden_review_text_element.text.strip()
            else:
                review_text = None

            # Append to list
            reviews.append(
                {
                    "user_id": user_id,
                    "rating": rating,
                    "title": title,
                    "review_text": review_text,
                }
            )
        return reviews

    @staticmethod
def _get_last_page_num(bs: BeautifulSoup) -> Optional[int]:
        REVIEW_COUNT_BY_PAGE = 20
        res_num_elm = bs.find("p", class_="result-number")
        if res_num_elm is None:
            return None

        text: str = res_num_elm.text
        match = re.search(r"(\d+)件中", text)
        if not match:
            return None

        review_count = int(match.group(1))
        # NOTE: Subtract 1 and add back to handle multiples of 20 correctly
        last_page_num = (review_count - 1) // REVIEW_COUNT_BY_PAGE + 1
        return last_page_num

    def extract_review(self) -> pd.DataFrame:
        reviews: List[Dict[str, Optional[str]]] = []
        page_num: int = 1
        while True:
            url = self.base_url.format(page_num=page_num)
            try:
                res = requests.get(url, headers=self.headers)
                res.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(f"Error occurred while fetching {url}: {e}")
                break
            bs = BeautifulSoup(res.text, "lxml")
            review_list = self._scrape(bs)
            reviews.extend(review_list)
            last_page_num = self._get_last_page_num(bs)
            if last_page_num is None or page_num >= last_page_num:
                break
            page_num += 1
            time.sleep(self.WAIT)
        df = pd.DataFrame(reviews)
        return df
```

### Class Implementation

The original article used procedural processing, but in the rewritten code, I used a class with private methods to separate the processing and make it flexible for other movies by changing the URL ID. The class accepts the movie ID on instantiation and returns the scraping results as a Pandas DataFrame.

### URL Formatting

For review pages, I used the format `https://eiga.com/movie/{movie_id}/review/all/{{page_num}}/`, even for the first page. Many systems with pagination work this way, and this scraping case was no exception, so I kept the code simple by using the same format.

### Generating the Last Page Number

The original article required manual page number input, but I added the `_get_last_page_num` method to automate it. The number of reviews is displayed in the `p.result-number` element. I extract the count using regular expressions, convert it to a number, and calculate the pages. It increments page_num by 1 until the last page is reached.

### Splitting the Scraping Process

The actual scraping with BeautifulSoup is handled in the `_scrape` method. The content itself didn't change much, but by storing data as dictionaries in a list, I reduced the code needed to generate the Pandas DataFrame.

## Overall Evaluation

It was a fun holiday revisiting BeautifulSoup4. The code is slightly more compact than Selenium, and since it works with requests or even combined with Selenium, it's very convenient. By automating the review extraction and abstracting it for other works, I can efficiently search for highly rated movies. This allows me to collect information with minimal effort, making it easier to access high-quality works and optimize my leisure time.