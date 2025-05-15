---
title: 【Python】『로마의 휴일』리뷰 스크래핑
slug: eiga-com-scraping-practice
description: 영화.com에서 Python의 BeautifulSoup4를 사용하여 스크래핑을 수행했습니다.
date: 2024-05-06T11:27:46.583Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img%2Feyecatch%2Froma_scraping.webp
draft: false
tags: ['Python', '스크래핑', 'BeautifulSoup4']
categories: ['Programming']
---

# 【Python】『로마의 휴일』리뷰 스크래핑

GW 휴가 동안 Qiita를 둘러보고 있었는데, 다음 기사를 보았습니다.

**영화 리뷰 및 평가값 스크래핑 1:** <https://qiita.com/AzukiImo/items/3356af25fe3e7d496e75>

평소에는 Selenium을 사용한 스크래핑이나 크롤링, 또는 Request를 통한 API 조작을 자주 하지만, 오랜만에 BeautifulSoup의 복습을 하고 싶어졌습니다. 주제를 빌려와서 코드를 추가 구현했습니다.

## 리포지토리

<https://github.com/rmc-8-com/eiga-com-scraping-practice>

## 주요 구현

코드는 다음과 같습니다.
```python
import re
import time
from typing import List, Dict, Optional

import pandas as pd
import requests
from bs4 import BeautifulSoup

class EigaScraper:
    URL_FMT: str = "<https://eiga.com/movie/{movie_id}/review/all/{{page_num}}/>"
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
            # NOTE: 일반 리뷰와 스포일러 리뷰의 구조가 다르기 때문에 두 요소로 리뷰 유무를 확인
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
        match = re.search(r"(\d+)건중", text)
        if not match:
            return None

        review_count = int(match.group(1))
        # NOTE: 20의 배수일 때 페이지 수가 적절히 표시되도록 1을 빼고, 최종 결과에 +1을 함
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

### 클래스화

원래 기사에서는 절차형 처리에 기반하여 순서대로 처리가 나열되어 있지만, 수정된 코드에서는 클래스를 사용하고, 비공개 메서드를 통해 처리를 분할하거나, URL의 ID를 변경하여 다른 작품의 리뷰 추출도 가능하게 했습니다. 클래스에서는 인스턴스화 시 작품의 ID를 받아들이고, 스크래핑 결과는 Pandas의 DataFrame 형식으로 반환합니다.

### URL의 포맷화

리뷰 페이지에 대해 `https://eiga.com/movie/{movie_id}/review/all/{{page_num}}/` 형식의 URL을 사용하도록 했으며, 1페이지의 경우에도 이 형식을 사용합니다. 페이지 처리 기능을 가진 많은 시스템에서 1페이지도 동일한 형식으로 입력하면 결과가 제대로 얻어지기 쉽습니다. 이번 스크래핑에서도 그 예외가 아니었기 때문에, 동일한 형식으로 데이터를 추출하여 코드를 간단하게 했습니다.

### 최종 페이지 수 생성

원래 기사에서는 수동으로 페이지 수를 입력하도록 되어 있었지만, `_get_last_page_num` 메서드를 추가하여 이를 자동화했습니다. 리뷰의 건수가 `p.result-number` 요소로 표시됩니다. 표시된 건수를 정규 표현식을 사용하여 추출하고, 숫자화하여 페이지 수를 계산합니다. 마지막 페이지까지 도달할 때까지 page_num을 1씩 증가시켜 순서대로 리뷰를 봅니다.

### 스크래핑 처리의 분할

실제로 BeautifulSoup를 사용하여 스크래핑하는 처리는 `_scrape` 메서드로 분할했습니다. 스크래핑 내용 자체에는 특별한 변화가 없지만, 열을 별도로 리스트로 만들지 않고 딕셔너리를 리스트에 저장하여 Pandas의 DataFrame 생성 코드를 줄였습니다.

## 총평

오랜만에 BeautifulSoup4를 사용해서 즐거운 휴일이었습니다. Selenium보다 코드가 약간 더 간결하고, requests와 함께 사용할 수 있는 라이브러리라서 매우 편리합니다. 리뷰 추출 처리를 자동화하고, 처리를 다른 작품에서도 사용할 수 있도록 추상화하여 고평가 작품을 효율적으로 찾을 수 있게 되었습니다. 수고를 들이지 않고 정보를 수집하여 효율적으로 품질이 높은 작품에 접근할 수 있게 되니, 여가 시간을 효율화할 수 있는 점에서도 재미있는 코드였습니다.