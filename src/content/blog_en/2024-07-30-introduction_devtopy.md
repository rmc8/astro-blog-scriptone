---
title: "[Python] Obtaining Article Information from Dev Community (dev.to) via API"
slug: introduction_devtopy
description: Introduction to the Python library "devtopy" for automatically obtaining articles from the overseas tech community dev.to via API. It explains the usage and features of the library in detail. It also mentions the possibilities of translation and summarization by combining with GPT-4o mini. By using devtopy, access to overseas tech information becomes easier, contributing to the improvement of programming skills.
date: 2024-07-30T02:00:07.288Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_eycatch.webp
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

# [Python] Obtaining Article Information from Dev Community (dev.to) via API

I created a library to automatically obtain articles from the overseas tech community [dev.to](https://dev.to/) via API.

## Background

*This section is long, so feel free to skip it. If you're thinking about how to apply the library, please read it.*

On July 18, 2024, I wanted to read overseas tech information using the announced GPT-4o mini, so I created this library. Overseas tech information has different ideas and trends from Japan, so it has charm as a different information source from Qiita or Zenn. In the programming world, it's said that there is no silver bullet, so it's desirable to have flexibility to choose the optimal method according to the situation. When looking at information in languages other than Japanese, the number of English and other languages is large, and for articles that are not beginner introductions, you can expect unique topics and interests. From the perspective of flexibility as a developer and understanding of excellent libraries, obtaining overseas information is very useful.

However, human wisdom has limits. Reading English, as well as Chinese, Korean, Arabic, and all other languages, is difficult and very costly. Becoming bilingual alone requires a corresponding amount of study time, and especially for Japanese people, due to the difference in Japanese and English (the large language distance), obtaining a large amount of information in languages other than the mother tongue is useful but time-consuming (you can't endlessly read tech blog articles even in Japanese).

As a means to address this problem, the use of GPT-4o mini is mentioned. Recently announced `gpt-4o-mini-2024-07-18` has a cost of $0.15 per 1 million tokens for input and $0.60 for output. Assuming a task to summarize an English text that takes about 5 minutes to read into 200 Japanese characters, it can be calculated as follows.

* Input
  * English text of about 5 minutes: 5000-7500 tokens
  * Cost: $0.15 * (7,500 tokens / 1,000,000 tokens) = $0.001125
* Output
  * About 200 Japanese characters: 300-400 tokens
  * Cost: $0.60 * (400 tokens / 1,000,000 tokens) = $0.00024
* Total cost
  * Per article input/output cost: $0.001125 + $0.00024 = $0.001365
  * If 1 USD = 160 JPY: 0.2184 JPY per article
  * If 1 USD = 150 JPY: 0.20475 JPY per article
  * If 1 USD = 140 JPY: 0.1911 JPY per article

The cost for translation and summarization per article is around 0.2 JPY. Translating and summarizing about 5000 articles would cost around 1000 JPY. By executing tasks only on articles with specific programming language tags and a certain number of positive reactions, you can significantly reduce the number of articles for which you actually request the LLM. This means you can create an environment to read popular articles at low cost. GPT-4o mini has performance superior to Claude3 Haiku (sufficiently practical), so I understood that it's in a situation where overseas articles can be read easily, and thus I decided to make a library for article acquisition as preprocessing.

## How to Use the Library

### Installation

The library is uploaded to [PyPI](https://pypi.org/project/devtopy/) and can be installed using pip. Please modify the command according to your OS or environment.

```
pip install devtopy
```

### Preparing the API Key

The API key can be issued by going to the [settings page](https://dev.to/settings/extensions) and clicking the "Generate API Key" button under DEV Community API Keys. Be careful not to leak the API key to third parties as it allows access to your private information. Here is a simple code example, but I recommend using environment variables or python-dotenv instead of writing the string directly.

```python
import os
from devtopy import DevTo
api_key = os.getenv("DEVTO_API_KEY")  # Please register the API key in the environment variable beforehand
client = DevTo(api_key=api_key)
```

### Obtaining Articles

You can obtain the latest articles. The page parameter specifies the page number, and per_page specifies the number of articles per page in the range of 1-1000. The following is output in interactive mode, but the response is returned according to the type defined by Pydantic, so you can handle values using IDE's completion function.

```python
>>> articles = client.articles.get_latest_articles(page=1, per_page=1)
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1940659, title='Embracing Surface-Level Understanding: A Key to Mastering Software Engineering', description='Theory can lead to experience by practice. However, theory without practice will not give us real...', readable_publish_date='Jul 30', slug='embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', path='/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T01:10:03Z', positive_reactions_count=0, cover_image=None, social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fu0ukjaq1f51xr4c0n3c4.png'), canonical_url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), created_at='2024-07-30T01:10:03Z', edited_at=None, crossposted_at=None, published_at='2024-07-30T01:10:03Z', last_comment_at='2024-07-30T01:10:03Z', reading_time_minutes=5, tag_list=[], tags='', user=User(name='Muhammad Salem', username='muhammad_salem', twitter_username=None, github_username=None, user_id=1234060, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png'), organization=None, flare_tag=None)])
```

You can use the get method to obtain articles with filters such as tags or usernames.

```python
>>> articles = client.articles.get(page=1, per_page=1, tag="python")
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1931086, title='Pre-Cloud Development Chatbot with Streamlit, Langchain, OpenAI and MongoDB Atlas Vector Search', description='Introduction   In this blog, I’ll discuss how I built a Retrieval-Augmented Generation (RAG)...', readable_publish_date='Jul 30', slug='pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', path='/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T00:26:40Z', positive_reactions_count=0, cover_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), canonical_url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), created_at='2024-07-21T20:00:34Z', edited_at='2024-07-30T00:45:58Z', crossposted_at=None, published_at='2024-07-30T00:26:40Z', last_comment_at='2024-07-30T00:26:40Z', reading_time_minutes=8, tag_list=['rag', 'pdftextextraction', 'python', 'vectordatabase'], tags='rag, pdftextextraction, python, vectordatabase', user=User(name='Amanda Ruzza', username='amandaruzza', twitter_username=None, github_username=None, user_id=1246885, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG'), organization=None, flare_tag=None)])
```

Since there is an item called positive_reactions_count when obtaining articles, you can filter by the number of reactions as mentioned in the background by referring to the obtained articles (not supported at the API level).

### Other Features

It supports most of the functions listed in the [API Document Ver1](https://developers.forem.com/api/v1).

* Send and publish or draft articles
* Update articles
* Obtain your own articles
* Obtain organization's articles
* Obtain organization's users
* Obtain specific user's articles
* Obtain comments from articles or podcast episodes
* Obtain comments by comment ID
* Obtain information on followed tags
* Obtain tag information
* Obtain followers
* Obtain podcast episodes
* Obtain profile images
* Switch reactions ON/OFF
* Send reactions
* Obtain articles with videos

## Summary

The dev.to API is simple but sufficiently efficient for obtaining tech information. By combining it with AI like LLM or programming, you can perform tasks such as natural language processing, translation, and summarization of tech information, which helps in quickly grasping tech trends. As AI develops, language barriers are gradually being resolved, so please access information from overseas communities and use it for programming.

## Related Books

* [Python2年生 スクレイピングのしくみ 第2版 体験してわかる！会話でまなべる！](https://www.amazon.co.jp/dp/4798182605?&linkCode=ll1&tag=rmc-8-22&linkId=4a1dc72f97c1dd130dbe78cfce68e030&language=ja_JP&ref_=as_li_ss_tl) *An introductory book that easily learns web information acquisition and formatting processing using Python*
* [Python+JSON データ活用の奥義](https://www.amazon.co.jp/dp/4802613938?&linkCode=ll1&tag=rmc-8-22&linkId=a7d3aa276cca47fa9918f8d402e0b51a&language=ja_JP&ref_=as_li_ss_tl) *A book that performs various processes with Python and JSON. Handling JSON is important when dealing with APIs, so it's good to get used to it here*
* [Python最速データ収集術 〜スクレイピングでWeb情報を自動で集める (IT×仕事術)](https://www.amazon.co.jp/dp/4297126419?&linkCode=ll1&tag=rmc-8-22&linkId=4a3242c286c3ba5f97b5720ab7a4da56&language=ja_JP&ref_=as_li_ss_tl) *You can learn more practical content than the above two books*
* [PythonによるWebスクレイピング 第2版](https://www.amazon.co.jp/dp/4873118719?&linkCode=ll1&tag=rmc-8-22&linkId=f798515761caf2f96c32cbd931170872&language=ja_JP&ref_=as_li_ss_tl) *For advanced users, it includes practical information on scraping obstacles and traps, although there is information on older versions like Selenium*