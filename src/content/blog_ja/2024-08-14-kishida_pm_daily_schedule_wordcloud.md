---
title: 岸田首相の3年分の「総理の一日」からワードクラウドを作る
slug: kishida_pm_daily_schedule_wordcloud
description: 岸田文雄氏の3年分の「総理の一日」をクローリング・スクレイピングして自然言語処理を行い、ワードクラウドを作ります。Pythonでできる自動化を幅広く学習しつつ、首相としての務めを技術的に見ていきます。
date: 2024-08-14T13:25:00.072Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/kishida_pm_wc.webp
draft: false
tags: ['Python', 'スクレイピング', 'BeautifulSoup4', 'Playwright']
categories: ['Programming']
---

# 岸田首相の3年分の「総理の一日」からワードクラウドを作る

岸田首相の退任のニュースがありましたので、総理の一日からワードクラウドを作ってみました。  
※新しい首相の選出により首相官邸ページが古くなる可能性が非常に高いのでコードは参考程度にしてください。  
コード：<https://github.com/rmc8/kishida_lex_wordcloud>(Ubuntu24.04で動作確認をしています)  

## 概要

本日、岸田首相の退任の知らせがありました。いつかは退任の時期が来るとはいえ多少の驚きがあります。岸田氏は3年もの間首相を務めており、総理の1日のページ数もたくさんあります。そのため、3年分の記録をスクレイピングして、日本語の自然言語処理を行いワードクラウドを作ってみました。

## コード

### クローラー

クローラーは総理の1日のページを在任期間すべての記事をクローリングするようにしています。クローラーとしてplaywrightと呼ばれる高レベルのテストフレームワークを使っています。

在任期間は2022年11からとなります。総理の1日は1ヶ月ごとにページを作られていますので、2022年11月分のページから2024年8月のページまでのwhile文を使ってdateutilで1ヶ月ずつ加算しながら2024年8月までのページをクローリングします。

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

月毎のページにでは以下のようにニュースの一覧が組まれています。

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

リスト形式で総理の1日が掲載されており、詳細のページのリンクはnews-list-titleクラス内のaタグを辿るとセレクターによるリンクの取得ができます。そのためセレクターでリンクを抽出して、リストにまとめたものを返すようにしています。

```python
async def _extract_links(self, page: Page) -> List[str]:
    article_links = await page.query_selector_all("div.news-list-title a")
    links = []
    for link in article_links:
        if href := await link.get_attribute("href"):
            links.append(href)
    return links
```

文字情報でまとめてリンクを取得する理由として、ジェネレーターによるページ遷移をしたときに、遷移前のページのエレメントを参照できなくなってしまうためです。そのためエレメントからstr型のリストに変換して先にURLを保持させる記述をしています。

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
            # エラーが起こった場合は5分待機する
            print(f"Error fetching article content from {url}: {e}")
            await page.wait_for_timeout(5 * 60 * 1000.0)
            continue
    return ""
```

記事のコンテンツは_get_article_contentから取得しています。sectionクラスから要素を取得できますが、個別のページはJavaScriptにより動的に生成されており、かつAPIでRawデータが配信されているわけではありません。そのため、requestsによる処理よりもSeleniumやPlaywrightなどブラウザでレンダリングさせる手法を使う方が楽に記事を抽出できます。また、たくさんアクセスするとコンテンツにアクセスできなくなるので、要素が見つからなかった場合には5分のスリープを入れてから記事の取得を再度試みる仕組みとなっています。取得したコンテツから、「もっと読む」や余白など余分な文字を取り除いて、記事のデータを1つずつ返す処理をします。

### 自然言語処理

自然言語処理にはMeCabによる形態素解析を行っています。新型コロナウィルスなど最新の単語にも対応させるため、ipadic-neologdを使っています。

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
                    # 動詞の場合は基本形（辞書形）を使用
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

単語のカウンターにはdictの拡張型であるCounterを使っています。Counterのupdateメソッドに分割した単語のリストを渡すだけでカウンターへの単語の追加やカウントの加算が簡単にできます。そのリストを作る処理にはMecabを使い単語を分割して名詞・動詞・形容詞を対象に単語を集計します。動詞の場合にのみ原型の状態で返す処理をします。fil_tokenで意味のない単語を取り除く処理をした上で集計しています。

### ワードクラウドの作成

```python
import os

from wordcloud import WordCloud


