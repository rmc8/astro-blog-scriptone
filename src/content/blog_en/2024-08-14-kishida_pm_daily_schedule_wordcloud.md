---
title: "Creating a Word Cloud from Prime Minister Kishida's 'A Day in the Life' Over Three Years"
slug: "kishida_pm_daily_schedule_wordcloud"
description: "We will crawl and scrape the 'A Day in the Life' of Fumio Kishida for three years, perform natural language processing, and create a word cloud. While learning about automation in Python broadly, we will technically examine the duties of the Prime Minister."
date: 2024-08-14T13:25:00.072Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/kishida_pm_wc.webp"
draft: false
tags: ['Python', 'Scraping', 'BeautifulSoup4', 'Playwright']
categories: ['Programming']
---

News of Prime Minister Kishida's resignation has arrived, so I tried creating a word cloud from 'A Day in the Life'.
※Please treat the code as a reference only, as the Prime Minister's Office page may become outdated due to the selection of a new Prime Minister.
Code: <https://github.com/rmc8/kishida_lex_wordcloud> (Verified on Ubuntu 24.04)

## Overview

Today, news of Prime Minister Kishida's resignation has come. Although it was expected that he would resign eventually, it is still somewhat surprising. Kishida served as Prime Minister for three years, and there are many pages of 'A Day in the Life.' Therefore, I scraped the records for three years, performed Japanese natural language processing, and created a word cloud.

## Code

### Crawler

The crawler is designed to crawl all articles from the 'A Day in the Life' pages during his term. As a crawler, we are using Playwright, a high-level testing framework.

The term in office starts from November 2022. Since 'A Day in the Life' pages are created monthly, we use a while loop with dateutil to increment by one month, crawling from the November 2022 page up to the August 2024 page.

```python
class KanteiClient:
    BASE_URL = "https://www.kantei.go.jp/"

    def __init__(self):
        self.dt = date(2022, 11, 1)

    def _build_url(self, path: str) -> str:
        return urljoin(self.BASE_URL, path)

    def _next_month(self) -> None:
        self.dt += relativedelta(months=1)

    def _get_archive_url(self):
        end_dt = date(2024, 8, 1)
        while self.dt <= end_dt:
            yield self._build_url(f"jp/101_kishida/actions/{self.dt:%Y%m}/index.html")
            self._next_month()
```

On each monthly page, the news list is structured as follows.

```html
<ul class="news-list is-thumb-visible">
    <li>
        <div class="news-list-thum">
           <a href="/jp/101_kishida/actions/202408/14kaiken.html"><img src="/jp/content/000154603.jpg" alt="岸田内閣総理大臣記者会見"></a>
        </div>
        <div class="news-list-data">
            <div class="news-list-title">
                    <a href="/jp/101_kishida/actions/202408/14kaiken.html">岸田内閣総理大臣記者会見</a>
            </div>
            <div class="news-list-date">
                更新日：令和6年8月14日
            </div>
            <div class="news-list-text">
                <p>岸田総理は、総理大臣官邸で自由民主党総裁選への不出馬についての記者会見を行いました。</p>
            </div>
        </div>
    </li>
    <li>
        <div class="news-list-thum">
            <a href="/jp/101_kishida/actions/202408/13hyoukei.html"><img src="/jp/content/000154530.jpg" alt="パリ２０２４オリンピック競技大会日本代表選手団による表敬"></a>
            </div>
            <div class="news-list-data">
                <div class="news-list-title">
                    <a href="/jp/101_kishida/actions/202408/13hyoukei.html">パリ２０２４オリンピック競技大会日本代表選手団による表敬</a>
                </div>
            <div class="news-list-date">更新日：令和6年8月13日</div>
            <div class="news-list-text">
                <p>岸田総理は、総理大臣官邸でパリ２０２４オリンピック競技大会日本代表選手団による表敬を受けました。</p>
            </div>
        </div>
    </li>
</ul>
```

