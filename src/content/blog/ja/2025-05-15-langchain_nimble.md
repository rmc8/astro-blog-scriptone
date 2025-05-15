---
title: langchain_nimble
description: Nimble RetrieverがLangChainの統合されました。PythonでのNimble Retrieverの活用方法を紹介します。
date: 2025-05-15T04:01:16.002Z
preview: https://b.rmc-8.com/img/2025/05/15/2ec7f029f7700300b626a9c0293c80a6.jpg
draft: false
tags: ['LangChain', 'Python', 'LangGraph']
categories: ['Programming']
---

# PythonにおけるLangChain Nimbleの使用例

Nimble RetrieverがLangChainの統合されたとのことでしたが何のことかが分からなかったので、コードを書いて検証してみました。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">🌐🔍 Nimble Retriever Integration<br><br>Introducing a powerful web data retriever that brings precise and accurate data fetching to LangChain-powered LLM applications, seamlessly integrating into the retriever ecosystem.<br><br>Learn more here 👉 <a href="https://t.co/eqGwHq4lmL">https://t.co/eqGwHq4lmL</a> <a href="https://t.co/Aco1VztvAV">pic.twitter.com/Aco1VztvAV</a></p>&mdash; LangChain (@LangChainAI) <a href="https://twitter.com/LangChainAI/status/1921279069812891781?ref_src=twsrc%5Etfw">May 10, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">【Nimble RetrieverがLangChainに統合】<br><br>ウェブデータを正確かつ精密に取得する機能を提供するNimble Retrieverが、LangChainに統合されました。この統合により、LangChainを活用したLLMアプリケーションでNimble Retrieverの機能が利用可能になります。<br><br>Nimble… <a href="https://t.co/RM5bWxwScO">pic.twitter.com/RM5bWxwScO</a></p>&mdash; LangChainJP (@LangChainJP) <a href="https://twitter.com/LangChainJP/status/1922578068427669504?ref_src=twsrc%5Etfw">May 14, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Langchain Nimbleとは

今回LangChainに統合されたNimbleは、Web上のデータを収集しコンテンツの抽出に特化したAIを搭載したWebスクレイピングのプラットフォームです。WebページのHTML構成はさまざまであり、加えてBotによるクローリングが対策されたサイトもあります。構造化されたデータを抽出するのに当たってこの多様さやBotの対策が困難さを生み出しています。Nimbleはこれらの対策を行い、Webページからコンテンツを正確にきれいに抽出することができ、この機能がWebAPIで提供されています。今回のLangChainへの統合によりLangChainの普段の扱い方に従いつつもNimbleのWebAPIを利用でき、LangChainの`langchain_core.documents.base.Document[source]
`の形式でドキュメントを抽出できるようになりました。

## 使用方法

Pythonのライブラリとして提供されており、pipなどで導入できます。

```bash
pip install -U langchain-nimble
```

