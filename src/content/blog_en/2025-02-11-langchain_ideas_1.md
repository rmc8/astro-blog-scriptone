---
title: Can Generative AI (LLM) Shop at Online Supermarkets?
slug: langchain_ideas_1
description: Using Python with LangChain and Playwright to explore if generative AI can handle online supermarket errands.
date: 2025-02-11T04:08:12.472Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/llm.webp
draft: false
tags: ['LangChain', 'LLM', 'Playwright', 'Python']
categories: ['Programming']
---

# Can Generative AI (LLM) Shop at Online Supermarkets?

I experimentally created a robot that combines generative AI, Playwright, and Fire to handle errands at an online supermarket. The programming language used is Python.

## Why I Experimented with an AI for Online Supermarket Errands

Generative AI has the ability to think, judge, and respond based on natural language, acting as a substitute for humans. Since generative AI can be called via APIs, apps that combine it with programming are now being developed. For example, you can have generative AI generate SQL and then execute queries with a program, or create reports from data read from a database. You can also inform generative AI of executable functions and ask it to perform tasks, allowing the AI to judge and execute processes as needed. Additionally, in elections, it's possible to analyze and cluster voter opinions using AI, then identify trends for each group and name them. By incorporating generative AI, you can easily achieve automation that involves judgment beyond what simple programming can do.

Because it can make judgments and inferences, frameworks have emerged that allow browser automation through natural language instructions, such as `browser-use` or `Stagehand`. I recently learned about these, and while I thought they seemed convenient from articles, I didn't feel motivated to use them and let it pass. However, after seeing introductions to these frameworks multiple times and considering the regular hassle of buying groceries in my daily life, the idea of using generative AI for online supermarket shopping came up. If it were possible, I'd want to use it a lot, and I think it would be convenient for users of online supermarkets as well. With a strong belief that it could be made, I decided to experiment.

## Details of the Idea

Here, I won't write about specific platforms or actual code, but I'll outline the concept and implementation methods. First, the program will be written entirely in Python and use Fire to run it as a CLI app. Users will give instructions via CLI for what they want to buy.

```shell
python main.py --query "Buy the ingredients for Bolognese. Also, get diapers and milk since we're out."
```

When the user runs the Python script via CLI and provides instructions, the program receives them.

```python
import fire

def proc(query: str):
    pass

def main():
    fire.Fire(proc)

if __name__ == "__main__":
    main()
```

From the query, use LangChain and generative AI to create a shopping list. Combining it with Pydantic makes it very convenient for handling structured data.

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
    items: List[str] = Field(..., description="List of items to shop for")

class OtukAI:
    def __init__(self, llm: LLM, page: Page, query: str):
        self.llm = llm,
        self.page = page  # Use Playwright or Selenium for crawling (or requests/httpx if JS execution isn't needed or APIs are available)
        self.query = query

    def get_item_list(self) -> List[str]:
            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        "You are a shopping assistant. Create a list of products to buy from the user's query.",
                    ),
                    ("human", "{query}"),
                ]
            )
            chain = prompt | self.llm.with_structured_output(ShoppingList)
            shopping_list = chain.invoke({"query": self.query})
            return shopping_list.items
```

For a user instruction like '"Buy the ingredients for Bolognese. Also, get diapers and milk since we're out."', running the get_item_list method in the above code would likely result in something like this:

```python
oai =  OtukAI(
    llm=ChatOpenAI(model="gpt-4o-mini"),
    page=page,  # Playwright's Page object
    query=query,
)
shopping_list = oai.get_item_list()

# Output
print(shopping_list)
# ["Tomato", "Ground beef", "Onion", "Olive oil", "Pasta (dry)", "Milk", "Diapers"]
```

After creating the shopping list, the errand AI goes to the online supermarket. This can be done similarly to traditional crawling using Playwright or Selenium to access the URL. You might handle login processes or use cookies to maintain login information. Once logged in, the AI can shop. It then reads through the list sequentially.

```python
for item in shopping_list:
    category = self.get_category(item)
    url = self.build_url(category)
    self.page.goto(url)
```

For each item in the shopping list, various processes can be performed. For example, use generative AI to create search keywords from the item and perform a search, or use it to determine the category and create/access the category URL. This narrows down the product list to some extent, allowing the LLM to match each product and judge if it matches the shopping list item. If APIs or databases exist, using that information would be more efficient than crawling.
Once the target product is found, add it to the cart; if not, do nothing, and record details like whether it was added, price, quantity, and product name.

If all products are processed this way and the results are returned to the user for approval before purchase, that would be sufficient for automation. This can be achieved by combining Python's automated browser operations with LangChain (LLM). In other words, generative AI can be used to shop at online supermarkets.

## Reasons Not to Use It in Practice

While implementation is possible, it would be an unintended use for online supermarkets. Naturally, considerations to avoid overloading the system are necessary, but from a legal risk perspective, I'm keeping it as an experiment. On the other hand, since daily shopping takes time, I think it would be convenient if online supermarkets implemented this kind of errand AI service, allowing users to request shopping from AI. If applied to physical stores, it might rely on humans like a spouse or children, or robots making similar judgments, so I believe online supermarkets have potential in terms of AI utilization. If such a service were available for a monthly fee of 500 yen, I'd want to use it continuously to make online shopping easier (though physical stores might have different demands).

## Summary

By combining generative AI with programming, you can replace human judgment and inference, evolving program behavior into more complex and dynamic forms. As a result, we've seen that it's possible to enable shopping at online supermarkets. Similarly, in gubernatorial elections, voter opinions can be visualized using generative AI, making program operations more complex and enriching people's lives, daily routines, and leisure. I hope errand AI gets implemented by retailers as a service, and through this, I've shared some ideas on automation using generative AI's capabilities.