def generate_wordcloud(word_freq, this_dir, filename="wordcloud.png", min_count=5):
    # カウント数が min_count 以上の単語だけをフィルタリング
    filtered_word_freq = {
        word: count for word, count in word_freq.items() if count >= min_count
    }

    # WordCloudオブジェクトを作成
    font_path = f"{this_dir}/font/SawarabiGothic-Regular.ttf"
    wordcloud = WordCloud(
        width=1200,
        height=800,
        background_color="white",
        font_path=font_path,
        max_font_size=100,
        max_words=256,
    )

    # フィルタリングされた単語頻度データからワードクラウドを生成
    wordcloud.generate_from_frequencies(filtered_word_freq)
    output_dir = f"{this_dir}/output"
    os.makedirs(output_dir, exist_ok=True)
    wordcloud.to_file(f"{output_dir}/{filename}")
```

wordcloudモジュールのgenerate_from_frequenciesに辞書データを渡すことで簡単にワードクラウドを作ることができます。ワードクラウドを作りto_fileで画像かすることでワードクラウドが仕上がります。

## ワードクラウドおよび内容について

ワードクラウドは以下のように完成しました。

![wc](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/wordcloud.png)

ストップワードに含めるべきワードがある点、多方面にな取り組みをしている点で強く偏りのあるワードクラウドにはならず読み取りには注意が入りました。おおまかに4つの主要政策を中心に5つの取り組みを行っているように見えました。  

### 経済・財政

ワード：経済、投資、成長、賃上げ、財政、予算、戦略、資本主義、スタートアップ  
岸田内閣の主要政策の1つとして「賃上げと投資による所得と生産性の向上」が挙げられます。テーマに関連するキーワードとしては経済が588回登場しており総理の1日での登場頻度からもっとも重視しているキーワードのように思います。2023年12月の所信表明演説においても
「私は何よりも経済に重点を置いて参ります」と発言していました。この経済に関するキーワードが最頻出であることは、実際に経済に対する取り組みを矛盾なく行い発信をしていたということになります。

### 技術革新

ワード：デジタル、技術、開発、構築  
こちらも「賃上げと投資による所得と生産性の向上」の項目で人手不足への対応や行政を含む社会全体の効率化を進め、中小企業の稼ぐ力を強化することを狙ったものです。デジタルの登場頻度は300回程です。スタートアップの140回ほどよりも多く、賃上げの360回よりは少ないです。デジタル化は賃上げのように即効性の高いものではありません。しかしながら中小企業における人材不足や煩雑な作業の効率化にデジタル化は欠かすことができず、長期的な改善を目的としてデジタル化を重く受け止めているものと考えています。

### 社会・国民生活

ワード：社会、国民、生活、子育て、医療、女性  
生活・子育て・医療は130~140回ほど登場しており、社会は410回登場しました。主要政策の2つ目に「中長期的に持続可能な社会づくり」に主に関係しています。これの実現において先進技術やデータの活用などをあげており、土台には経済と技術があります。政策の中には創薬や介護もあるものの回数は85回以下となっており、主要な政策としては経済周辺にあるものと感じました。一方で、こどもが240回ほど登場しており、持続性の観点で若い世代を重要視する政策を行うとしていたものと考えられそうです。

### 国際・安全保障

ワード：国際、世界、G7、ウクライナ、安全保障  
主要政策の3つ目に挙げられている「外交・安全保障」に関するキーワードも多く取り上げられています。国際やウクライナ、安全保障などのキーワードが100回程度、G7が200回です。比重としては国民生活よりは軽いものの、主要政策に挙げられているだけはあり対外的に積極的な姿勢を示しているものと考えられます。ちなみにウクライナの128回はアメリカ（米国）の105回よりも多くウクライナの関心が強くでています。その他の、気候変動や人権、国連、近隣の中国などのキーワードが少なく、安倍元首相の地球儀を俯瞰する外交と比較すると偏りがある印象もあります。

### 災害関連

ワード：復興、復旧、被災地、被災者、避難  
各ワードで100回ほどですが第4の主要政策の「国民生活の安全・安心」は頻度としては着実に実行されていそうです。この政策の中ではまずは被災者や被災地の支援が第一であり、その次に防災が来ています。感染症への対策もこの政策のところで上がっていますが、コロナも落ち着き被災に対するサポートに力を入れているようです。

### そのほか

主要な政策（戦略）に沿って1日を過ごされているようで主要政策に当てはまらない特異な頻度のキーワードは見つかりませんでした。あえて言うのであれば某教会については社会的に関心を集めた割に消極的な姿勢であるかもしれません。

## まとめ

クローリング・スクレイピング・自然言語処理・ワードクラウドによるビジュアライゼーションとPythonで広く浅く一連の処理を行いました。支持率もあまり良くない状況ではありましたし裏金問題などもあまり望ましくは思いません。それでも、ワードの頻度における範囲では、経済を最重視する姿勢に矛盾はなく好循環を生み出そうと戦略的に首相としてのお務めをなさっていただと思います。3年間お疲れ様でした。また、こうした身近な題材から皆様のプログラミングの学習に役立ちましたら幸いです。

