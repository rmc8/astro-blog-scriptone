---
title: FastAPI-MCPでTodoistのタスクを管理する
slug: manage_todoist_tasks_with_self_made_mcp
description: FastAPIで自作のMCPサーバーを作りTodoistの操作をできるようにします。これによりVSCやObsidianのSmart ComposerなどのMCP Clientからチャット形式でTodoistの管理ができるようになります。
date: 2025-05-24T06:21:38.027Z
preview: "https://b.rmc-8.com/img/2025/05/24/ba8aba1fccb437cc802e299999a19049.jpg"
draft: false
tags:
    - FastAPI
    - LLM
    - Python
    - MCP
categories:
    - Programming
fmContentType: blog
---

## 概要

FastAPIを使用して自作のMCPサーバーを構築し、Todoistのタスクを管理する方法を紹介します。MCPを介することで、生成AIを活用して非構造化データからタスクを作成したり、優先順位や期日を設定したりすることが可能になります。また、Todoistのタスクを読み取り、明日やることをまとめたり予定を立てたりする使い方も解説します。FastAPIとMCPを組み合わせることで、会話ベースでタスク管理を自然に行える利点を、具体的なコード例とともに説明します。

## 使用する言語・主なライブラリなど

* Python3.12以降：FastAPIを使う際に型エイリアスが使いやすい3.12以降のバージョンがオススメです。一部ライブラリで3.12以降の記法が使用されております。
* ライブラリ
  * FastAPI：Flaskのように軽量でありながら型エイリアスを利用して堅牢なバックエンドのAPIを作れます。
  * FastAPI-MCP：FastAPIで作ったアプリをMCP化します。
  * Pydantic：FastAPIで使用する型の定義につかいます。
  * todoist-api-python：Pythonから簡単にtodoistのAPIを操作できるライブラリです。これがあると自身でAPIを叩く処理を書く必要がなくなるのでこだわりがなければ迷わず使いましょう。

## MCPを介したTodoistでできること

MCPはFunction callingのように外部のツールに生成AIを通じて直接影響を与えることができる仕組みですが、HTTP通信を介してMCPサーバーに通信して影響を与える点に違いがあります。既存のサーバーや作ったWeb上もしくはローカルのサーバーに処理を依頼する点でFunction Callingよりも再利用のしやすさと処理を明確に分割できる点で利点があります。

MCPサーバーからTodoistのAPIにリクエストをするのでTodoistの持つ機能そのものは変わりませんが、MCPクライアントから文脈を読み取った上でTodoistの操作ができます。たとえばユーザーがメモからタスクを作ろうとした時に生成AIに、Todoist向けのタスクを作るためのリクエストを生成してそれをTodoistに送信できます。非構造のデータからTodoistのAPI向けにデータを変換したり、タスクの優先順位や期日などを設定の判断およびAPI向けのデータの構造化を生成AIで行えます。なので、人間は特別な操作をすることがなく自然に話したり考えたりする感覚でタスクを起こせる点で便利です。また、Todoistに登録しているタスクをMCPを介して読み取り、読み取った情報から明日やることや予定をまとめるなどの使い方もできるので、TodoistにAIの判断や情報の構造化の能力を手軽に統合できる点で便利です。APIとAIを自由に使って機能をつけたし、会話ベースで作った機能を扱えるところがMCPを介した操作の大きな利点だと思います。

### 私の使用例

筆者はObsidianと呼ばれるテキストエディターを使い日常のメモや日記のようなものなど書き記しています。Obsidianにはプラグイン機能があり、Smart composerと呼ばれるプラグインを足すと生成AIによるチャットやRAGによるテキストの抽出、MCPクライアントの機能が使えます。

Obsidianで書いたメモをもとにしてやりたいことをそのままTodoistのタスクに変換したり、タスクのリストを取得して明日やることをまとめたり、時間を落とし込み予定化したりしています。

## コード

コードは、(1)FastAPIのAPIの部分、(2)機能ごとに作ったAPIを束ねる部分、(3)FastAPI-MCPに作ったアプリを包み込ませて実行可能な状態にする部分の三箇所に大きく分かれます。

API部分は機能ごとに分割してつくるとメンテナンスがしやすくなり、1つのファイルが必要以上に肥大化することを防げます。今回はTodoistの操作および、日付情報の取得の2つの処理を書きます。次にTodoistの操作と日付の操作のAPIを1つのアプリに集約する処理を行います。最後に集約したFastAPIのアプリをMCPサーバー化します。

### ライブラリの導入

pipなどでライブラリを導入します。

```bash
python -m pip install fastapi pydantic todoist-api-python fastapi-mcp
```

