---
title: "【Python】Dev community (dev.to)에서 API로 기사 정보 등을 가져오기"
slug: "introduction_devtopy"
description: "해외 기술 커뮤니티 dev.to에서 API를 통해 자동으로 기사를 가져오는 Python 라이브러리 'devtopy' 소개. 라이브러리 사용 방법과 API 기능을 자세히 설명. 또한, GPT-4o mini와의 조합으로 번역 및 요약의 가능성에 대해서도 언급. devtopy를 활용하면 해외 기술 정보에 쉽게 접근할 수 있어 프로그래밍 기술 향상에 기여합니다."
date: 2024-07-30T02:00:07.288Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_eycatch.webp"
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

해외 기술 커뮤니티 [dev.to](https://dev.to/)에서 API를 통해 자동으로 기사 등을 가져오기 위한 라이브러리를 만들었습니다.  

## 배경

※길어지니 건너뛰어도 괜찮습니다. 라이브러리의 응용 방법을 고려하는 분들은 꼭 읽어주세요.  
  
2024년 7월 18일에 발표된 GPT-4o mini를 이용해 해외 기술 정보를 읽고 싶어 라이브러리를 만들었습니다. 해외 기술 정보는 일본과는 다른 아이디어나 트렌드가 있어서, Qiita나 Zenn과는 또 다른 매력적인 정보원입니다. 프로그래밍 세계에서는 '은의 총알'이 없다고 말하듯, 유일한 우수한 방법은 없고 상황에 따라 최적의 방법을 선택하는 유연성이 바람직합니다. 일본어 이외의 정보로 보자면, 영어 또는 다른 언어의 양이 많아서 초보자용 입문 기사가 아니면 독특한 주제나 관심사를 기대할 수 있습니다. 개발자로서의 유연성과 우수한 라이브러리 이해의 관점에서 해외 정보를 얻는 것은 매우 유용합니다.  
  
그러나 인간의 지혜에는 한계가 있습니다. 영어를 읽을 수 있어도 중국어, 한국어, 아랍어, 그 밖의 모든 언어를 읽는 것은 어렵고 비용이 많이 듭니다. 이중 언어를 익히는 것만으로도 상당한 공부 시간이 필요하며, 특히 일본인에게는 일본어와 영어의 차이(언어 간 거리)가 커서 대량의 모국어 이외의 정보를 얻는 것은 유용하지만 번거롭습니다(일본어로 기술 블로그 기사를 무한정 읽는 것도 불가능합니다).  
  
이러한 문제를 해결하기 위한 수단으로 GPT-4o mini의 이용이 있습니다. 최근 발표된 `gpt-4o-mini-2024-07-18`의 100만 토큰당 비용은 입력에서 $0.15, 출력에서 $0.60입니다. 가정컨대 평균 5분 정도 읽는 데 걸리는 영문이 있고, 이를 200자 정도의 일본어로 요약하는 작업을 한다고 하면, 다음과 같이 계산할 수 있습니다.  

* 입력
  * 5분 정도의 영문: 5000-7500 토큰
  * 비용: $0.15 * (7,500 토큰 / 1,000,000 토큰) = $0.001125
* 출력
  * 200자 정도의 일본어: 300-400 토큰
  * 비용: $0.60 * (400 토큰 / 1,000,000 토큰) = $0.00024
* 비용 합계
  * 1기사당 입출력 비용: $0.001125 + $0.00024 = $0.001365
  * 1달러=160엔 경우: 0.2184엔/1기사
  * 1달러=150엔 경우: 0.20475엔/1기사
  * 1달러=140엔 경우: 0.1911엔/1기사

1기사당 번역 및 요약 비용이 0.2엔 정도입니다. 5000기사 정도를 번역+요약시키면 1000엔 정도의 비용이 됩니다. 기사의 획득 단계에서 특정 프로그래밍 언어의 태그와 일정 수의 긍정적인 반응이 있는 기사에 대해 작업을 실행하도록 하면 실제로 LLM에 작업을 요청하는 기사를 크게 줄일 수 있습니다. 저비용으로 인기 있는 기사를 읽을 수 있는 환경을 만들 수 있습니다. GPT-4o mini는 Claude3 Haiku보다 우수(충분히 실용적)한 성능을 가지고 있어서 해외 기사를 읽기 쉬운 상황임을 알았으므로, 전처리를 위해 기사 획득 라이브러리를 만들었습니다.  

## 라이브러리 사용 방법

### 설치

라이브러리는 [PyPI](https://pypi.org/project/devtopy/)에 업로드되어 pip으로 설치할 수 있습니다. 명령어 예는 다음과 같지만, OS나 환경에 따라 명령어를 변경하세요.  

```
pip install devtopy
```

### API 키 준비

API 키는 [설정 페이지](https://dev.to/settings/extensions)의 DEV Community API Keys에서 'Generate API Key' 버튼을 눌러 발급받을 수 있습니다. API 키를 사용하면 자신의 계정의 Private한 정보에도 접근할 수 있으므로 제3자에게 유출되지 않도록 주의하세요. 간단한 코드 예를 보여드리지만, API 키는 환경 변수나 python-dotenv 등을 사용해 직접 문자열로 작성하지 않는 것을 추천합니다.  

```python
import os
from devtopy import DevTo

api_key = os.getenv("DEVTO_API_KEY")  # 미리 환경 변수에 API 키를 등록하세요
client = DevTo(api_key=api_key)
```

### 기사의 획득

최근 기사를 획득할 수 있습니다. page는 페이지 번호, per_page는 1페이지당 기사의 수를 1~1000 범위로 설정할 수 있습니다. 아래는 대화 모드에서 출력한 예지만, 응답은 Pydantic으로 정의된 타입에 따라 반환되므로 IDE의 자동 완성 기능을 사용해 값을 다룰 수 있습니다.  

```python
>>> articles = client.articles.get_latest_articles(page=1, per_page=1)
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1940659, title='Embracing Surface-Level Understanding: A Key to Mastering Software Engineering', description='Theory can lead to experience by practice. However, theory without practice will not give us real...', readable_publish_date='Jul 30', slug='embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', path='/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T01:10:03Z', positive_reactions_count=0, cover_image=None, social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fu0ukjaq1f51xr4c0n3c4.png'), canonical_url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), created_at='2024-07-30T01:10:03Z', edited_at=None, crossposted_at=None, published_at='2024-07-30T01:10:03Z', last_comment_at='2024-07-30T01:10:03Z', reading_time_minutes=5, tag_list=[], tags='', user=User(name='Muhammad Salem', username='muhammad_salem', twitter_username=None, github_username=None, user_id=1234060, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png'), organization=None, flare_tag=None)])
```

get 메서드를 사용하면 태그나 사용자 이름 등의 필터를 적용해 기사를 획득할 수 있습니다.  

```python
>>> articles = client.articles.get(page=1, per_page=1, tag="python")
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1931086, title='Pre-Cloud Development Chatbot with Streamlit, Langchain, OpenAI and MongoDB Atlas Vector Search', description='Introduction   In this blog, I’ll discuss how I built a Retrieval-Augmented Generation (RAG)...', readable_publish_date='Jul 30', slug='pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', path='/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T00:26:40Z', positive_reactions_count=0, cover_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), canonical_url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), created_at='2024-07-21T20:00:34Z', edited_at='2024-07-30T00:45:58Z', crossposted_at=None, published_at='2024-07-30T00:26:40Z', last_comment_at='2024-07-30T00:26:40Z', reading_time_minutes=8, tag_list=['rag', 'pdftextextraction', 'python', 'vectordatabase'], tags='rag, pdftextextraction, python, vectordatabase', user=User(name='Amanda Ruzza', username='amandaruzza', twitter_username=None, github_username=None, user_id=1246885, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG'), organization=None, flare_tag=None)])
```

기사를 획득하면 positive_reactions_count라는 항목이 있으므로, 배경에서 언급한 반응 수로 필터링하는 작업은 획득한 기사를 참조해 필터링할 수 있습니다(API 수준에서는 지원되지 않습니다).  

### 기타 기능

기타에도 [API Document Ver1](https://developers.forem.com/api/v1)에 게시된 대부분의 기능에 대응하고 있습니다.  

* 기사를 보내 공개하거나 초안 상태로 만들기
* 기사 업데이트
* 자신의 기사 획득
* 조직의 기사 획득
* 조직의 사용자 획득
* 특정 사용자의 기사 획득
* 기사나 팟캐스트 에피소드에서 댓글 획득
* 댓글 ID에서 댓글 획득
* 팔로우 중인 태그의 정보 획득
* 태그의 정보 획득
* 팔로워 획득
* 팟캐스트 에피소드 획득
* 프로필 이미지 획득
* 반응의 ON/OFF 전환
* 반응 보내기
* 동영상 첨부 기사 획득

## 요약

dev.to의 API 기능은 간단하지만 충분히 효율적으로 기술 정보를 얻을 수 있습니다. 또한, LLM 등의 AI나 프로그래밍과 결합해 기술 정보를 사용한 자연어 처리나 번역, 요약 등의 작업을 수행해 기술 트렌드를 빠르게 파악하는 데 기여합니다. AI의 발전으로 언어의 장벽도 점차 해소되고 있으므로 해외 커뮤니티의 정보에도 접근해 프로그래밍에 활용하시기 바랍니다.  

## 관련 도서

※ Amazon 링크입니다. API 처리 방법이나 API에 국한되지 않는 웹에서 정보 획득에 관한 도서 정보입니다.  

* [Python2年生 スクレイピングのしくみ 第2版 体験してわかる！会話でまなべる！](https://www.amazon.co.jp/dp/4798182605?&linkCode=ll1&tag=rmc-8-22&linkId=4a1dc72f97c1dd130dbe78cfce68e030&language=ja_JP&ref_=as_li_ss_tl) ※Python을 사용한 웹 정보 획득이나 정형 처리를 쉽게 배울 수 있는 입문서입니다
* [Python+JSON データ活用の奥義](https://www.amazon.co.jp/dp/4802613938?&linkCode=ll1&tag=rmc-8-22&linkId=a7d3aa276cca47fa9918f8d402e0b51a&language=ja_JP&ref_=as_li_ss_tl) ※Python과 JSON의 조합으로 다양한 처리를 수행하는 도서입니다. JSON 처리는 API를 다룰 때 중요하니 익히는 것이 좋습니다
* [Python最速データ収集術 〜スクレイピングでWeb情報を自動で集める (IT×仕事術)](https://www.amazon.co.jp/dp/4297126419?&linkCode=ll1&tag=rmc-8-22&linkId=4a3242c286c3ba5f97b5720ab7a4da56&language=ja_JP&ref_=as_li_ss_tl) ※위의 두 도서보다 더 실전적인 내용을 배울 수 있습니다
* [PythonによるWebスクレイピング 第2版](https://www.amazon.co.jp/dp/4873118719?&linkCode=ll1&tag=rmc-8-22&linkId=f798515761caf2f96c32cbd931170872&language=ja_JP&ref_=as_li_ss_tl) ※상급자용, Selenium 등 오래된 버전의 정보가 있지만 스크레이핑의 방해나 함정에 관한 실전적인 정보가 포함됩니다