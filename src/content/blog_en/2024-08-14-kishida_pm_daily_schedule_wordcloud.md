---
title: Creating a Word Cloud from Prime Minister Kishida's 'A Day in the Life' Over Three Years
slug: kishida_pm_daily_schedule_wordcloud
description: We will crawl and scrape Fumio Kishida's three years of 'A Day in the Life', perform natural language processing, and create a word cloud. While learning about automation in Python broadly, we will technically examine the duties of the Prime Minister.
date: 2024-08-14T13:25:00.072Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/kishida_pm_wc.webp
draft: false
tags: ['Python', 'Scraping', 'BeautifulSoup4', 'Playwright']
categories: ['Programming']
---

# Creating a Word Cloud from Prime Minister Kishida's 'A Day in the Life' Over Three Years

News of Prime Minister Kishida's resignation has arrived, so I decided to create a word cloud from 'A Day in the Life'.  
*Note: Due to the selection of a new Prime Minister, the Prime Minister's Office pages may become outdated, so please treat the code as reference only.*  
Code: <https://github.com/rmc8/kishida_lex_wordcloud> (Verified on Ubuntu 24.04)

## Overview

Today, we received news of Prime Minister Kishida's resignation. Although we knew the time would come eventually, it's still somewhat surprising. Kishida served as Prime Minister for three years, and the number of 'A Day in the Life' pages is quite extensive. Therefore, I scraped the records from the past three years, performed Japanese natural language processing, and created a word cloud.

## Code

### Crawler

The crawler is designed to crawl all articles from the 'A Day in the Life' pages during his entire term. It uses Playwright, a high-level testing framework, as the crawler.

The term in office started from November 2022. Since 'A Day in the Life' pages are created monthly, it uses a while loop with dateutil to increment by one month at a time, crawling from the November 2022 page up to the August 2024 page.

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

On each monthly page, the news list is structured as follows:

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

The 'A Day in the Life' entries are listed in this format, and the links to the detailed pages can be obtained by following the <a> tags within the .news-list-title class using selectors. Therefore, the code extracts these links and returns them as a list.

```python
async def _extract_links(self, page: Page) -> List[str]:
    article_links = await page.query_selector_all("div.news-list-title a")
    links = []
    for link in article_links:
        if href := await link.get_attribute("href"):
            links.append(href)
    return links
```

The reason for collecting the links as string information is that when navigating pages using a generator, elements from the previous page become inaccessible. Therefore, we convert the elements to a list of strings to preserve the URLs.

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
            # If an error occurs, wait for 5 minutes
            print(f"Error fetching article content from {url}: {e}")
            await page.wait_for_timeout(5 * 60 * 1000.0)
            continue
    return ""
```

Article content is retrieved from _get_article_content. The .section class elements can be obtained, but individual pages are dynamically generated via JavaScript, and raw data isn't delivered via API. Therefore, it's easier to use methods like Selenium or Playwright that render in a browser rather than requests. Additionally, to avoid being blocked from accessing content due to excessive requests, if an element isn't found, the code includes a mechanism to wait 5 minutes before retrying. The retrieved content processes to remove extraneous text like 'Read more' or whitespace, and returns the article data one by one.

### Natural Language Processing

For natural language processing, we use MeCab for morphological analysis. To handle the latest words like 'novel coronavirus', we use ipadic-neologd.

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

We use Counter, a dictionary extension, for word counting. The update method of Counter easily adds words or increments counts by passing a list of split words. MeCab is used to split words, targeting nouns, verbs, and adjectives for aggregation. For verbs, it returns the base form. The fil_token function removes meaningless words before aggregation.

### Creating the Word Cloud

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

    # Generate word cloud from filtered word frequencies
    wordcloud.generate_from_frequencies(filtered_word_freq)
    output_dir = f"{this_dir}/output"
    os.makedirs(output_dir, exist_ok=True)
    wordcloud.to_file(f"{output_dir}/{filename}")
```

The wordcloud module allows easy creation of a word cloud by passing dictionary data to generate_from_frequencies. Saving it as an image file with to_file completes the word cloud.

## Word Cloud and Content Analysis

The word cloud was completed as follows:

![wc](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud.png)

Due to words that should be included in stop words and the fact that it covers various areas, the word cloud doesn't show strong bias, so careful interpretation is needed. It appears to focus on four main policies and five key initiatives.

### Economy and Finance

Words: Economy, Investment, Growth, Wage Increase, Finance, Budget, Strategy, Capitalism, Startup  
One of the main policies of the Kishida administration is 'Improving income and productivity through wage increases and investment'. The keyword 'economy' appears 588 times, suggesting it was the most emphasized in 'A Day in the Life'. In his December 2023 policy speech, he stated, 'Above all, I will focus on the economy.' The high frequency of economy-related keywords indicates consistent efforts and communication on economic initiatives.

### Technological Innovation

Words: Digital, Technology, Development, Construction  
This also relates to 'Improving income and productivity through wage increases and investment', aiming to address labor shortages, enhance efficiency across society including administration, and strengthen the earning power of small and medium-sized enterprises. 'Digital' appears about 300 times, more than 'startup' at 140 times but less than 'wage increase' at 360 times. Digitalization isn't as immediately effective as wage increases, but it's essential for addressing labor shortages and streamlining complex tasks in SMEs, and is considered a serious long-term improvement measure.

### Society and National Life

Words: Society, Citizens, Life, Childcare, Medical, Women  
'Life', 'Childcare', and 'Medical' appear 130-140 times each, while 'Society' appears 410 times. This mainly relates to the second major policy, 'Building a sustainable society in the medium to long term'. It involves utilizing advanced technology and data, with economy and technology as its foundation. While policies include drug development and nursing care (appearing less than 85 times), the main focus seems to be around the economy. On the other hand, 'children' appears about 240 times, indicating an emphasis on younger generations for sustainability.

### International and Security

Words: International, World, G7, Ukraine, Security  
Keywords related to the third major policy, 'Diplomacy and Security', are also prominent. 'International', 'Ukraine', and 'Security' appear about 100 times each, and 'G7' about 200 times. The weight is lighter than national life, but as a major policy, it shows an active external posture. Notably, 'Ukraine' at 128 times exceeds 'United States (America)' at 105 times, highlighting strong interest in Ukraine. Other keywords like climate change, human rights, United Nations, and neighboring China are fewer, giving an impression of less breadth compared to former Prime Minister Abe's 'diplomacy viewing the globe'.

### Disaster-Related

Words: Reconstruction, Restoration, Disaster Area, Disaster Victims, Evacuation  
Each word appears about 100 times, indicating steady implementation of the fourth major policy, 'Ensuring the safety and security of national life'. Within this policy, support for disaster victims and areas comes first, followed by disaster prevention. Measures against infectious diseases are also included, but with COVID-19 calming down, the focus seems to be on disaster support.

### Other

It appears that the days are spent aligned with the main policies (strategies), and no keywords with unusual frequencies outside the major policies were found. If anything, regarding a certain church that attracted social attention, the stance might have been somewhat passive.

## Summary

We performed a series of processes in Python, broadly and shallowly, including crawling, scraping, natural language processing, and word cloud visualization. Although approval ratings were not great and issues like slush funds are regrettable, based on word frequencies, there was no contradiction in prioritizing the economy and strategically working to create a positive cycle as Prime Minister. Thank you for your three years of service. I hope this practical topic helps everyone in their programming learning.
