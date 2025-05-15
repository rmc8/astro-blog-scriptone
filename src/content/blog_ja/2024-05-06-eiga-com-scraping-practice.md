---
title: 【Python】『ローマの休日』レビューのスクレイピング
slug: eiga-com-scraping-practice
description: 映画.comからPythonのBeautifulSoup4を使ってスクレイピングを行いました。
date: 2024-05-06T11:27:46.583Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img%2Feyecatch%2Froma_scraping.webp
draft: false
tags: ['Python', 'スクレイピング', 'BeautifulSoup4']
categories: ['Programming']
---

# 【Python】『ローマの休日』レビューのスクレイピング

GWの休暇でQiitaを眺めていたところ以下の記事を拝見しました。

**映画レビュー・評価値のスクレイピング １:** <https://qiita.com/AzukiImo/items/3356af25fe3e7d496e75>

普段はSeleniumによるスクレイピングやクローリング、もしくはRequestによるAPIの操作をよく行なっているのですが、久々にBeautifulSoupの復習もしたくなりました。題材とコードをお借りしつつ、追加の実装などを行いました。

## リポジトリ

<https://github.com/rmc-8-com/eiga-com-scraping-practice>

## 主な実装

コードは以下の通りです。
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
            # NOTE: 通常のレビューとネタバレありレビューで構成が異なるので２つの要素でレビューの有無を確認する
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
        # NOTE: 20の倍数の時にページ数が適切に表示されるように1引いて、最終的な結果に+1をする
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

### クラス化

記事では手続型の処理に基づいて順番に処理が掲載されています。一方で、書き換えたコードではクラスを使い、プライベートなメソッドを用いた処理の分割を行ったり、urlのidを変更することで別の作品のレビュー抽出も行えるようにしました。クラスではインスタンス化の時に作品のIDを受け取り、スクレイピングの結果はPandasのDataFrame形式で返すようにしています。

### URLのフォーマット化

レビューのページについて`https://eiga.com/movie/{movie_id}/review/all/{{page_num}}/`の書式でURLを使うようにしており、1ページ目の場合であってもこの書式を使っています。ページングの処理を備えた多くのシステムで、1ページ目も同様の書式で入力することによって結果がちゃんと得られることも多いです。今回のスクレイピングにおいてもその例に漏れなかったので、同一の書式でデータを抽出するようにして、コードをシンプルにしています。

### 最終ページ数の生成

元の記事では手動でページ数を入力するようになっていましたが、`_get_last_page_num`メソッドを追加することによりその処理を自動化しています。レビューの件数が`p.result-number`の要素で表示されます。表示されている件数を正規表現を用いて抽出し、数値化したものを使ってページ数の計算をしています。最後のページまで到達するまでpage_numを１ずつ加算して順番にレビューを見るようにしています。

### スクレイピング処理の分割

実際にBeautifulSoupを使ってスクレイピングする処理は`_scrape`メソッドに分割しています。スクレピングの内容自体には特に変化はありませんが、列ごとにリストを作らずに辞書をリストに格納させることによってPandasでのDataFrameの生成のコード量を削減しています。

## 総評

久々にBeautifulSoup4をさわれて楽しい休日でした。Seleniumよりもコードが若干コンパクトであり、requestsでもseleniumと組み合わせてでも使えるライブラリなのでとても便利であります。また、レビューを抽出する処理を自動化し・かつ処理自体を他作品でも使えるように抽象化することによって高評価の作品を効率よく探し出せるようになりました。手間をかけずに情報を収集することにより、効率よく品質の高い作品にアクセスできるようになるので余暇の過ごし方を効率化できる点でも楽しいコードでした。