The 'A Day in the Life' is listed in this format, and links to detailed pages can be obtained by following the a tags in the news-list-title class via selectors. Therefore, we extract the links using selectors and return them as a list.

```python
async def _extract_links(self, page: Page) -> List[str]:
    article_links = await page.query_selector_all("div.news-list-title a")
    links = []
    for link in article_links:
        if href := await link.get_attribute("href"):
            links.append(href)
    return links
```

The reason for obtaining links as text information is that when navigating pages using a generator, elements from the previous page become inaccessible. Therefore, we convert elements to a list of str types in advance to retain the URLs.

```python
async def _get_article_content(self, page: Page, url: str) -> str:
    retry_num = 3
    for _ in range(retry_num):
        try:
            await page.goto(url)
            await page.wait_for_timeout(1000.0)
            article = page.locator(".section")
            return await article.inner_text()
        except Exception as e:
            # In case of an error, wait for 5 minutes
            print(f"Error fetching article content from {url}: {e}")
            await page.wait_for_timeout(5 * 60 * 1000.0)
            continue
    return ""
```

Article content is obtained from _get_article_content. Elements can be retrieved from the section class, but individual pages are dynamically generated via JavaScript, and raw data is not delivered via API. Therefore, methods like Selenium or Playwright, which render in a browser, are easier for extracting articles than requests. Additionally, to avoid access issues from frequent requests, if an element is not found, we implement a mechanism to retry after a 5-minute sleep. We process to remove extraneous text like 'Read more' or margins and return the article data one by one.

### Natural Language Processing

For natural language processing, we use MeCab for morphological analysis. To handle the latest words like the novel coronavirus, we use ipadic-neologd.

```python
import os
from collections import Counter
from typing import List, Dict
import MeCab

class TextProcessor:
    def __init__(self, d:str):
        mecabrc = os.environ.get('MECABRC', '/etc/mecabrc')
        self.tagger = MeCab.Tagger(f"-r {mecabrc} -d {d}")
        self.counter = Counter()
        
    def _process_text(self, text: str) -> List[str]:
        node = self.tagger.parseToNode(text)
        tokens = []
        while node:
            features = node.feature.split(',')
            pos = features[0]
            if pos in ['名詞', '動詞', '形容詞']:
                if pos == '動詞':
                    # For verbs, use the base form (dictionary form)
                    tokens.append(features[6])
                else:
                    tokens.append(node.surface)
            node = node.next
        return tokens

    def update_word_frequencies(self, text: str) -> None:
        tokens = self._process_text(text)
        tokens = fil_token(tokens)
        self.counter.update(tokens)

    def get_word_frequencies(self) -> Dict[str, int]:
        return dict(self.counter)

    def get_counter(self):
        return self.counter
    
    
def fil_token(tokens: List[str]) -> List[str]:
    stop_words = ("令和", "平成", "年", "月", "日", "総理", "岸田", "行う", "等")
    return [t for t in tokens if t not in stop_words]
```

We use Counter, a dict extension, for the word counter. The update method of Counter allows easy addition and counting of words by passing a list of divided words. We use MeCab to split words and collect nouns, verbs, and adjectives. For verbs, we process to return them in their base form. We perform aggregation after removing meaningless words with fil_token.

### Word Cloud Creation

```python
import os
from wordcloud import WordCloud
def generate_wordcloud(word_freq, this_dir, filename="wordcloud.png", min_count=5):
    # Filter words with count greater than or equal to min_count
    filtered_word_freq = {
        word: count for word, count in word_freq.items() if count >= min_count
    }

    # Create WordCloud object
    font_path = f"{this_dir}/font/SawarabiGothic-Regular.ttf"
    wordcloud = WordCloud(
        width=1200,
        height=800,
        background_color="white",
        font_path=font_path,
        max_font_size=100,
        max_words=256,
    )

    # Generate word cloud from filtered word frequency data
    wordcloud.generate_from_frequencies(filtered_word_freq)
    output_dir = f"{this_dir}/output"
    os.makedirs(output_dir, exist_ok=True)
    wordcloud.to_file(f"{output_dir}/{filename}")
```

