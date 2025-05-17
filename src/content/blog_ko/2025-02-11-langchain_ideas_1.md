---
title: "생성AI(LLM)는 넷슈퍼에서 쇼핑을 할 수 있을까?"
slug: "langchain_ideas_1"
description: "Python으로 Langchain이나 Playwright를 사용하여 생성AI로 넷슈퍼에 쇼핑을 할 수 있는지 고려합니다."
date: 2025-02-11T04:08:12.472Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/llm.webp"
draft: false
tags: ['LangChain', 'LLM', 'Playwright', 'Python']
categories: ['Programming']
---

생성AI + Playwright + Fire를 결합하여 넷슈퍼 쇼핑을 해주는 로봇을 실험적으로 만들어 놀아보았습니다. 사용 언어는 Python입니다.

## 왜 넷슈퍼 쇼핑 AI 실험을 했나

생성AI는 자연어 기반으로 인간 대신 생각하고, 판단하며, 응답하는 능력을 가지고 있습니다. API를 통해 생성AI를 호출할 수 있으므로 생성AI와 프로그래밍을 결합한 앱이 개발되고 있습니다.
예를 들어, SQL을 생성AI로 만들어 프로그램으로 쿼리를 실행하거나, 데이터베이스에서 읽은 데이터의 결과를 바탕으로 보고서를 만드는 등의 작업이 가능합니다. 생성AI에 실행 가능한 함수를 전달하고 작업을 요청하면, 작업을 수행하면서 필요에 따라 실행할 처리를 AI가 판단할 수도 있습니다. 그 밖에도 선거에서는 유권자의 목소리를 AI로 분석 및 클러스터링하여 그룹별 의견의 경향을 파악하고 이름을 붙이는 것도 가능합니다. 생성AI를 도입하면 단순한 프로그래밍으로 만들 수 있는 기능을 넘어, 판단을 포함한 자동화를 쉽게 실현할 수 있습니다.

판단이나 추론을 해주기 때문에 최근에는 자연어로 브라우저 자동 조작을 지시하는 프레임워크도 등장했으며, `browser-use`나 `Stagehand` 등이 있다는 것을 최근에 알았습니다. 기사에서 프레임워크의 존재를 알았을 때 편리해 보였지만, 사용할 마음은 없어 그냥 지나갔습니다. 한편, 이러한 프레임워크의 소개 기사를 여러 번 보거나, 생활에서 식료품을 사는 수고가 정기적으로 발생하는 가운데, 생성AI로 넷슈퍼에서 쇼핑을 할 수 있지 않을까? 하는 아이디어가 떠올랐습니다. 있으면 정말로 많이 사용할 것 같고, 아마도 넷슈퍼를 사용하는 사용자층에게도 쇼핑 AI가 있으면 편리할 것 같았습니다. 만들 수 있을 것 같다는 확신에 가까운 생각을 가지면서 실험을 해보기로 했습니다.

## 아이디어의 내용

여기서는 구체적인 플랫폼이나 실제 코드는 작성하지 않지만, 구상과 실현 방법을 적어보겠습니다. 먼저, 프로그램 자체는 Python만으로 작성하고, Fire를 사용하여 CLI 앱으로 동작시킵니다. CLI를 통해 사용자는 사와 오고 싶은 것을 지시합니다.

```shell
python main.py --query "보로네제의 재료를 사와 오고. 그 외에 기저귀와 우유도 떨어졌으니까 사와 주세요."
```

CLI를 통해 사용자가 Python을 실행하면서 지시를 내리면, 프로그램 측에서 지시를 받습니다.

```python
import fire
def proc(query:str):
    pass
def main():
    fire.Fire(proc)
if __name__ == "__main__":
    main()
```

query에서 Langchain과 생성AI를 사용하여 쇼핑 리스트를 만듭니다. Pydantic과 결합하여 구조화된 데이터를 추출하면 매우 편리하게 데이터를 다룰 수 있습니다.

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
    items: List[str] = Field(..., description="쇼핑 아이템 리스트")

class OtukAI:
    def __init__(self, llm: LLM, page: Page, query: str):
        self.llm = llm,
        self.page = page  # Playwright나 Selenium으로 크롤링(자바스크립트 실행이 필요하지 않거나 API가 사용 가능하면 requests나 httpx도 좋을 것입니다)
        self.query = query

    def get_item_list(self) -> List[str]:
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "당신은 쇼핑 어시스턴트입니다. 사용자의 쿼리에서 쇼핑해야 할 상품의 리스트를 만듭니다.",
                    ),
                    ("human", "{query}"),
                ]
            )
            chain = prompt | self.llm.with_structured_output(ShoppingList)
            shopping_list = chain.invoke({"query": self.query})
            return shopping_list.items
