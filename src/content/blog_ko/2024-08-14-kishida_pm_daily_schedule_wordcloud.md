---
title: Kishida Prime Minister's 3 Years of ‘Prime Minister's Daily Schedule’ Word Cloud
slug: kishida_pm_daily_schedule_wordcloud
description: Kishida Fumio씨의 3년 분량의 ‘총리의 하루’를 크롤링 및 스크래핑하여 자연어 처리를 수행하고, 워드 클라우드를 만듭니다. Python을 통해 자동화를 광범위하게 학습하면서, 총리로서의 임무를 기술적으로 살펴봅니다.
date: 2024-08-14T13:25:00.072Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/kishida_pm_wc.webp
draft: false
tags: ['Python', '스크래핑', 'BeautifulSoup4', 'Playwright']
categories: ['Programming']
---

# Kishida 총리의 3년 분량의 ‘총리의 하루’에서 워드 클라우드 만들기

Kishida 총리의 퇴임 소식이 있었습니다. 그래서 총리의 하루에서 워드 클라우드를 만들어 보았습니다.  
※ 새로운 총리의 선출로 인해 총리 관저 페이지가 오래될 가능성이 매우 높으므로 코드는 참고 정도로만 사용하세요.  
코드: <https://github.com/rmc8/kishida_lex_wordcloud> (Ubuntu 24.04에서 동작 확인을 했습니다)

## 개요

오늘, Kishida 총리의 퇴임 소식이 있었습니다. 언젠가는 퇴임의 시기가 올 것이라고는 하지만, 약간의 놀라움이 있습니다. Kishida씨는 3년 동안 총리를 맡았으며, 총리의 하루 페이지 수도 많습니다. 따라서 3년 분량의 기록을 스크래핑하여, 일본어 자연어 처리를 수행하고 워드 클라우드를 만들어 보았습니다.

## 코드

### 크롤러

크롤러는 총리의 하루 페이지를 재임 기간 동안의 모든 기사를 크롤링하도록 설계되어 있습니다. 크롤러로 Playwright라는 고급 테스트 프레임워크를 사용하고 있습니다.

재임 기간은 2022년 11월부터입니다. 총리의 하루는 매월 페이지가 만들어지므로, 2022년 11월 페이지부터 2024년 8월 페이지까지 while 문을 사용하여 dateutil로 매월 1개월씩 더하면서 2024년 8월까지 크롤링합니다.

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

매월 페이지에서는 뉴스 목록이 다음과 같이 구성되어 있습니다.

```html
<ul class="news-list is-thumb-visible">
    <li>
        <div class="news-list-thum">
           <a href="/jp/101_kishida/actions/202408/14kaiken.html"><img src="/jp/content/000154603.jpg" alt="Kishida 내각 총리대신 기자회견"></a>
        </div>
        <div class="news-list-data">
            <div class="news-list-title">
                    <a href="/jp/101_kishida/actions/202408/14kaiken.html">Kishida 내각 총리대신 기자회견</a>
            </div>
            <div class="news-list-date">
                업데이트 날짜:令和6년8월14일
            </div>
            <div class="news-list-text">
                <p>Kishida 총리는 총리대신 관저에서 자유민주당 총재 선거 출마 불가에 대한 기자회견을 했습니다.</p>
            </div>
        </div>
    </li>
    <li>
        <div class="news-list-thum">
            <a href="/jp/101_kishida/actions/202408/13hyoukei.html"><img src="/jp/content/000154530.jpg" alt="파리 2024 올림픽 대회 일본 대표 선수단 표경"></a>
            </div>
            <div class="news-list-data">
                <div class="news-list-title">
                    <a href="/jp/101_kishida/actions/202408/13hyoukei.html">파리 2024 올림픽 대회 일본 대표 선수단 표경</a>
                </div>
            <div class="news-list-date">업데이트 날짜:令和6년8월13일</div>
            <div class="news-list-text">
                <p>Kishida 총리는 총리대신 관저에서 파리 2024 올림픽 대회 일본 대표 선수단 표경을 받았습니다.</p>
            </div>
        </div>
    </li>
</ul>
```

목록 형식으로 총리의 하루가 게시되어 있으며, 세부 페이지의 링크는 news-list-title 클래스 내의 a 태그를 따라가면 선택자로 링크를 얻을 수 있습니다. 따라서 선택자로 링크를 추출하여 목록에 모은 것을 반환하도록 했습니다.

```python
async def _extract_links(self, page: Page) -> List[str]:
    article_links = await page.query_selector_all("div.news-list-title a")
    links = []
    for link in article_links:
        if href := await link.get_attribute("href"):
            links.append(href)
    return links
```