ライブラリを導入したあと[NimbleのWebページ](https://app.nimbleway.com/login)からアカウントを作ってください。メールアドレスがGmailなどフリーのものだと登録できない可能性がありますのでご注意ください。アカウントを作ったあとAPIを使うための準備が必要です。ログイン後に左側のサイドメニューの「Pipelines」をクリックして、その後「NimbleAPI」をクリックします。Username & Passwordの下に3つのテキストボックスがありますが、そのうちの一番右にある「Base64 token」が今回のLangChain Nimbleで使うAPIキーです。

このAPIキーをコピーして、環境変数`NIMBLE_API_KEY`の値にコピーしたトークンを貼り付けてください。Windowsなど環境変数を設定したあと再起動するとよさそうです。MacやLinuxの場合にはsourceコマンドやexportなどを使って設定した環境変数を使えるようにしてください。

## 使用例

[GitHub](https://github.com/rmc8/langchain_nimble_practice)にサンプルのコードを掲載しております。リポジトリをクローンして`uv sync`を実行すると実行環境をすぐに作れるかと思います。その後`uv run main.py -q "{調査したい内容を書く}" -k {参照するドキュメント数を整数で書く(Optional)}`でCLI経由で実行できます。

### コード全体

```py
import pathlib
import logging
import tomllib
from typing_extensions import Any, TypedDict

import fire
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_nimble import NimbleSearchRetriever
from langgraph.graph import START, END, StateGraph
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)


class SummaryData(BaseModel):
    summary: str = Field(
        ...,
        description="取得したデータを要約したテキストを格納する。",
    )


class State(TypedDict):
    query: str
    k: int
    docs: list[str]
    summary: str
    config: dict[str, Any]


def get_config() -> dict[str, Any]:
    this_dir = pathlib.Path(__file__).parent
    config_file = this_dir / "config.toml"
    with config_file.open("rb") as f:
        return tomllib.load(f)


def retrieve(state: State) -> dict[str, Any]:
    """クエリに基づいてドキュメントを検索し、関連するコンテンツをリスト形式で返す関数。NimbleSearchRetrieverを使用。"""
    retriever = NimbleSearchRetriever(k=state["k"])
    example_docs = retriever.invoke(state["query"])
    doc_list: list[str] = [doc.page_content for doc in example_docs]
    return {"docs": doc_list}


def summarize(state: State) -> dict[str, Any]:
    """ドキュメントのリストを要約する関数。ChatPromptTemplateとChatOpenAIを使用して要約を生成。"""
    prompt = ChatPromptTemplate.from_template(
        template=state["config"]["summarize"]["prompt"]
    )
    llm = ChatOpenAI(model_name=state["config"]["summarize"]["model"])
    chain = prompt | llm.with_structured_output(SummaryData)
    context = "\n\n".join(doc for doc in state["docs"])
    logger.debug(context)
    res: SummaryData = chain.invoke({"context": context})
    return {"summary": res.summary}


def proc(q: str, k: int = 5):
    """指定されたクエリとk値で処理を実行し、要約を取得する関数。kが正の整数であることを検証。"""
    if not isinstance(k, int) or k < 1:
        raise ValueError("kは1以上の整数でなければなりません。")
    # graphを作る
    graph_builder = StateGraph(State)
    # Nodeを追加する
    graph_builder.add_node("retrieve", retrieve)
    graph_builder.add_node("summarize", summarize)
    # Edgeを追加する
    graph_builder.add_edge(START, "retrieve")
    graph_builder.add_edge("retrieve", "summarize")
    graph_builder.add_edge("summarize", END)
    # Compile
    app = graph_builder.compile()
    # appを実行する
    state: State = {
        "query": q,
        "k": k,
        "docs": [],
        "summary": "",
        "config": get_config(),
    }
    res = app.invoke(state)
    # 結果を出力する
    logger.info(res["summary"])


def main():
    fire.Fire(proc)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
```

### 解説

簡単なLangChain、LangGraphを使った処理のフローを組んでおり、Langchain Nimbleでドキュメントを抽出し、OpenAIの`gpt-4.1-nano`で集めたドキュメントを矛盾なく要約する指示をしています。モデルとプロンプトは外部の`config.toml`に以下のように定義しています。

```toml
[summarize]
model = "gpt-4.1-nano"
prompt = """
コンテキストを20センテンス以内にかつ矛盾生じないようにして要約してください。

Context:
{context}
"""
```

OpenAIのモデルを使っていますがこちらもNimbleと同様に環境変数を定義する必要があり、`OPENAI_API_KEY`にAPIキーを設定して実行する必要がありますのでご注意ください。肝心のNimbleの処理はシンプルで、NimbleSearchRetrieverにどの程度ドキュメントを収集するか正の整数値で設定します。その後retrieverでLangchainでおなじみのinvokeメソッドを使い、探したい内容を文字列で提供するとNimble側でスクレイピングを行い、LangchainのDocumentのリストを返します。

```py
def retrieve(state: State) -> dict[str, Any]:
    """クエリに基づいてドキュメントを検索し、関連するコンテンツをリスト形式で返す関数。NimbleSearchRetrieverを使用。"""
    retriever = NimbleSearchRetriever(k=state["k"])
    example_docs = retriever.invoke(state["query"])
    doc_list: list[str] = [doc.page_content for doc in example_docs]
    return {"docs": doc_list}
```

その後、収集したドキュメントを要約する、ドキュメントに基づいた情報のみで回答させる（RAG）、関連する情報の検索クエリを動的に作りさらに検索をするなど発展的な処理へとつなげることもできます。LangChainのみでも要約やRAGは十分にできますが、動的な検索をしたり繰り返し処理の判断が挟まったりなど複雑なワークフローを構築する場合にはLangGraphも併せて使用するとよいでしょう。

## まとめ

Nimbleを使うことにより検索とスクレイピングを高い精度で行うことができ、検索にまつわるエラーの発生率を下げることができます。またクエリを通じてドキュメントを抽出する手順はシンプルで簡単なので、RAGやDeepResearchの自作など開発での遊びの幅が広がると思います。LangChainの使用感に沿って簡単にNimbleを試せますのでぜひお試しいただけましたら幸いです！