ライブラリの不足や使うパッケージ管理ツールが異なるなどがある場合にはお手元の環境に合わせて適宜ご対応をお願いいたします。

### (1)FastAPIのAPIの部分

ここでは実際にWeb側でリクエストを受け取ってTodoistでの処理を行うためコードを記述します。加えて日付情報を取得する処理を書きます。生成AIに現在の日時を聞いてみても正確な答えが返ってこないかと思います。非常に賢そうに見えるのですがリアルタイムの情報を理解しているわけではないので、サーバー側で日付情報を理解できるようにすると便利です。日付のサポートが得られるようになるとタスクの締め切りを明日に設定するなど日付情報を生成した操作ができるようになります。ユーザーがわざわざ日付を渡す必要もなくなり勝手に判断してくれるようになるので利便性やコストを考慮しても必須レベルで作った方が良いものになると思います。

#### 日付情報を取得するコード

任意の場所に下記のコードを書きます。私は`libs/utils/__init__.py`にとりあえず書いています。

```py
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post("/current_time", operation_id="current_time", response_model=None)
async def get_current_time() -> datetime:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo"))
```

処理の内容は非常にシンプルで現在の日時をJSTで返すのみの処理です。APIRouterを使って`@router`を作ってあげると階層を構造をつくりつつ処理を行うための関数を記述できます。`@router`デコレータの後に`.post`や`.get`などを付け加えるとリクエストのメソッド方法を指定できます。

routerは後ほど（2）機能ごとに作ったAPIを束ねる部分の手順で1つに集約する際に使われるもので重要なので命名の際には1文字めに\_（アンダースコア）を使うことはなくPublicな変数として扱っていただくと良いと思います。

#### Todoistを操作するコード

同様に任意の場所に下記のコードを書きます。私は`libs/todoist/__init__.py`にとりあえず書いています。

