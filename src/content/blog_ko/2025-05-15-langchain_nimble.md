---
title: Python에서의 LangChain Nimble 사용 예
slug: langchain_nimble
description: Nimble Retriever가 LangChain에 통합되었습니다. Python에서 Nimble Retriever를 활용하는 방법을 소개합니다.
date: 2025-05-15T04:01:16.002Z
preview: https://b.rmc-8.com/img/2025/05/15/2ec7f029f7700300b626a9c0293c80a6.jpg
draft: false
tags: ['LangChain', 'Python', 'LangGraph']
categories: ['Programming']
---

# Python에서의 LangChain Nimble 사용 예

Nimble Retriever가 LangChain에 통합되었다고 하여, 그 내용이 잘 이해가 되지 않아 코드를 작성하여 검증해 보았습니다.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">🌐🔍 Nimble Retriever Integration<br><br>Introducing a powerful web data retriever that brings precise and accurate data fetching to LangChain-powered LLM applications, seamlessly integrating into the retriever ecosystem.<br><br>Learn more here 👉 <a href="https://t.co/eqGwHq4lmL">https://t.co/eqGwHq4lmL</a> <a href="https://t.co/Aco1VztvAV">pic.twitter.com/Aco1VztvAV</a></p>&mdash; LangChain (@LangChainAI) <a href="https://twitter.com/LangChainAI/status/1921279069812891781?ref_src=twsrc%5Etfw">May 10, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">【Nimble Retriever가 LangChain에 통합】<br><br>웹 데이터를 정확하고 정밀하게 수집하는 기능을 제공하는 Nimble Retriever가 LangChain에 통합되었습니다. 이 통합으로 LangChain을 활용한 LLM 애플리케이션에서 Nimble Retriever의 기능을 사용할 수 있습니다.<br><br>Nimble… <a href="https://t.co/RM5bWxwScO">pic.twitter.com/RM5bWxwScO</a></p>&mdash; LangChainJP (@LangChainJP) <a href="https://twitter.com/LangChainJP/status/1922578068427669504?ref_src=twsrc%5Etfw">May 14, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Langchain Nimble이란

이번에 LangChain에 통합된 Nimble은 웹상의 데이터를 수집하고 콘텐츠 추출에 특화된 AI를 탑재한 웹 스크래핑 플랫폼입니다. 웹 페이지의 HTML 구조는 다양하며, 또한 봇에 의한 크롤링이 방지된 사이트도 있습니다. 구조화된 데이터를 추출하는 데 이 다양성과 봇 방지 조치가 어려움을 초래합니다. Nimble은 이러한 문제를 해결하여 웹 페이지에서 콘텐츠를 정확하고 깨끗하게 추출할 수 있으며, 이 기능이 WebAPI로 제공됩니다. 이번 LangChain 통합으로 LangChain의 일반적인 사용 방식에 따라 Nimble의 WebAPI를 이용할 수 있게 되었으며, LangChain의 `langchain_core.documents.base.Document[source]` 형식으로 문서를 추출할 수 있습니다.

## 사용 방법

Python 라이브러리로 제공되며, pip 등으로 설치할 수 있습니다.

```bash
pip install -U langchain-nimble
```

라이브러리를 설치한 후 [Nimble의 웹 페이지](https://app.nimbleway.com/login)에서 계정을 만들어 주세요. 이메일 주소가 Gmail 등 무료 서비스인 경우 등록이 불가능할 수 있으니 주의하세요. 계정을 만든 후 API 사용을 위한 준비가 필요합니다. 로그인 후 왼쪽 사이드 메뉴의 'Pipelines'를 클릭한 다음 'NimbleAPI'를 클릭합니다. Username & Password 아래에 3개의 텍스트 박스가 있지만, 그 중 가장 오른쪽에 있는 'Base64 token'이 LangChain Nimble에서 사용할 API 키입니다.

이 API 키를 복사하여 환경 변수 `NIMBLE_API_KEY`의 값에 붙여넣어 주세요. Windows 등의 경우 환경 변수를 설정한 후 재시작하는 것이 좋습니다. Mac이나 Linux의 경우 source 명령어 또는 export 등을 사용하여 환경 변수를 사용할 수 있게 해 주세요.

## 사용 예

[GitHub](https://github.com/rmc8/langchain_nimble_practice)에 샘플 코드를 게시했습니다. 리포지토리를 클론한 후 `uv sync`를 실행하면 실행 환경을 바로 만들 수 있을 것입니다. 그 후 `uv run main.py -q "{조사하고 싶은 내용}" -k {참조할 문서 수를 정수로 입력(Optional)}`로 CLI를 통해 실행할 수 있습니다.

### 코드 전체

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

### 설명

간단한 LangChain, LangGraph를 사용한 처리 흐름을 구성하고 있으며, Langchain Nimble로 문서를 추출하고, OpenAI의 `gpt-4.1-nano`로 수집한 문서를 모순 없이 요약하는 지시를 하고 있습니다. 모델과 프롬프트는 외부의 `config.toml`에 다음과 같이 정의합니다.

```toml
[summarize]
model = "gpt-4.1-nano"
prompt = """
コンテキストを20センテンス以内にかつ矛盾生じないようにして要約してください。

Context:
{context}
"""
```

OpenAI의 모델을 사용하고 있지만 Nimble과 마찬가지로 환경 변수를 정의해야 하며, `OPENAI_API_KEY`에 API 키를 설정하여 실행해야 합니다. Nimble의 처리는 간단하며, NimbleSearchRetriever에 문서를 얼마나 수집할지 양의 정수 값으로 설정합니다. 그 후 retriever로 Langchain의 익숙한 invoke 메서드를 사용하여 탐색하고 싶은 내용을 문자열로 제공하면 Nimble 측에서 스크래핑을 수행하고, Langchain의 Document 목록을 반환합니다.

```py
def retrieve(state: State) -> dict[str, Any]:
    """クエリに基づいてドキュメントを検索し、関連するコンテンツをリスト形式で返す関数。NimbleSearchRetrieverを使用。"""
    retriever = NimbleSearchRetriever(k=state["k"])
    example_docs = retriever.invoke(state["query"])
    doc_list: list[str] = [doc.page_content for doc in example_docs]
    return {"docs": doc_list}
```

그 후, 수집한 문서를 요약하거나, 문서 기반의 정보만으로 답변(RAG), 관련 정보를 동적으로 검색 쿼리를 만들어 추가 검색하는 등의 발전적인 처리를 연결할 수 있습니다. LangChain만으로도 요약이나 RAG는 충분히 가능하지만, 동적 검색이나 반복 처리의 판단이 포함된 복잡한 워크플로를 구축하는 경우 LangGraph를 함께 사용하면 좋을 것입니다.

## 요약

Nimble을 사용하면 검색과 스크래핑을 높은 정확도로 수행할 수 있으며, 검색 관련 오류 발생률을 낮출 수 있습니다. 또한 쿼리를 통해 문서를 추출하는 절차는 간단하므로, RAG나 DeepResearch의 자작 등 개발에서의 놀이 폭이 넓어질 것입니다. LangChain의 사용감에 맞춰 쉽게 Nimble을 시험해 볼 수 있으니, 꼭 시도해 보시기 바랍니다!