문자 정보로 링크를 모아서 얻는 이유는, 제너레이터에 의한 페이지 전환을 할 때, 전환 전 페이지의 요소를 참조할 수 없게 되기 때문입니다. 따라서 요소에서 str 형식의 목록으로 변환하여 먼저 URL을 유지시키는 설명을 했습니다.

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
            # 에러가 발생한 경우 5분 대기
            print(f"Error fetching article content from {url}: {e}")
            await page.wait_for_timeout(5 * 60 * 1000.0)
            continue
    return ""
```

기사의 콘텐츠는 _get_article_content에서 얻습니다. section 클래스로부터 요소를 얻을 수 있지만, 개별 페이지는 JavaScript에 의해 동적으로 생성되며, API로 Raw 데이터가 제공되는 것이 아닙니다. 따라서 requests에 의한 처리보다 Selenium이나 Playwright와 같은 브라우저에서 렌더링시키는 방법이 기사를 쉽게 추출할 수 있습니다. 또한, 많은 액세스를 하면 콘텐츠에 액세스할 수 없게 되므로, 요소가 발견되지 않은 경우 5분의 슬립을 넣어 기사의 획득을 다시 시도하는 메커니즘을 만들었습니다. 얻은 콘텐츠에서 ‘더 읽기’나 여백 등 불필요한 문자를 제거하여, 기사의 데이터를 하나씩 반환하는 처리를 합니다.

### 자연어 처리

자연어 처리에는 MeCab에 의한 형태소 분석을 사용하고 있습니다. 신종 코로나 바이러스 등 최신 단어에도 대응하기 위해 ipadic-neologd를 사용하고 있습니다.

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
            if pos in ['명사', '동사', '형용사']:
                if pos == '동사':
                    # 동사의 경우 기본형(사전형)을 사용
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
    stop_words = ("令和", "平成", "년", "월", "일", "총리", "Kishida", "행우", "등")
    return [t for t in tokens if t not in stop_words]
```

단어의 카운터에는 dict의 확장형인 Counter를 사용하고 있습니다. Counter의 update 메서드에 분할한 단어의 목록을 전달하면 카운터에 단어의 추가나 카운트의 가산이 쉽게 됩니다. 그 목록을 만드는 처리에는 Mecab을 사용해 단어를 분할하여 명사·동사·형용사를 대상으로 단어를 집계합니다. 동사의 경우에만 원형의 상태로 반환하는 처리를 합니다. fil_token으로 의미 없는 단어를 제거하는 처리를 한 후 집계합니다.

### 워드 클라우드 생성

```python
import os
from wordcloud import WordCloud

def generate_wordcloud(word_freq, this_dir, filename="wordcloud.png", min_count=5):
    # 카운트 수가 min_count 이상인 단어만 필터링
    filtered_word_freq = {
        word: count for word, count in word_freq.items() if count >= min_count
    }

    # WordCloud 객체 생성
    font_path = f"{this_dir}/font/SawarabiGothic-Regular.ttf"
    wordcloud = WordCloud(
        width=1200,
        height=800,
        background_color="white",
        font_path=font_path,
        max_font_size=100,
        max_words=256,
    )

    # 필터링된 단어 빈도 데이터에서 워드 클라우드 생성
    wordcloud.generate_from_frequencies(filtered_word_freq)
    output_dir = f"{this_dir}/output"
    os.makedirs(output_dir, exist_ok=True)
    wordcloud.to_file(f"{output_dir}/{filename}")
```

wordcloud 모듈의 generate_from_frequencies에 딕셔너리 데이터를 전달하면 쉽게 워드 클라우드를 만들 수 있습니다. 워드 클라우드를 만들고 to_file로 이미지를 출력하여 워드 클라우드가 완성됩니다.

## 워드 클라우드 및 내용에 대해

워드 클라우드는 다음과 같이 완성되었습니다.

![wc](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud.png)

스톱 워드에 포함해야 할 워드가 있는 점, 다방면에 걸친 노력으로 인해 강한 편향이 없는 워드 클라우드가 되었으며, 읽기에는 주의가 필요했습니다. 대략적으로 4개의 주요 정책을 중심으로 5개의 노력을 하고 있는 것처럼 보였습니다.  

### 경제·재정

