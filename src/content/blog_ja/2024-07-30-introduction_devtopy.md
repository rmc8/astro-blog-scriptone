---
title: "【Python】Dev community (dev.to)からAPIで記事情報などを取得する"
slug: "introduction_devtopy"
description: "海外の技術コミュニティdev.toからAPIを介して自動で記事を取得するPythonライブラリ「devtopy」の紹介。ライブラリの使用方法やAPIの機能を詳しく解説。また、GPT-4o miniとの組み合わせによる翻訳・要約の可能性についても言及。devtopyを活用することで、海外の技術情報へのアクセスが容易になり、プログラミングスキルの向上に貢献します。"
date: 2024-07-30T02:00:07.288Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_eycatch.webp"
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

海外の技術コミュニティの[dev.to](https://dev.to/)からAPIを介して自動で記事などを取得するためのライブラリを作りました。  

## 背景

※長くなりますので読み飛ばしていただいても大丈夫です。ライブラリの応用方法を考えている方はぜひお読みください。  
  
2024年7月18日に発表されたたGPT-4o miniを利用して海外の技術情報を読みたくなりライブラリを作りました。海外の技術情報は日本とは異なる発想や流行があるので、QiitaやZennとはまた違った情報源としての魅力があります。プログラミングの世界では銀の弾丸がないと言われるように唯一の優れた手法というものはなく、状況に合わせて最適な方法を選択する柔軟性があると望ましいです。日本語以外の情報ということで見ると、英語やその他の言語の母数は大きく、初心者用の入門記事などでなければ独自の話題や関心も期待できます。開発者としての柔軟性や優れたライブラリの理解の観点から、海外の情報を得ていくことは非常に有用です。  
  
しかしながら、人間の知恵には限度があります。英語も読めて中国や韓国・アラビア、その他のあらゆる言語を読むというのは困難で非常にコストがかかります。バイリンガルになるだけでもそれ相応の勉強時間が必要で、とくに日本人にとっては日本語と英語の違いの差（言語間距離の大きさ）から、大量の母国語以外の情報を得ていくことは有用であっても手間がかかります（日本語でも技術ブログの記事を際限読みあさるわけにはいきません）。  
  
こうした問題に対応をする手段としてGPT-4o miniの利用が挙げられます。最近になって発表された`gpt-4o-mini-2024-07-18`の100万トークンあたりのコストが入力で$0.15、出力で$0.60となります。仮に平均して5分程度読むのに時間を要する英文があり、それを200文字の日本語に要約するタスクを行うとしたときに、以下のように試算できます。  

* 入力
  * 5分程度の英文：5000-7500トークン
  * コスト： $0.15 * (7,500トークン / 1,000,000トークン) = $0.001125
* 出力
  * 200文字程度の日本語：300-400トークン
  * コスト： $0.60 * (400トークン / 1,000,000トークン) = $0.00024
* コストの合計
  * 1記事あたりの入出力コスト： $0.001125 + $0.00024 = $0.001365
  * 1ドル160円の場合： 0.2184円/1記事
  * 1ドル150円の場合： 0.20475円/1記事
  * 1ドル140円の場合： 0.1911円/1記事

1記事あたりの翻訳および要約のコストが0.2円前後です。5000記事ほど翻訳＋要約させて1000円程度のコストとなります。記事の取得の段階で、特定のプログラミング言語のタグかつ一定数のポジティブなリアクションがついている記事に対してタスクを実行させるようにすることで実際にLLMにタスクを依頼する記事を大幅に減らすことができます。低コストに人気のある記事が読める環境を作れるということです。GPT-4o miniはClaude3 Haikuよりも優秀（充分に実用的）な性能があり、海外の記事を読みやすい状況にあることが分かりましたので前処理のために記事取得のとめのライブラリを作ることにしました。  

## ライブラリの使用方法

### インストール

ライブラリは[PyPI](https://pypi.org/project/devtopy/)にアップロードしておりpipを使ってインストールできます。コマンド例は以下になりますが、OSや環境に応じてコマンドを書き換えてください。  

```
pip install devtopy
```

### APIキーの準備

APIキーは[設定ページ](https://dev.to/settings/extensions)のDEV Community API Keysで「Generate API Key」ボタンを押すと発行できます。APIキーを使うと自身のアカウントのPrivateな情報にもアクセスできますので第三者に流出しないようにご注意ください。簡単なコード例を示しますが、APIキーは環境変数やpython-dotenvなどを使い、直接文字列として書かないことをお勧めします。  

```python
import os

from devtopy import DevTo

api_key = os.getenv("DEVTO_API_KEY") # 事前に環境変数にAPIキーを登録してください
client = DevTo(api_key=api_key)
```

### 記事の取得

最近の記事の取得ができます。pageではページ番号、per_pageでは1ページあたりの記事の数を1~1000の範囲で設定できます。以下は対話モードで出力していますが、レスポンスはPydanticで定義された型に沿って返されるので、IDEの補完機能を使って値を扱えます。  

```python
>>> articles = client.articles.get_latest_articles(page=1, per_page=1)
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1940659, title='Embracing Surface-Level Understanding: A Key to Mastering Software Engineering', description='Theory can lead to experience by practice. However, theory without practice will not give us real...', readable_publish_date='Jul 30', slug='embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', path='/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl', url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T01:10:03Z', positive_reactions_count=0, cover_image=None, social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fu0ukjaq1f51xr4c0n3c4.png'), canonical_url=Url('https://dev.to/muhammad_salem/embracing-surface-level-understanding-a-key-to-mastering-software-engineering-47pl'), created_at='2024-07-30T01:10:03Z', edited_at=None, crossposted_at=None, published_at='2024-07-30T01:10:03Z', last_comment_at='2024-07-30T01:10:03Z', reading_time_minutes=5, tag_list=[], tags='', user=User(name='Muhammad Salem', username='muhammad_salem', twitter_username=None, github_username=None, user_id=1234060, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1234060%2F60453f1e-7129-4e29-9b27-8114ec7caea7.png'), organization=None, flare_tag=None)])
```

getメソッドを使うとタグやユーザー名などのフィルターを使って記事の取得ができます。  

```python
>>> articles = client.articles.get(page=1, per_page=1, tag="python")
>>> articles
PublishedArticleList(articles=[PublishedArticle(type_of='article', id=1931086, title='Pre-Cloud Development Chatbot with Streamlit, Langchain, OpenAI and MongoDB Atlas Vector Search', description='Introduction   In this blog, I’ll discuss how I built a Retrieval-Augmented Generation (RAG)...', readable_publish_date='Jul 30', slug='pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', path='/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l', url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), comments_count=0, public_reactions_count=0, collection_id=None, published_timestamp='2024-07-30T00:26:40Z', positive_reactions_count=0, cover_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), social_image=Url('https://media.dev.to/cdn-cgi/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fjgd9gkudqjq7xs0vnpqe.png'), canonical_url=Url('https://dev.to/amandaruzza/pre-cloud-development-chatbot-with-streamlit-langchain-openai-and-mongodb-atlas-vector-search-43l'), created_at='2024-07-21T20:00:34Z', edited_at='2024-07-30T00:45:58Z', crossposted_at=None, published_at='2024-07-30T00:26:40Z', last_comment_at='2024-07-30T00:26:40Z', reading_time_minutes=8, tag_list=['rag', 'pdftextextraction', 'python', 'vectordatabase'], tags='rag, pdftextextraction, python, vectordatabase', user=User(name='Amanda Ruzza', username='amandaruzza', twitter_username=None, github_username=None, user_id=1246885, website_url=None, profile_image='https://media.dev.to/cdn-cgi/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG', profile_image_90='https://media.dev.to/cdn-cgi/image/width=90,height=90,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F1246885%2Fd39cfd89-1ab8-4a03-9dd7-6ebe8a2037f7.JPG'), organization=None, flare_tag=None)])
```

記事を取得するとpositive_reactions_countという項目があるので、背景で述べたリアクション数でフィルターをする操作については取得した記事を参照してフィルターすることで可能となっております（APIレベルでは対応していません）。  

### その他の機能

その他にも[API Document Ver1](https://developers.forem.com/api/v1)で掲載されている大半の機能に対応しております。  

* 記事を送信して公開・下書き状態にする
* 記事を更新する
* 自身の記事を取得する
* 組織の記事を取得する
* 組織のユーザーを取得する
* 特定のユーザーの記事を取得する
* 記事やポッドキャストエピソードからコメントを取得する
* コメントIDからコメントを取得する
* フォローしているタグの情報を取得する
* タグの情報を取得する
* フォロワーを取得する
* ポッドキャストエピソードを取得する
* プロフィール画像を取得する
* リアクションのON/OFFを切り替える
* リアクションを送る
* 動画付きの記事を取得する

## まとめ

dev.toのAPIの機能はシンプルですが充分に効率よく技術情報を得ることができます。また、LLMなどのAIやプログラミングと組み合わせることで技術情報を使った自然言語処理や翻訳・要約などのタスクを行い技術のトレンドを早く掴むことに寄与します。AIの発展により言語の壁も少しずつ解消されてきていますのでぜひ海外のコミュニティの情報にもアクセスいただきプログラミングにお役立ていただけましたら幸いです。  

## 関連書籍

※ Amazonへのリンクです。APIの扱い方やAPIに限らないwebからの情報の取得に関する書籍情報となります。  

* [Python2年生 スクレイピングのしくみ 第2版 体験してわかる！会話でまなべる！](https://www.amazon.co.jp/dp/4798182605?&linkCode=ll1&tag=rmc-8-22&linkId=4a1dc72f97c1dd130dbe78cfce68e030&language=ja_JP&ref_=as_li_ss_tl) ※Pythonを使ったweb情報の取得や整形処理を易しく学べる入門書です
* [Python+JSON データ活用の奥義](https://www.amazon.co.jp/dp/4802613938?&linkCode=ll1&tag=rmc-8-22&linkId=a7d3aa276cca47fa9918f8d402e0b51a&language=ja_JP&ref_=as_li_ss_tl) ※PythonとJSONの組み合わせで色々な処理を行う書籍です。JSONの扱いはAPIを扱う時にも重要なのでここでなれると良いです
* [Python最速データ収集術 〜スクレイピングでWeb情報を自動で集める (IT×仕事術)](https://www.amazon.co.jp/dp/4297126419?&linkCode=ll1&tag=rmc-8-22&linkId=4a3242c286c3ba5f97b5720ab7a4da56&language=ja_JP&ref_=as_li_ss_tl) ※上記の2冊よりもより実践的な内容を学べます
* [PythonによるWebスクレイピング 第2版](https://www.amazon.co.jp/dp/4873118719?&linkCode=ll1&tag=rmc-8-22&linkId=f798515761caf2f96c32cbd931170872&language=ja_JP&ref_=as_li_ss_tl) ※上級者向け、Seleniumなど古いバージョンの情報がありますがスクレイピングの妨害や罠に関する実践的な情報が含まれます

