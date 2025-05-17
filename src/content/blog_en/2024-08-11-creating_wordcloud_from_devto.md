---
title: "Creating a Word Cloud from the Latest 1000 Articles on DevTo"
slug: "creating_wordcloud_from_devto"
description: "This explains how to obtain articles from DevTo's API using Python and create a word cloud. By creating a word cloud from the latest 1000 articles and interpreting its trends, we examine the tendencies of the DevTo tech community and the benefits of obtaining tech information from overseas sources like DevTo."
date: 2024-08-11T06:36:37.547Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_wordcloud_202407282354.webp"
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

Previously, I introduced a [library for operating dev.to's API with Python](https://rmc-8.com/introduction_devtopy). Using this, we'll create a WordCloud from the most recent 1000 articles.

## Repository

The GitHub repository is as follows:
<https://github.com/rmc8/devto_wordcloud>

## How to Run the Code

Clone from GitHub and install the required libraries.

```shell
git clone https://github.com/yourusername/devto-word-cloud-generator.git
cd devto-word-cloud-generator
pip install -r requirements.txt
```

Once the libraries are installed successfully, the program is ready to use. The program is in the src directory, and it's designed to be run via CLI.

```shell
cd src
python main.py --article_count=25
```

The article_count sets the number of articles to fetch for creating the WordCloud. The maximum value is 1000.

## Code Explanation

In devto_wordcloud, the following processes are mainly performed:

* Fetch the latest articles list from DevTo
* Extract article IDs from the list and fetch the actual article data
* Remove unnecessary words or get the base form of English words
* Count the words after processing
* Specify areas where WordCloud cannot be created using a mask image
* Create the WordCloud with the mask image reflected

### Extracting Article List

Articles can be easily extracted using the library. An API key is required for instantiation, and once you have the key, the library handles the request process.

```python
def fetch_articles(dt: DevTo, article_count: int) -> List[Dict]:
    """Fetch articles from DEV.to"""
    articles = dt.articles.get_latest_articles(page=1, per_page=article_count).articles
    logger.info(f"Fetched {len(articles)} articles from DEV.to")
    return articles
```

### Obtaining Articles

Fetching articles is also automated by the library for API processing.

```python
def process_article(dt: DevTo, article: Dict) -> str:
    """Process a single article and return processed text"""
    article_data = dt.articles.get_by_id(article.id)
    time.sleep(1)  # Rate limiting
    logger.debug(f"Processed article: {article.id}")
    return process_text(article_data.body_markdown)
```

In cases where there are many requests, and considering API limits, a 1-second sleep is added after requests, similar to scraping. After obtaining the article, simple natural language processing is performed on the markdown format.

### Natural Language Processing

Language processing for the obtained articles is done using nltk, etc.

```python
def download_nltk_resources():
    """Download required NLTK resources"""
    for resource in ["punkt", "stopwords", "wordnet"]:
        nltk.download(resource, quiet=True)
    logger.info("NLTK resources downloaded successfully")
```

We prepare the necessary data with nltk. In English processing, there are unnecessary words, so we use stopwords to remove them. Even in Japanese, there are words like 'desu' or 'wa' that are low in importance for aggregation. We remove such words. Also, for English, verbs change forms, so we need to revert them to their base form. We obtain the vocabulary information for that from wordnet. Punkt is used for sentence segmentation. After these processes, we perform word tokenization in lowercase using word_tokenize.

### Creating the Word Cloud

For creating the word cloud, we use image libraries like PIL, matplotlib for charts, numpy for mask image processing, and the wordcloud library.

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

You can use a black and white grayscale image as a mask image. This allows masking to display words only in the black areas of the image and not in the white areas. Open the image, convert it to a numpy array to create the mask. By passing the mask when creating the WordCloud, you can create a WordCloud with the mask reflected. Draw it with matplotlib and save it to complete the WordCloud.

## Actual Word Cloud

At 18:00 on August 9, we fetched 1000 articles and created the following word cloud.

![word cloud](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud/wordcloud_202408091835.png)

Looking at the words, "http", "account", "data", "use", "application" stand out. For languages or frameworks, "python", "javascript", "react", etc., are present. Words like "API" are also included, giving the impression that topics around web development are highly related. While the web field is one where development and trends change very quickly, with the advent of TypeScript and excellent web frameworks, and easy languages like Python or Go for the backend, it's possible to easily deliver, process data, and use AI. Web allows handling across various OS and devices, and you can create APIs for smartphone apps, so web-related technologies seem strong. I think it's good to create what you want with your favorite language or framework, but if you're unsure what to make, it's worth trying JavaScript, TypeScript, or Python from the perspectives of versatility and high demand.

## Summary

In this article, we extracted a large number of articles from devto and created a Wordcloud. It seems that there is current interest in areas related to web and data, and DevTo makes it easy to gather information on highly versatile mechanisms, which I find enjoyable. We've already set up a system using generative AI to deliver Japanese summaries to Discord. With very affordable yet practical models like GPT 4o-mini or Gemini 1.5 Flash emerging, access to overseas tech information will become even easier in the future. As a follow-up to this article, I'll soon explain information gathering using LLMs.