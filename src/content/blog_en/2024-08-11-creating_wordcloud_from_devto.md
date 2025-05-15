---
title: Creating a Word Cloud from the Latest 1000 Articles on DevTo
slug: creating_wordcloud_from_devto
description: This article explains how to fetch articles from the DevTo API using Python and create a word cloud. By generating a word cloud from the latest 1000 articles and analyzing its trends, we can observe the tendencies of the DevTo tech community and consider the benefits of accessing international tech information.
date: 2024-08-11T06:36:37.547Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_wordcloud_202407282354.webp
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

# Creating a Word Cloud from the Latest 1000 Articles on DevTo

In the previous article, I introduced a [library for operating the dev.to API with Python](https://rmc-8.com/introduction_devtopy). Using this, I will create a WordCloud from the most recent 1000 articles.

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

Once the libraries are installed successfully, the program is ready to use. The program is located in the src directory and is designed to be run via CLI.

```shell
cd src
python main.py --article_count=25
```

The article_count parameter sets the number of articles to fetch for creating the WordCloud. The maximum value is 1000.

## Code Explanation

In devto_wordcloud, the following processes are mainly performed:

* Fetch the latest articles list from DevTo
* Extract article IDs from the list and fetch the actual article data
* Remove unnecessary words or convert them to their base English form
* Count the processed words
* Specify areas where the WordCloud cannot be created using a mask image
* Generate the WordCloud with the mask image applied

### Extracting the Article List

Articles can be easily fetched using the library. An API key is required for instantiation, and once provided, the library handles the request process.

```python
def fetch_articles(dt: DevTo, article_count: int) -> List[Dict]:
    """Fetch articles from DEV.to"""
    articles = dt.articles.get_latest_articles(page=1, per_page=article_count).articles
    logger.info(f"Fetched {len(articles)} articles from DEV.to")
    return articles
```

### Fetching Articles

Fetching articles is also automated by the library for API handling.

```python
def process_article(dt: DevTo, article: Dict) -> str:
    """Process a single article and return processed text"""
    article_data = dt.articles.get_by_id(article.id)
    time.sleep(1)  # Rate limiting
    logger.debug(f"Processed article: {article.id}")
    return process_text(article_data.body_markdown)
```

This may involve multiple requests, and considering API limits, a 1-second sleep is added after each request, similar to scraping. After fetching the article, basic natural language processing is performed on the markdown content.

### Natural Language Processing

Language processing on the fetched articles is done using nltk.

```python
def download_nltk_resources():
    """Download required NLTK resources"""
    for resource in ["punkt", "stopwords", "wordnet"]:
        nltk.download(resource, quiet=True)
    logger.info("NLTK resources downloaded successfully")
```

For English processing, unnecessary words are removed using stopwords. In Japanese, words like 'desu' or 'wa' are low-priority for aggregation. Additionally, English verbs can change forms, so they are converted back to their base form using wordnet. Punkt is used for sentence segmentation. After these processes, word_tokenize is used to convert to lowercase and split into words.

### Creating the WordCloud

To create the WordCloud, libraries such as PIL for images, matplotlib for plots, numpy for computations, and the wordcloud library are used.

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

A grayscale image can be used as a mask. Words are displayed on the black areas of the image and not on the white areas. The image is opened and converted to a numpy array to create the mask. By passing the mask to WordCloud, it applies the mask. The generated WordCloud is then plotted with matplotlib and saved.

## Actual WordCloud

At 18:00 on August 9, I fetched 1000 articles and created the following WordCloud.

![word cloud](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud/wordcloud_202408091835.png)

The prominent words include http, account, data, use, and application. In terms of languages or frameworks, python, javascript, and react are present. Words like API are also included, suggesting a strong focus on web development topics. Web development is a rapidly evolving field with quick trends, while the emergence of TypeScript and excellent web frameworks, along with backend languages like Python or Go, makes it easy to handle data delivery, processing, and AI integration. Web technologies are versatile across OS and devices, and you can create APIs for smartphone apps. Thus, it appears strong in web-related areas. If you're unsure what to build, trying JavaScript, TypeScript, or Python for their versatility and demand might be a good idea.

## Summary

In this article, I fetched a large number of articles from devto and created a WordCloud. It shows current interest in web and data-related areas, and DevTo makes it easy to gather information on versatile mechanisms. While I created a WordCloud here, I've already set up a system using generative AI to deliver Japanese summaries on Discord. Models like GPT 4o-mini or Gemini 1.5 Flash are affordable and practical, making access to international tech information easier in the future. As a follow-up to this article, I'll soon explain information gathering using LLMs.