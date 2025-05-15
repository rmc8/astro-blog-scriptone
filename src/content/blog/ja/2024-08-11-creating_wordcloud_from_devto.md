---
title: creating_wordcloud_from_devto
description: DevToのAPIからPythonで記事を取得しワードクラウドを作る方法について解説しています。最新の1000記事からワードクラウドを作りその傾向を読み取ることでDevToの技術コミュニティの傾向を見るとともに、DevToなど海外の技術情報を得る便益について検討しています。
date: 2024-08-11T06:36:37.547Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/devto_wordcloud_202407282354.webp
draft: false
tags: ['Python', 'dev.to', 'API']
categories: ['Programming']
---

# DevToの最新1000記事からワードクラウドを作る

前回にPython向けの[dev.toのAPIを操作するためのライブラリ](https://rmc-8.com/introduction_devtopy)を紹介しました。これを使いWordcloudを作って、直近1000記事の単語でWordcloudを作ります。  
  
## リポジトリ

GitHubのリポジトリは以下の通りです。  
<https://github.com/rmc8/devto_wordcloud>  
  
## コードの実行方法

GitHubからクローンして必要なライブラリを導入します。

```shell
git clone https://github.com/yourusername/devto-word-cloud-generator.git
cd devto-word-cloud-generator
pip install -r requirements.txt
```

正常にライブラリを導入できたらプログラムは使用できるようになります。src内にプログラムがありますが、CLIでプログラムを実行するように作っています。  

```shell
cd src
python main.py --article_count=25
```

article_countはWordcloudを作る際にどの程度記事を取得するかの数値を設定できます。最大値で1000まで設定可能です。  

## コードの解説

devto_wordcloudでは主に以下の処理を行っております。

* DevToから最新の記事のリストを取得する
* 記事のリストから記事のIDを取り出し実際の記事データを取得する
* 不要なワードを取り除いたり原型の英単語を取得したりする
* 加工した単語でワードをカウントする
* mask画像を使ってWordcloudを作れない場所を指定する
* mask画像を反映させてワードクラウドを作る

### 記事リストの抽出

記事はライブラリを使うことにより簡単に抽出できます。インスタンス化時にAPIキーが必要ですが、キーさえあればリクエスト処理はライブラリで行ってくれます。  

```python
def fetch_articles(dt: DevTo, article_count: int) -> List[Dict]:
    """Fetch articles from DEV.to"""
    articles = dt.articles.get_latest_articles(page=1, per_page=article_count).articles
    logger.info(f"Fetched {len(articles)} articles from DEV.to")
    return articles
```

### 記事の取得

記事の取得もライブラリによりAPIへの処理が自動で行われます。

```python
def process_article(dt: DevTo, article: Dict) -> str:
    """Process a single article and return processed text"""
    article_data = dt.articles.get_by_id(article.id)
    time.sleep(1)  # Rate limiting
    logger.debug(f"Processed article: {article.id}")
    return process_text(article_data.body_markdown)

```

多量にリクエストするケースもありますし、APIの制限もありますのでリクエスト後にはスクレイピングと同じように1秒のスリープを置いています。記事を取得した後、markdown形式で簡単な自然言語処理を行なっています。

### 自然言語処理

取得した記事に対する言語処理はnltkなどで行っています。

```python

def download_nltk_resources():
    """Download required NLTK resources"""
    for resource in ["punkt", "stopwords", "wordnet"]:
        nltk.download(resource, quiet=True)
    logger.info("NLTK resources downloaded successfully")

```

nltkで必要なデータを準備します。英語の処理において不要なワードがあります。それを取り除くためにstopwordsというものを使います。日本語でも、「〜です。」、「〜（主語）は」、「ありがとう」、「こんにちは」など集計する上で重要性の低い単語は存在します。そういった類のものを取り除きます。また、英語では動詞が色々な形に変形しますのでそれらを原型に戻す必要があります。その戻す処理を行うための語彙情報をwordnetから取得します。また、punktは文章（センテンス）の分割のために使います。これらの処理を終えたのちにword_tokenizeで小文字に統一した単語分割を行います。

### ワードクラウドの作成

ワードクラウドの作成には画像ライブラリのPILや図表を作るためのmatplotlib、マスク画像を処理するためのnumpyの計算機能、実際にワードクラウドを作るwordcloudライブラリを使っています。

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

白黒のグレースケールの画像を用意するとマスク画像に使えます。画像の黒の箇所にワードを表示し、白い箇所にはワードを表示させないマスク処理をできます。画像を開き、numpyのarray形式に変換してマスクを作ります。ワードクラウドを作る際にmaskを渡すことによってマスクを反映させたWordcloudを作れます。作ったWordcloudをmatplotlibに渡して描画し、それを保存することでWordcloudが完成します。

## 実際のワードクラウド

8月9日の18時に1000件分の記事を取得してワードクラウドを作ったものは以下のトリです。

![word cloud](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud/wordcloud_202408091835.png)

ワードを見ると、http, account, data, use, applicationが目立ちます。言語やフレームワークではpythonやjavascript, reactなどが存在しています。またAPIなどのワードも含まれており、印象としてはweb開発周辺の話題の関連性が高そうです。web周りは発展やトレンドの移り変わりが非常に早い分野である一方、TypeScriptや優れたwebフレームワークの登場、バックエンドにおいてもPythonやGo言語など手軽な言語も登場し手軽にデータの配信や加工、AIの利用ができます。webであればOSや端末の種類を問わずに幅広く扱えますし、スマートフォンアプリ向けにAPIを作りアプリを作ることもできますのでweb周りの技術が強そうに見えています。好きな言語・フレームワークで作りたいものを作れば良いとは思いますが、作りたいものに困った場合には汎用性や需要の高さの観点でJavaScriptやTypeScript、Pythonあたりに触ってみるのも良さそうだと思いました。

## まとめ

今回はdevtoから多量の記事を抽出してWordcloudを作ってみました。web周りやデータに関連する領域に現在関心が向いており、汎用性の高い仕組みについて情報を集めやすそうな点でDevToを読む楽しみを感じています。今回はワードクラウドを作りましたがもうすでに生成AIを使ってDiscordに日本語の要約を配信する仕組みを作っています。GPT 4o-miniやGemini1.5 Flashなど非常に安価でありながら十分に実用性なモデルも登場しており、今後海外の技術情報へのアクセスも非常に容易になると思います。この記事の続きとしてまた近々LLMを使った情報収集について解説をします。