```py
import logging
import os
from datetime import date, datetime, timedelta
from typing import Annotated, Literal

import fastapi
from fastapi import APIRouter
from pydantic import BaseModel, Field
from todoist_api_python.api import TodoistAPI
from todoist_api_python.models import Task

today = date.today()  # noqa: DTZ011
tomorrow = today + timedelta(days=1)
yesterday = today - timedelta(days=1)
this_week = today + timedelta(days=7)
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
todoist_api_key = os.environ.get("TODOIST_API_KEY", "")
PROJECT_ID = "xxxxxxxxx"


class TaskParam(BaseModel):
    """Todoistタスクのパラメータを定義するモデル。"""
    content: str = Field(description="タスクの名前")
    description: str | None = Field(description="タスクの説明")
    priority: Literal[1, 2, 3, 4] | None = Field(description="タスクの優先度。１が最も重要度が高く、4が最も重要度が低い。指定がない場合は原則としてNoneを設定する。")
    due_datetime: datetime | None = Field(description="タスクの期限")


def _get_tasks() -> list[Task]:
    """
    Todoist APIからすべてのタスクを取得する。

    Returns:
        list[Task]: 取得したタスクのリスト。

    Raises:
        Exception: API呼び出しに失敗した場合。
    """
    try:
        api = TodoistAPI(token=todoist_api_key)
        tasks_objs = api.get_tasks()
        tasks = []
        for tasks_obj in tasks_objs:
            tasks.extend(tasks_obj)
    except Exception as e:
        msg = str(e)
        logger.exception("タスクの取得に失敗しました: %s", msg)
        raise
    else:
        return tasks


def _get_someday_tasks(date: date) -> list[Task]:
    """
    特定の日付に期限が設定されているタスクを取得する。

    Args:
        date (date): タスクの期限日。

    Returns:
        list[Task]: 指定した日付に期限が設定されているタスクのリスト。
    """
    tasks = _get_tasks()
    return [t for t in tasks if t.due is not None and t.due.date == date]


def _get_today_tasks() -> list[Task]:
    """
    今日のタスクを取得する。

    Returns:
        list[Task]: 今日に期限が設定されているタスクのリスト。
    """
    return _get_someday_tasks(today)


def _get_tomorrow_tasks() -> list[Task]:
    """
    明日のタスクを取得する。

    Returns:
        list[Task]: 明日に期限が設定されているタスクのリスト。
    """
    return _get_someday_tasks(tomorrow)


def _get_yesterday_tasks() -> list[Task]:
    """
    昨日のタスクを取得する。

    Returns:
        list[Task]: 昨日に期限が設定されているタスクのリスト。
    """
    return _get_someday_tasks(yesterday)


def _get_this_week_tasks() -> list[Task]:
    """
    今週のタスクを取得する。

    Returns:
        list[Task]: 今週に期限が設定されているタスクのリスト。
    """
    tasks = _get_tasks()
    return [t for t in tasks if t.due is not None and this_week >= t.due.date >= today]


router = APIRouter(prefix="/todoist", tags=["todoist"])


@router.post("/get_today_tasks", operation_id="get_today_tasks", response_model=None)
async def get_today_tasks() -> list[Task]:
    """
    Todoistから今日のタスクを取得するエンドポイント。

    Returns:
        list[Task]: 今日のタスクのリスト。

    Raises:
        HTTPException: API呼び出しに失敗した場合。
    """
    try:
        return _get_today_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("今日のタスク取得エンドポイントでエラー: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_tomorrow_tasks", operation_id="get_tomorrow_tasks", response_model=None)
async def get_tomorrow_tasks() -> list[Task]:
    """
    Todoistから明日のタスクを取得するエンドポイント。

    Returns:
        list[Task]: 明日のタスクのリスト。

    Raises:
        HTTPException: API呼び出しに失敗した場合。
    """
    try:
        return _get_tomorrow_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("明日のタスク取得エンドポイントでエラー: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_yesterday_tasks", operation_id="get_yesterday_tasks", response_model=None)
async def get_yesterday_tasks() -> list[Task]:
    """
    Todoistから昨日のタスクを取得するエンドポイント。

    Returns:
        list[Task]: 昨日のタスクのリスト。

    Raises:
        HTTPException: API呼び出しに失敗した場合。
    """
    try:
        return _get_yesterday_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("昨日のタスク取得エンドポイントでエラー: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_this_week_tasks", operation_id="get_this_week_tasks", response_model=None)
async def get_this_week_tasks() -> list[Task]:
    """
    Todoistから今週のタスクを取得するエンドポイント。

    Returns:
        list[Task]: 今週のタスクのリスト。

    Raises:
        HTTPException: API呼び出しに失敗した場合。
    """
    try:
        return _get_this_week_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("今週のタスク取得エンドポイントでエラー: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/put_task",
    operation_id="put_task",
)
async def put_task(task_param: Annotated[TaskParam, fastapi.Body(embed=True)]) -> dict[str, str]:
    """
    Todoistに新しいタスクを追加するエンドポイント。

    Args:
        task_param (TaskParam): 追加するタスクのパラメータ。

    Returns:
        dict[str, str]: 処理の結果。成功した場合はステータスと成功メッセージ、失敗した場合はエラーメッセージを含む。
    """
    try:
        api = TodoistAPI(token=todoist_api_key)
        api.add_task(
            content=task_param.content,
            description=task_param.description,
            priority=task_param.priority,
            project_id=PROJECT_ID,
            due_datetime=task_param.due_datetime,
        )
        logger.info("タスク '%s' を追加しました。", task_param.content)

    except Exception as e:
        msg = str(e)
        logger.exception("タスク追加エンドポイントでエラー: %s", msg)
        return {"status": "error", "message": msg}
    else:
        return {"status": "success", "message": "タスクが正常に追加されました。"}


@router.post(
    "/put_tasks",
    operation_id="put_tasks",
)
async def put_tasks(task_params: Annotated[list[TaskParam], fastapi.Body(embed=True)]) -> dict[str, list[dict[str, str]]]:
    """
    Todoistに複数の新しいタスクを追加するエンドポイント。

    Args:
        task_params (list[TaskParam]): 追加するタスクのパラメータのリスト。

    Returns:
        dict[str, list[dict[str, str]]]: 各タスクの処理結果のリスト。
    """
    results: list[dict[str, str]] = []
    for task_param in task_params:
        r = await put_task(task_param)
        results.append(r)
    logger.info("%s件のタスク追加処理が完了しました。", str(len(results)))
    return {"results": results}

```

APIのトークンは環境変数で受け取るように設定しています。クライアント側に変数を設定する方法もありそうですがSmart Composerで上手に動かす方法がわからなかったのでいったんサーバー側に環境変数を介して管理するようにしています。FastAPIとMCPを使う場合に関数がどのような値を引き取り、どのような値を返すかを明示する必要があります。Pythonは動的型付けの言語なので型エイリアスやPydantic・mypyなどに馴染みのない方もいらっしゃるかと思いますが、開発時のコード補完や生成AIとの相性の良さの観点からもつけると良いものにはなります。加えてMCPで正確に処理を行うために必須なものではありますのでコードは長くなりますが受け入れるべきものとして考えていただくとよいです。関数の引数には`Annotated[<T>, fastapi.Body(embed=True)]`の形式で型指定が必要です。`<T>`の箇所は`str`や`int`など組み込みの型の他に、Pydanticで定義した型も使えます。API通信に使うパラメーターであったり、APIからの返り値であったりが複雑な構造の時にはPydanticで1つの型として情報を集約すると、引数や返り値の表現がわかりやすく書けますのでオススメです。

