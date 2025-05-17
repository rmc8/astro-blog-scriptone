---
title: "[Python] Retrieving Article Information from Dev Community (dev.to) via API"
slug: "introduction_devtopy"
description: "An introduction to the Python library 'devtopy' for automatically retrieving articles from the international tech community dev.to via API. This covers detailed explanations of library usage and API features, as well as possibilities for translation and summarization when combined with GPT-4o mini. By using devtopy, access to international tech information becomes easier, contributing to the improvement of programming skills."
date: 2024-07-30T02:00:07.288Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_eycatch.webp"
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

I created a library to automatically retrieve articles and more from the international tech community [dev.to](https://dev.to/) via API.

## Background

*Note: This section is lengthy, so feel free to skip it. If you're considering applications of the library, please read on.*

On July 18, 2024, with the announcement of GPT-4o mini, I was motivated to create a library to read international tech information. International tech information offers different ideas and trends compared to Japan, making it an attractive source distinct from Qiita or Zenn. In the programming world, it's said there's no silver bullet, meaning there's no single superior method; instead, flexibility to choose the optimal approach based on the situation is desirable. When looking at information in languages other than Japanese, the volume of English and other languages is vast, and beyond beginner-level introductory articles, you can expect unique topics and interests. From the perspective of developer flexibility and understanding excellent libraries, accessing international information is highly useful.

However, human capabilities have limits. Reading English, as well as Chinese, Korean, Arabic, and other languages, is challenging and costly. Becoming bilingual alone requires substantial study time, and for Japanese people, the significant language distance between Japanese and English makes it laborious to obtain large amounts of non-native information (even in Japanese, it's impractical to endlessly read through tech blog articles).

To address these issues, using GPT-4o mini is a viable option. Recently announced, `gpt-4o-mini-2024-07-18` has costs of $0.15 per 1 million input tokens and $0.60 per 1 million output tokens. Assuming a task to summarize an English article that takes about 5 minutes to read into 200 Japanese characters, we can estimate as follows:

* Input
  * English article of about 5 minutes: 5000-7500 tokens
  * Cost: $0.15 * (7,500 tokens / 1,000,000 tokens) = $0.001125
* Output
  * About 200 Japanese characters: 300-400 tokens
  * Cost: $0.60 * (400 tokens / 1,000,000 tokens) = $0.00024
* Total cost
  * Per article input/output cost: $0.001125 + $0.00024 = $0.001365
  * At 160 JPY per USD: 0.2184 JPY per article
  * At 150 JPY per USD: 0.20475 JPY per article
  * At 140 JPY per USD: 0.1911 JPY per article

The cost for translation and summarization per article is around 0.2 JPY. Translating and summarizing about 5000 articles would cost around 1000 JPY. At the article retrieval stage, by executing tasks only on articles with specific programming language tags and a certain number of positive reactions, you can significantly reduce the number of articles sent to the LLM. This creates an environment where popular articles can be read at low cost. GPT-4o mini offers performance superior to Claude 3 Haiku (sufficiently practical), so I decided to create a library for article retrieval as preprocessing, given that overseas articles are now in a readable state.

## Library Usage

### Installation

The library is uploaded to [PyPI](https://pypi.org/project/devtopy/) and can be installed using pip. Adjust the command based on your OS or environment. Example command:

```
pip install devtopy
```

### API Key Preparation

The API key can be generated on the [settings page](https://dev.to/settings/extensions) under DEV Community API Keys by clicking the 'Generate API Key' button. Be cautious not to leak the API key, as it allows access to your private account information. Here's a simple code example, but I recommend using environment variables or python-dotenv instead of hardcoding the string.

```python
import os
from devtopy import DevTo

api_key = os.getenv("DEVTO_API_KEY")  # Register the API key in an environment variable beforehand
client = DevTo(api_key=api_key)
```

### Retrieving Articles

You can retrieve the latest articles. The 'page' parameter sets the page number, and 'per_page' sets the number of articles per page (1-1000 range). The response is returned according to a Pydantic-defined type, so you can use IDE autocomplete to handle values. Here's an interactive mode example:

```python
>>> articles = client.articles.get_latest_articles(page=1, per_page=1)
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1940659, title='Embracing Surface-Level Understanding: A Key to Mastering Software Engineering', description='Theory can lead to experience by practice. However, theory without practice will not give us real...', readable_publish_date='Jul 30', slug='embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', path='/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T01:10:03Z', positive_reactions_count=0, cover_image=None, social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fu0ukjaq1f51xr4c0n3c4.png'), canonical_url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), created_at='2024-07-30T01:10:03Z', edited_at=None, crossposted_at=None, published_at='2024-07-30T01:10:03Z', last_comment_at='2024-07-30T01:10:03Z', reading_time_minutes=5, tag_list=[], tags='', user=User(name='Muhammad Salem', username='muhammad_salem', twitter_username=None, github_username=None, user_id=1234060, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png'), organization=None, flare_tag=None)])
```

Using the 'get' method, you can retrieve articles with filters like tags or usernames.

```python
>>> articles = client.articles.get(page=1, per_page=1, tag="python")
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1931086, title='Pre-Cloud Development Chatbot with Streamlit, Langchain, OpenAI and MongoDB Atlas Vector Search', description='Introduction   In this blog, I’ll discuss how I built a Retrieval-Augmented Generation (RAG)...', readable_publish_date='Jul 30', slug='pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', path='/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T00:26:40Z', positive_reactions_count=0, cover_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), canonical_url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), created_at='2024-07-21T20:00:34Z', edited_at='2024-07-30T00:45:58Z', crossposted_at=None, published_at='2024-07-30T00:26:40Z', last_comment_at='2024-07-30T00:26:40Z', reading_time_minutes=8, tag_list=['rag', 'pdftextextraction', 'python', 'vectordatabase'], tags='rag, pdftextextraction, python, vectordatabase', user=User(name='Amanda Ruzza', username='amandaruzza', twitter_username=None, github_username=None, user_id=1246885, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG'), organization=None, flare_tag=None)])
```

Since the retrieved articles include a 'positive_reactions_count' field, you can filter based on the number of reactions as mentioned in the background by referencing the retrieved articles (this is not handled at the API level).

### Other Features

The library supports most functions listed in the [API Document Ver1](https://developers.forem.com/api/v1).

* Publish or draft articles by sending them
* Update articles
* Retrieve your own articles
* Retrieve organization articles
* Retrieve organization users
* Retrieve articles from specific users
* Retrieve comments from articles or podcast episodes
* Retrieve comments by comment ID
* Retrieve information on followed tags
* Retrieve tag information
* Retrieve followers
* Retrieve podcast episodes
* Retrieve profile images
* Toggle reactions on/off
* Send reactions
* Retrieve articles with videos

## Summary

dev.to's API is simple but efficient for obtaining tech information. By combining it with AI like LLMs or programming, you can perform tasks such as natural language processing, translation, and summarization on tech information, helping you quickly grasp trends. With AI advancements, language barriers are gradually being overcome, so please access information from international communities and make use of it in your programming.

## Related Books

*Note: These are links to Amazon. They cover API handling and information retrieval from the web, not limited to APIs.*

* [Python2年生 スクレイピングのしくみ 第2版 体験してわかる！会話でまなべる！](https://www.amazon.co.jp/dp/4798182605?&linkCode=ll1&tag=rmc-8-22&linkId=4a1dc72f97c1dd130dbe78cfce68e030&language=ja_JP&ref_=as_li_ss_tl) *An introductory book that easily teaches web information retrieval and processing with Python*
* [Python+JSON データ活用の奥義](https://www.amazon.co.jp/dp/4802613938?&linkCode=ll1&tag=rmc-8-22&linkId=a7d3aa276cca47fa9918f8d402e0b51a&language=ja_JP&ref_=as_li_ss_tl) *A book on processing with Python and JSON; mastering JSON is important for API handling*
* [Python最速データ収集術 〜スクレイピングでWeb情報を自動で集める (IT×仕事術)](https://www.amazon.co.jp/dp/4297126419?&linkCode=ll1&tag=rmc-8-22&linkId=4a3242c286c3ba5f97b5720ab7a4da56&language=ja_JP&ref_=as_li_ss_tl) *More practical content than the above two books*
* [PythonによるWebスクレイピング 第2版](https://www.amazon.co.jp/dp/4873118719?&linkCode=ll1&tag=rmc-8-22&linkId=f798515761caf2f96c32cbd931170872&language=ja_JP&ref_=as_li_ss_tl) *Advanced level, includes practical information on scraping obstacles and traps, though some info like Selenium is from older versions*