---
title: "DevTo의 최신 1000개 기사에서 워드클라우드 만들기"
slug: "creating_wordcloud_from_devto"
description: "DevTo의 API에서 Python으로 기사를 가져와 워드클라우드를 만드는 방법에 대해 설명합니다. 최신 1000개 기사에서 워드클라우드를 만들어 그 경향을 분석하여 DevTo의 기술 커뮤니티 경향을 파악하고, DevTo와 같은 해외 기술 정보를 얻는 이점에 대해 논의합니다."
date: 2024-08-11T06:36:37.547Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_wordcloud_202407282354.webp"
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

전회에 Python용 [dev.to의 API를 조작하기 위한 라이브러리](https://rmc-8.com/introduction_devtopy)를 소개했습니다. 이 라이브러리를 사용하여 Wordcloud를 만들고, 직전 1000개 기사의 단어로 Wordcloud를 만듭니다.
  
## 리포지토리

GitHub 리포지토리는 다음과 같습니다.
<https://github.com/rmc8/devto_wordcloud>
  
## 코드 실행 방법

GitHub에서 클론하여 필요한 라이브러리를 도입합니다.

```shell
git clone https://github.com/yourusername/devto-word-cloud-generator.git
cd devto-word-cloud-generator
pip install -r requirements.txt
```

라이브러리를 정상적으로 도입하면 프로그램을 사용할 수 있습니다. src 안에 프로그램이 있지만, CLI로 프로그램을 실행하도록 만들어져 있습니다.
  
```shell
cd src
python main.py --article_count=25
```

article_count는 Wordcloud를 만들 때 기사를 얼마나 가져올지 설정하는 숫자입니다. 최대값으로 1000까지 설정 가능합니다.
  
## 코드 설명

devo_wordcloud에서는 주로 다음과 같은 처리를 수행합니다.

* DevTo에서 최신 기사의 리스트를 가져오기
* 기사 리스트에서 기사 ID를 추출하여 실제 기사 데이터를 가져오기
* 불필요한 단어를 제거하거나 원형의 영어 단어를 가져오기
* 가공한 단어로 워드를 카운트하기
* mask 이미지를 사용하여 Wordcloud를 만들 수 없는 위치를 지정하기
* mask 이미지를 반영하여 워드클라우드 만들기

### 기사 리스트 추출

기사는 라이브러리를 사용하여 쉽게 추출할 수 있습니다. 인스턴스화 시 API 키가 필요하지만, 키가 있으면 요청 처리는 라이브러리가 수행합니다.
  
```python
def fetch_articles(dt: DevTo, article_count: int) -> List[Dict]:
    """Fetch articles from DEV.to"""
    articles = dt.articles.get_latest_articles(page=1, per_page=article_count).articles
    logger.info(f"Fetched {len(articles)} articles from DEV.to")
    return articles
```

### 기사 가져오기

기사의 가져오기도 라이브러리에 의해 API 처리가 자동으로 수행됩니다.

```python
def process_article(dt: DevTo, article: Dict) -> str:
    """Process a single article and return processed text"""
    article_data = dt.articles.get_by_id(article.id)
    time.sleep(1)  # Rate limiting
    logger.debug(f"Processed article: {article.id}")
    return process_text(article_data.body_markdown)
```

대량으로 요청하는 경우도 있고, API 제한도 있으므로 요청 후 스크래핑과 마찬가지로 1초의 슬립을 두고 있습니다. 기사를 가져온 후, markdown 형식으로 간단한 자연어 처리를 수행합니다.

### 자연어 처리

가져온 기사에 대한 언어 처리는 nltk 등으로 수행합니다.

```python
def download_nltk_resources():
    """Download required NLTK resources"""
    for resource in ["punkt", "stopwords", "wordnet"]:
        nltk.download(resource, quiet=True)
    logger.info("NLTK resources downloaded successfully")
```

nltk로 필요한 데이터를 준비합니다. 영어 처리에서 불필요한 단어가 있습니다. 이를 제거하기 위해 stopwords를 사용합니다. 일본어에서도, '〜입니다.', '〜(주어)는', '감사합니다', '안녕하세요' 등 집계에 중요성이 낮은 단어가 존재합니다. 그런 유형의 것을 제거합니다. 또한, 영어에서는 동사가 다양한 형태로 변형되므로 이를 원형으로 되돌려야 합니다. 그 되돌리는 처리를 위한 어휘 정보를 wordnet에서 가져옵니다. 또한, punkt는 문장(세텐스)의 분할을 위해 사용합니다. 이 처리를 마친 후 word_tokenize로 소문자로 통합한 단어 분할을 수행합니다.

### 워드클라우드 생성

워드클라우드 생성에는 이미지 라이브러리의 PIL, 도표를 만드는 matplotlib, 마스크 이미지를 처리하기 위한 numpy의 계산 기능, 실제 워드클라우드를 만드는 wordcloud 라이브러리를 사용합니다.

```python
def create_wordcloud(word_counter: Dict[str, int]) -> None:
    """Generate and save a word cloud image"""
    mask = np.array(Image.open(MASK_IMG_PATH))

    wordcloud = WordCloud(
        width=1920,
        height=1920,
        background_color="white",
        mask=mask,
        contour_width=1,
        contour_color="steelblue",
    ).generate_from_frequencies(word_counter)

    plt.figure(figsize=(10, 10))
    plt.imshow(wordcloud, interpolation="bilinear")
    plt.axis("off")

    save_wordcloud_image()


def save_wordcloud_image() -> None:
    """Save the word cloud image to a file"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"wordcloud_{datetime.now():%Y%m%d%H%M}.png")
    plt.savefig(output_path, bbox_inches="tight", pad_inches=0, dpi=300)
    logger.info(f"WordCloud image saved to: {output_path}")
```

흑백의 그레이스케일 이미지를 준비하면 마스크 이미지로 사용할 수 있습니다. 이미지의 검은 부분에 워드를 표시하고, 흰 부분에는 워드를 표시하지 않는 마스크 처리를 할 수 있습니다. 이미지를 열고, numpy의 array 형식으로 변환하여 마스크를 만듭니다. 워드클라우드를 만들 때 mask를 전달하여 마스크를 반영한 Wordcloud를 만들 수 있습니다. 만든 Wordcloud를 matplotlib에 전달하여 그리기, 이를 저장하여 Wordcloud가 완성됩니다.

## 실제 워드클라우드

8월 9일 18시에 1000개 분의 기사를 가져와 워드클라우드를 만든 것은 다음과 같은 트리입니다.

![word cloud](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud/wordcloud_202408091835.png)

워드를 보면, http, account, data, use, application이 눈에 띕니다. 언어 또는 프레임워크에서는 python이나 javascript, react 등이 존재합니다. 또한 API 등의 워드도 포함되어 있으며, 인상으로는 web 개발 주변의 주제의 관련성이 높아 보입니다. web 주위는 발전이나 트렌드의 변화가 매우 빠른 분야인 반면, TypeScript나 우수한 web 프레임워크의 등장, 백엔드에서도 Python이나 Go 언어 등 손쉬운 언어도 등장하여 데이터의 전달, 가공, AI의 이용이 가능합니다. web라면 OS나 단말기의 종류를 가리지 않고 널리 다룰 수 있고, 스마트폰 앱을 위해 API를 만들어 앱을 만드는 것도 가능하므로 web 주위의 기술이 강해 보입니다. 좋아하는 언어·프레임워크로 원하는 것을 만들면 좋지만, 만들고 싶은 것이 없을 때는 범용성이나 수요의 높음의 관점에서 JavaScript나 TypeScript, Python에 접해 보는 것도 좋을 것 같습니다.

## 요약

이번에는 devto에서 다량의 기사를 추출하여 Wordcloud를 만들어 보았습니다. web 주위나 데이터와 관련된 영역에 현재 관심이 향하고 있으며, 범용성 높은 메커니즘에 대한 정보를 모으기 쉬운 점에서 DevTo를 읽는 즐거움을 느낍니다. 이번에는 워드클라우드를 만들었지만 이미 생성 AI를 사용하여 Discord에 일본어 요약을 전달하는 메커니즘을 만들고 있습니다. GPT 4o-mini나 Gemini1.5 Flash 등 매우 저렴하면서도 충분히 실용적인 모델도 등장하고 있으며, 앞으로 해외 기술 정보에 대한 접근도 매우 용이해질 것 같습니다. 이 기사의 후속으로 곧 LLM을 사용한 정보 수집에 대한 설명을 하겠습니다.