---
title: "Example of Using LangChain Nimble in Python"
slug: "langchain_nimble"
description: "Nimble Retriever has been integrated with LangChain. This introduces how to utilize Nimble Retriever in Python."
date: 2025-05-15T04:01:16.002Z
preview: "https://b.rmc-8.com/img/2025/05/15/2ec7f029f7700300b626a9c0293c80a6.jpg"
draft: false
tags: ['LangChain', 'Python', 'LangGraph']
categories: ['Programming']
---

I wasn't sure what the integration of Nimble Retriever with LangChain meant, so I wrote some code to verify it.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">🌐🔍 Nimble Retriever Integration<br><br>Introducing a powerful web data retriever that brings precise and accurate data fetching to LangChain-powered LLM applications, seamlessly integrating into the retriever ecosystem.<br><br>Learn more here 👉 <a href="https://t.co/eqGwHq4lmL">https://t.co/eqGwHq4lmL</a> <a href="https://t.co/Aco1VztvAV">pic.twitter.com/Aco1VztvAV</a></p>&mdash; LangChain (@LangChainAI) <a href="https://twitter.com/LangChainAI/status/1921279069812891781?ref_src=twsrc%5Etfw">May 10, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">[Nimble Retriever Integrated with LangChain]<br><br>Nimble Retriever, which provides accurate and precise web data retrieval, has been integrated with LangChain. This integration allows the use of Nimble Retriever's features in LangChain-powered LLM applications.<br><br>Nimble… <a href="https://t.co/RM5bWxwScO">pic.twitter.com/RM5bWxwScO</a></p>&mdash; LangChainJP (@LangChainJP) <a href="https://twitter.com/LangChainJP/status/1922578068427669504?ref_src=twsrc%5Etfw">May 14, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## What is Langchain Nimble

Nimble, which has been integrated with LangChain this time, is a web scraping platform equipped with AI specialized for collecting web data and extracting content. Web pages have various HTML structures, and some sites have measures against bot crawling. This diversity and the countermeasures against bots create difficulties in extracting structured data. Nimble addresses these issues and can accurately and cleanly extract content from web pages, with this functionality provided via Web API. With this integration into LangChain, you can use Nimble's Web API while following LangChain's usual handling, and documents can be extracted in the format of LangChain's `langchain_core.documents.base.Document`.

## How to Use

It is provided as a Python library and can be installed via pip.

```bash
pip install -U langchain-nimble
```

After installing the library, create an account on the [Nimble website](https://app.nimbleway.com/login). Be careful, as free email addresses like Gmail might not be accepted for registration. After creating an account, preparation is needed to use the API. Log in, then click "Pipelines" in the left side menu, and then click "NimbleAPI". Under "Username & Password", there are three text boxes; the one on the far right, "Base64 token", is the API key to use with LangChain Nimble.

Copy this API key and paste it as the value for the environment variable `NIMBLE_API_KEY`. For Windows, it's a good idea to restart after setting the environment variable. For Mac or Linux, use commands like source or export to make the environment variable available.

## Usage Example

Sample code is available on [GitHub](https://github.com/rmc8/langchain_nimble_practice). Clone the repository and run `uv sync` to set up the execution environment quickly. Then, run `uv run main.py -q "{content you want to investigate}" -k {number of documents to reference (as an integer, optional)}` via CLI.

### Full Code

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
        description="Store a summarized text of the obtained data.",
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
    """Function to search for documents based on the query and return relevant content in list form. Uses NimbleSearchRetriever."""
    retriever = NimbleSearchRetriever(k=state["k"])
    example_docs = retriever.invoke(state["query"])
    doc_list: list[str] = [doc.page_content for doc in example_docs]
    return {"docs": doc_list}

def summarize(state: State) -> dict[str, Any]:
    """Function to summarize the list of documents. Uses ChatPromptTemplate and ChatOpenAI to generate a summary."""
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
    """Function to execute processing with the specified query and k value, and obtain a summary. Verifies that k is a positive integer."""
    if not isinstance(k, int) or k < 1:
        raise ValueError("k must be an integer greater than or equal to 1.")
    # Build the graph
    graph_builder = StateGraph(State)
    # Add nodes
    graph_builder.add_node("retrieve", retrieve)
    graph_builder.add_node("summarize", summarize)
    # Add edges
    graph_builder.add_edge(START, "retrieve")
    graph_builder.add_edge("retrieve", "summarize")
    graph_builder.add_edge("summarize", END)
    # Compile
    app = graph_builder.compile()
    # Run the app
    state: State = {
        "query": q,
        "k": k,
        "docs": [],
        "summary": "",
        "config": get_config(),
    }
    res = app.invoke(state)
    # Output the result
    logger.info(res["summary"])

def main():
    fire.Fire(proc)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
```

### Explanation

This sets up a simple processing flow using LangChain and LangGraph. It extracts documents with Langchain Nimble and summarizes the collected documents without contradictions using OpenAI's `gpt-4.1-nano`. The model and prompt are defined in an external `config.toml` file as follows.

```toml
[summarize]
model = "gpt-4.1-nano"
prompt = """
Summarize the context in 20 sentences or less and without contradictions.

Context:
{context}
"""
```

It uses OpenAI's model, but like Nimble, you need to set the environment variable; set your API key in `OPENAI_API_KEY` before running. The core Nimble processing is simple: set a positive integer value in NimbleSearchRetriever for how many documents to collect. Then, use the familiar invoke method from LangChain with a string for what you want to search, and Nimble will perform scraping and return a list of LangChain Documents.

```py
def retrieve(state: State) -> dict[str, Any]:
    """Function to search for documents based on the query and return relevant content in list form. Uses NimbleSearchRetriever."""
    retriever = NimbleSearchRetriever(k=state["k"])
    example_docs = retriever.invoke(state["query"])
    doc_list: list[str] = [doc.page_content for doc in example_docs]
    return {"docs": doc_list}
```

After that, you can extend to processes like summarizing the collected documents, answering based only on the information in the documents (RAG), dynamically creating search queries for further searches, and more. While summarization and RAG can be done with LangChain alone, using LangGraph together is useful for building complex workflows that involve dynamic searches or decision-making in loops.

## Summary

By using Nimble, you can perform searches and scraping with high accuracy, reducing the error rate associated with searches. The process of extracting documents through queries is simple and straightforward, so it expands the scope for development fun, such as creating your own RAG or DeepResearch. Since you can easily try Nimble while maintaining the LangChain user experience, please give it a try!