워드: 경제, 투자, 성장, 임금인상, 재정, 예산, 전략, 자본주의, Startup  
Kishida 내각의 주요 정책 중 하나로 ‘임금인상과 투자에 의한 소득과 생산성의 향상’이 있습니다. 테마와 관련된 키워드로는 경제가 588회 등장하여 총리의 하루에서 가장 중시하는 키워드처럼 보입니다. 2023년 12월의 소신 표명 연설에서도 ‘나는 무엇보다 경제에 중점을 두고 참가하겠습니다’라고 발언했습니다. 이 경제 관련 키워드가 가장 빈번하게 등장하는 것은 실제로 경제에 대한 노력을 모순 없이 수행하고 발신을 했던 것이라고 됩니다.

### 기술 혁신

워드: 디지털, 기술, 개발, 구축  
이것도 ‘임금인상과 투자에 의한 소득과 생산성의 향상’의 항목으로 인력 부족에 대한 대응이나 행정 포함 사회 전체의 효율화를 진행하여 중소기업의 버는 힘을 강화하는 것을 목표로 한 것입니다. 디지털의 등장 빈도는 300회 정도입니다. Startup의 140회 정도보다 많고, 임금인상의 360회보다는 적습니다. 디지털화는 임금인상처럼 즉효성이 높은 것이 아닙니다. 그러나 중소기업에서의 인력 부족이나 복잡한 작업의 효율화에 디지털화는 빠질 수 없으며, 장기적인 개선을 목적으로 디지털화를 중시하고 있는 것으로 생각합니다.

### 사회·국민 생활

워드: 사회, 국민, 생활, 자녀 양육, 의료, 여성  
생활·자녀 양육·의료는 130~140회 정도 등장하며, 사회는 410회 등장했습니다. 주요 정책의 2번째로 ‘중장기적으로 지속 가능한 사회 만들기’에 주로 관련되어 있습니다. 이의 실현에서 선진 기술이나 데이터의 활용 등을 들어 있으며, 기반에는 경제와 기술이 있습니다. 정책 중에는 신약 개발이나 간병도 있지만, 회수는 85회 이하가 되어 주요한 정책으로는 경제 주변에 있는 것으로 느꼈습니다. 한편, 자녀가 240회 정도 등장하여, 지속성의 관점에서 젊은 세대를 중시하는 정책을 수행한다고 생각됩니다.

### 국제·안보

워드: 국제, 세계, G7, 우크라이나, 안보  
주요 정책의 3번째로 ‘외교·안보’에 관한 키워드도 많이 다루고 있습니다. 국제나 우크라이나, 안보 등의 키워드가 100회 정도, G7이 200회입니다. 비중으로는 국민 생활보다 가벼운ものの, 주요 정책에 들어 있는 만큼 대외적으로 적극적인 자세를 보이고 있는 것으로 생각됩니다. 우크라이나의 128회는 미국(미국)의 105회보다 많아 우크라이나에 대한 관심이 강하게 나타나고 있습니다. 그 밖의, 기후 변화나 인권, 유엔, 인접한 중국 등의 키워드가 적고, Abe 전 총리의 지구를 조감하는 외교와 비교하면 편향이 있는 인상도 있습니다.

### 재해 관련

워드: 복구, 복구, 피해복지, 피해자, 대피  
각 워드로 100회 정도지만, 제4의 주요 정책 ‘국민 생활의 안전·안심’은 빈도로서 착실히 실행되고 있는 듯합니다. 이 정책 중에서는 우선 피해자와 피해복지의 지원이 첫 번째로, 그 다음에 방재가 옵니다. 감염병에 대한 대책도 이 정책의 곳에서 올라오지만, 코로나도 진정되고 피해에 대한 지원에 힘을 쏟고 있는 듯합니다.

### 기타

주요한 정책(전략)에 따라 하루를 보내고 있는 듯하며, 주요 정책에 해당하지 않는 특이한 빈도의 키워드는 발견되지 않았습니다. 일부러 말하자면, 어떤 교회에 대해서는 사회적으로 관심을 모았음에도 불구하고 소극적인 자세일 수 있습니다.

## 요약

크롤링·스크래핑·자연어 처리·워드 클라우드에 의한 시각화와 Python으로 광범위하게 일련의 처리를 했습니다. 지지율도 그다지 좋지 않은 상황이었고, 비자금 문제 등도 바람직하지 않게 생각합니다. 그래도, 워드의 빈도에서의 범위에서는, 경제를 가장 중시하는 자세에 모순은 없고 선순환을 만들기 위해 전략적으로 총리로서의 임무를 수행하고 있었던 것 같습니다. 3년 동안 고생하셨습니다. 또한, 이러한 가까운 주제로 여러분의 프로그래밍 학습에 도움이 되었으면 합니다.