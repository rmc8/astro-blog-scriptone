---
title: 生成AI(LLM)はネットスーパーで買い物をできるのか？
slug: langchain_ideas_1
description: PythonでLangchainやPlaywrightを使い生成AIでネットスーパーにお遣いできるかを考えます。
date: 2025-02-11T04:08:12.472Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/llm.webp
draft: false
tags: ['LangChain', 'LLM', 'Playwright', 'Python']
categories: ['Programming']
---

# 生成AI(LLM)はネットスーパーで買い物をできるのか？

生成AI＋Playwight＋Fireを組み合わせてネットスーパーのお遣いをしてくれるロボットを実験的に作って遊びました。使用言語はPythonです。

## なぜネットスーパーお遣いＡＩの実験をしたか

生成AIは自然言語ベースで人間の代わりに考え、判断し、応答する能力があります。API経由で生成AIを呼び出せるので生成AIとプログラミングを組み合わせたアプリが開発されるようになりました。
たとえば、SQLを生成AIで作りプログラムでクエリを実行する、データベースから読み込んだデータの結果からレポートを作るなどできます。生成AIに実行可能な関数を伝えタスクをお願いするとタスクをこなしつつ必要に応じて実行する処理をAIが判断するなどもできます。そのほかにも選挙では有権者の声をAIで分析・クラスタリングをしてグループごとの意見の傾向を読み取り名前をつけることも可能です。生成AIを組み込むことによって単純なプログラミングで作れる機能を超えた、判断を交えた自動化を簡単に実現できます。

判断や推論をしてくれるので最近ではブラウザの自動操作を自然言語で指示して行うフレームワークも登場してきており`browser-use`や`Stagehand`などがあることを私は最近知りました。記事でフレームワークの存在を知った時に便利そうとは思いましたが使う気にはならずそのままやり過ごしていました。一方で、何度かこれらのフレームワークの紹介記事を見たり、生活のことで食料品を買う手間が定期的に生じたりする中から、生成AIでネットスーパーに買い物ができるのではないか？というアイデアが浮上しました。あればものすごく使いたいですし、おそらくネットスーパーを使うユーザー層にもお遣いAI君がいたら便利だろうと思いました。おそらく作れるだろうと確信に近いものを持ちつつも実験をしてみることにしました。

## アイデアの内容

ここでは具体的なプラットフォームや実在するコードは書きませんが、構想や実現の方法を書いていきます。まず、プログラム自体はPythonのみで記述し、Fireを使うことによってCLIアプリとして動かします。CLI経由でユーザーは買ってきてほしいものを指示します。

```shell
python main.py --query "ボロネーゼの材料を買ってきて。あとはオムツと牛乳も切らしたから買ってきてちょうだい。"
```

CLI経由でユーザーがPythonを実行するとともに指示を出し、プログラム側で指示を受け取ります。

```python
import fire

def proc(query:str):
    pass


def main():
    fire.Fire(proc)

if __name__ == "__main__":
    main()
```

queryからLangchainと生成AIを使って買い物リストを作ります。Pydanticと組み合わせて構造化されたデータを抽出するようにするととても便利にデータを扱えます。

```python
from typing import Any, Dict, Union, List
from urllib.parse import urljoin

from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from playwright.sync_api import Page

LLM = Union[ChatOpenAI, ChatOllama]

class ShoppingList(BaseModel):
    items: List[str] = Field(..., description="買い物のアイテムリスト")

class OtukAI:
    def __init__(self, llm: LLM, page: Page, query: str):
        self.llm = llm,
        self.page = page # PlaywrightやSeleniumでクローリングする(JSの実行が不要だったりAPIが使える場合はrequestsやhttpxでもよいでしょう)
        self.query = query

    def get_item_list(self) -> List[str]:
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "あなたはお買い物アシスタントです。ユーザのクエリからお買い物すべき商品のリストを作ります。",
                    ),
                    ("human", "{query}"),
                ]
            )
            chain = prompt | self.llm.with_structured_output(ShoppingList)
            shopping_list = chain.invoke({"query": self.query})
            return shopping_list.items
```

ユーザーの指示は`"ボロネーゼの材料を買ってきて。あとはオムツと牛乳も切らしたから買ってきてちょうだい。"`なので、上記のコードでget_item_listメソッドを実行すると以下のようになるでしょう。

```python
oai =  OtukAI(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    page=page, # PlayWightのPageオブジェクト
    query=query,
)
shopping_list = oai.get_item_list()

# 出力
print(shopping_list)
# ["トマト", "牛ひき肉", "玉ねぎ", "オリーブオイル", "パスタ(乾麺)", "牛乳", "オムツ"]
```

買い物リストを作ったあとお遣いAIはネットスーパーまで行きます。ここは従来のクローリングと同様にPlaywrightやSeleniumなどでURLを参照するとよいと思います。ログイン処理をしたり、Cookieを使ってログイン情報を読み込ませ保持したりなどもよいでしょう。ログインができたらお遣いAIはお買い物ができるようになります。ここで順番にリストを読み込みます。

```python
for item in shopping_list:
    category = self.get_category(item)
    url = self.build_url(category)
    self.page.goto(url)
```

お買い物リストを順番に読み出すと商品ごとに何らかの処理ができます。たとえば、itemから検索ワードを生成AIでつくり検索する／itemから生成AIでカテゴリーを判断しカテゴリーのURLを作りアクセスするなどができます。そうすると実際に商品の一覧をある程度絞り込めるので、商品をひとつずつ照合し、お買い物リストの商品と一致していそうか判断するところもLLMでできるでしょう。APIやデータベースが存在すればその情報を利用するほうがクローリングよりも効率的にはなるでしょう。
対象の商品が見つかったらカートに入れる処理を行い、見つからなかったら何もせず、カートに入れたか入れられなかったか・価格や数量・商品名などを記録します。

すべての商品で同じ操作を行い、結果をお母さんに返して購入していいか承認を得るところまでできれば自動化としては十分でしょう。ここまでの処理はPythonによる自動のブラウザ操作とLangchain(LLM)を組み合わせることによって実現ができます。つまり、生成AIを用いてネットスーパーでお買い物することができるわけです。

## 実際に使わない理由

実装は可能ですがネットスーパー側としては想定しない使い方になるでしょう。負荷をかけないような配慮をするなども当然のように必要ですが、法務リスクの観点から実験でとどめることにしています。一方で日々の買い物に対して時間を費やしているとは感じるので、お遣いAIをネットスーパー側で実装してもらえてユーザーがAIにお買い物を依頼できるようになると便利だと思いました。これを実店舗でするとなると夫やこどもなど人力に頼ったり、もしくはロボットが同様に判断して買うことになったりするので、やはりAIが利用できる観点でネットスーパーの潜在性があると私は思います。月額500円でこのようなサービスがでたら私は継続的にネットスーパーで買い物を楽したいと思います（実店舗だとまた違う需要があるとも思いつつですが）。

## まとめ

生成AIとプログラミングを組み合わせることにより人間が行う判断や推論を置き換えることができ、プログラムの動作をより複雑に動的なものへと進化させられます。その結果としてネットスーパーへの買い物を実現できる能力があることがわかりました。同様に知事選では有権者の声を生成AIを活用して可視化をするなど、プログラムの動作を手軽に複雑なものにすることができ人々の生活や暮らし、遊びを豊かなものに変えられます。お買い物AIはぜひ販売事業者に実装してもらいサービスとして提供してもらえたらと思いつつ、生成AIの能力を用いた自動化についてのアイデアの考え方を少しでもお伝えできたら幸いです。