### (2)機能ごとに作ったAPIを束ねる部分

(1)で作った日付およびTodoistの操作のためのrouterを1つに集約します。私は`libs/api.py`に集約の処理を書いています。

```py
import fastapi

from . import todoist, utils

app = fastapi.FastAPI(
    title="MCP API",
    description="API for managing the MCP system",
    version="0.1.0",
)
app.include_router(todoist.router)
app.include_router(utils.router)
```

子フォルダーで機能を分割してつくりこみ、router変数に機能をまとめて`libs/api.py`が読み出せるように公開して、FastAPIのアプリにrouterを読み込ませる流れで1つのAPIに統合できます。規模が大きくなるほどこの手法が有効でメンテナンスや整理整頓がしやすくなります。コード自体も難しいものではないので、規模が小さいうちであってもとりいれていくとよい手法かと思います。

### (3)FastAPI-MCPに作ったアプリを包み込ませて実行可能な状態にする

最後にFastAPI製のアプリをMCPサーバー化します。`main.py`を`libs`がある場所につくり、下記のコードを書きます。

```py
import os

from fastapi_mcp import FastApiMCP

from libs import api

port = int(os.environ.get("PORT", "8000"))

mcp = FastApiMCP(
    api.app,
    name="My API MCP",
    description="My API description",
    # base_url="https://example.com",
)

mcp.mount()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(api.app, host="0.0.0.0", port=port)  # noqa: S104

```

`libs/api.py`で定義したFastAPIのアプリをFastApiMCPに渡して、mountメソッドを実行するだけでMCP化が簡単にできます。MCP化したアプリはローカルのPCやRenderなどでホストするとMCPサーバーとして動作します。

## MCPクライアントからMCPサーバーにリクエストする

MCPクライアントにはClaude DesktopやVS Codeの拡張（Cline、Continue）、Cursor、MCPのリポジトリ内で公開されている情報を活用したMCPクライアントの自作など多少の選択肢はあります。私は冒頭でも述べたとおりにObsidianのSmart Composerと呼ばれるプラグインを使って日常タスクの自動化に特化したMCPの活用をしています。

FastAPIで作ったMCPサーバーを使うには`mcp-proxy`があると便利なのでuvなどで追加してください。

```bash
uv tool install mcp-proxy
```

その後、クライアント側にMCPサーバの情報を設定します。

```json
{
  "command": "mcp-proxy",
  "args": [
    "https://example.com/mcp"
  ],
  "env": {}
}
```

commandについてはMac OSの場合には`mcp-proxy`にデフォルトでパスがとっていない状態でフルパスが必要となる点にご注意ください。正しく設定するとMCPサーバーで作った関数の数だけツールが読み込まれます。クライアントによってツールの数や関数名、関数に必要な値などが表示されます。

MCPクライアントの設定が完了したあとでTodoistにタスクを作る依頼をすると以下のようになります。

![MCP](https://b.rmc-8.com/img/2025/05/24/081ec420839d5e2bfa69d9f23dafd255.png)

プロンプトには「明日の12時30分に昼寝のタスクを追加してください。」と記述されています。その後、current_time関数で現在の時間を生成AIが取得し、取得した日付から明日が何日であるかを理解します。そしてその日付情報をもとにタスクの期限を設定して、TodoistAPIを介してお昼寝のタスクを作っています。人間がつくると1つずつ忘れないように期限や優先度など細かい設定が必要なのですが、そこを生成AIに丸投げできる点で楽になります。

## まとめ

FastAPIを使ってMCPサーバーを自作しました。そして作ったMCPサーバーにMCPクライアントからサーバーに指示をだし、日付を取得したりTodoistの操作をしたりできることを確認できました。

Pythonを使った処理を関数に組み込めるのでWebの情報を参照した処理をつくったり、APIを介してアプリを操作したりなどを生成AIに一任して人間がやるべき作業に集中しやすくなる点で非常に便利だと思います。便利なアプリであってもコンピューターで管理する都合上でお堅く細かくルールが決まっており、そこにアナログツールとは異なるソフトウェアの臭いと呼んでもよいものを私は感じます。

MCPを使うことでソフトウェアの臭いを感じることがなく人間の思考に沿ってデータを扱える点で今までと違う自然な体験があると思いますので、開発者やプロンプトエンジニアの方々にはぜひMCPでたくさん遊べると良いのかと思います。