```

사용자의 지시는 `"보로네제의 재료를 사와 오고. 그 외에 기저귀와 우유도 떨어졌으니까 사와 주세요."`이므로, 위 코드에서 get_item_list 메서드를 실행하면 다음과 같을 것입니다.

```python
oai =  OtukAI(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    page=page,  # Playwright의 Page 객체
    query=query,
)
shopping_list = oai.get_item_list()

# 출력
print(shopping_list)
# ["토마토", "소고기 다진 고기", "양파", "올리브 오일", "파스타(건면)", "우유", "기저귀"]
```

쇼핑 리스트를 만든 후 쇼핑 AI는 넷슈퍼까지 갑니다. 여기서는 기존의 크롤링과 유사하게 Playwright나 Selenium으로 URL을 참조하면 좋을 것입니다. 로그인 처리를 하거나, 쿠키를 사용하여 로그인 정보를 읽어 들여 유지하는 것도 좋습니다. 로그인이 되면 쇼핑 AI는 쇼핑을 할 수 있게 됩니다. 여기서 순서대로 리스트를 읽어옵니다.

```python
for item in shopping_list:
    category = self.get_category(item)
    url = self.build_url(category)
    self.page.goto(url)
```

쇼핑 리스트를 순서대로 읽어 내리면 상품마다 어떤 처리가 가능합니다. 예를 들어, item에서 검색어를 생성AI로 만들어 검색하거나, item에서 생성AI로 카테고리를 판단하여 카테고리 URL을 만들어 접근할 수 있습니다. 그렇게 하면 실제 상품 목록을 어느 정도 좁혀서, 상품을 하나씩 대조하고, 쇼핑 리스트의 상품과 일치하는지 판단하는 부분도 LLM으로 할 수 있을 것입니다. API나 데이터베이스가 존재하면 그 정보를 이용하는 것이 크롤링보다 효율적일 것입니다.
대상의 상품이 발견되면 장바구니에 넣는 처리를 하고, 발견되지 않으면 아무것도 하지 않으며, 장바구니에 넣었는지 여부, 가격이나 수량, 상품명 등을 기록합니다.

모든 상품에 대해 같은 작업을 수행하고, 결과를 부모님에게 반환하여 구매를 해도 좋은지 승인을 얻는 단계까지 가능하면 자동화로서는 충분할 것입니다. 이 정도의 처리는 Python에 의한 자동 브라우저 조작과 Langchain(LLM)을 결합하여 실현할 수 있습니다. 즉, 생성AI를 사용하여 넷슈퍼에서 쇼핑을 할 수 있는 것입니다.

## 실제로 사용하지 않는 이유

구현은 가능하지만 넷슈퍼 측에서는 예상하지 않은 사용법이 될 것입니다. 부하를 주지 않도록 배려하는 것도 물론 필요하지만, 법무 리스크의 관점에서 실험으로 그치기로 했습니다. 한편, 일상의 쇼핑에 시간을 소비하고 있다는 느낌이 들기 때문에, 넷슈퍼 측에서 쇼핑 AI를 구현해 주고 사용자가 AI에게 쇼핑을 의뢰할 수 있게 되면 편리할 것 같았습니다. 이를 실제 매장에서 하게 되면 남편이나 아이 등 인력에 의존하거나, 로봇이 유사하게 판단하여 사는 일이 되므로, AI가 이용 가능한 관점에서 넷슈퍼의 잠재성이 있다고 생각합니다. 월 500엔으로 이 같은 서비스가 나오면 나는 지속적으로 넷슈퍼에서 쇼핑을 즐기고 싶습니다(실제 매장에서는 또 다른 수요가 있을 것 같지만).

## 요약

생성AI와 프로그래밍을 결합하여 인간이 하는 판단이나 추론을 대체할 수 있고, 프로그램의 동작을 더 복잡하고 동적인 것으로 진화시킬 수 있습니다. 그 결과로서 넷슈퍼에서의 쇼핑을 실현할 수 있는 능력이 있다는 것을 알았습니다. 마찬가지로 지사 선거에서는 유권자의 목소리를 생성AI를 활용하여 시각화하는 등, 프로그램의 동작을 쉽게 복잡한 것으로 만들어 사람들의 생활, 삶, 놀이를 풍요롭게 변화시킬 수 있습니다. 쇼핑 AI는 기꺼이 판매 사업자에게 구현해 서비스로 제공받고 싶고, 생성AI의 능력을 활용한 자동화에 대한 아이디어의 사고 방식을 조금이라도 전달할 수 있기를 바랍니다.