By passing dictionary data to generate_from_frequencies of the wordcloud module, we can easily create a word cloud. Generating and saving it with to_file completes the word cloud.

## Word Cloud and Content

The word cloud was completed as follows.

![wc](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud.png)

Due to the presence of words that should be included in stop words and the fact that it covers various initiatives, the word cloud does not show strong bias, so caution is needed when reading it. It appears to focus on four main policies and five initiatives broadly.

### Economy and Finance

Words: Economy, Investment, Growth, Wage Increase, Finance, Budget, Strategy, Capitalism, Startup  
One of the main policies of the Kishida Cabinet is 'Improving income and productivity through wage increases and investment.' Related keywords include 'economy,' which appears 588 times, seeming to be the most emphasized keyword based on its frequency in 'A Day in the Life.' In his policy speech in December 2023, he stated, 'Above all, I will focus on the economy.' The fact that economy-related keywords are the most frequent indicates that he consistently worked on and communicated about economic initiatives.

### Technological Innovation

Words: Digital, Technology, Development, Construction  
This also relates to 'Improving income and productivity through wage increases and investment,' aiming to address labor shortages and enhance efficiency across society, including administration, while strengthening the earning power of small and medium-sized enterprises. 'Digital' appears about 300 times, more than 'startup' at 140 times but less than 'wage increase' at 360 times. Digitalization is not as immediately effective as wage increases. However, it is indispensable for addressing labor shortages and streamlining complex tasks in small and medium-sized enterprises, and I believe it is taken seriously as a long-term improvement measure.

### Society and National Life

Words: Society, Citizens, Life, Childcare, Medical, Women  
'Life,' 'childcare,' and 'medical' appear about 130-140 times each, while 'society' appears 410 times. This mainly relates to the second main policy, 'Building a sustainable society in the medium to long term.' Its realization involves the use of advanced technology and data, with the foundation in economy and technology. Although policies include drug development and nursing care, their frequencies are below 85, so they feel like peripheral policies. On the other hand, 'children' appears about 240 times, suggesting policies that prioritize younger generations from a sustainability perspective.

### International and Security

Words: International, World, G7, Ukraine, Security  
Keywords related to the third main policy, 'Diplomacy and Security,' are also prominent. Words like 'international,' 'Ukraine,' and 'security' appear about 100 times each, and 'G7' about 200 times. The weight is lighter than national life, but as it is listed as a main policy, it shows an active external posture. Incidentally, 'Ukraine' at 128 times is more than 'America (United States)' at 105 times, indicating strong interest in Ukraine. Other keywords like climate change, human rights, United Nations, and neighboring China are few, giving an impression of bias compared to former Prime Minister Abe's 'diplomacy viewing the globe.'

### Disaster-Related

Words: Reconstruction, Restoration, Disaster Area, Disaster Victims, Evacuation  
Each word appears about 100 times, and it seems that the fourth main policy, 'Safety and Security of National Life,' is steadily being implemented. Within this policy, support for disaster victims and areas comes first, followed by disaster prevention. Measures against infectious diseases are also mentioned here, but with COVID-19 calming down, efforts are focused on disaster support.

### Others

It appears that days are spent in line with the main policies (strategies), and no keywords with unusual frequencies that do not fit the main policies were found. If I had to say, regarding a certain church, it might have been a passive stance despite social attention.

## Summary

We performed a series of processes broadly and shallowly in Python, including crawling, scraping, natural language processing, and word cloud visualization. Although support rates were not very high and issues like slush funds are undesirable, based on the frequency of words, there are no contradictions in prioritizing the economy and strategically fulfilling duties as Prime Minister to create a virtuous cycle. Thank you for your three years of hard work. I hope this practical topic helps everyone in their programming learning.
