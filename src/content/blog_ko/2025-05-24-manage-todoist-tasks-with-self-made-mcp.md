---
title: FastAPI로 만든 MCP 서버를 통해 Todoist 작업 관리하기
slug: manage_todoist_tasks_with_self_made_mcp
description: FastAPI로 사용자 정의 MCP 서버를 만들어 Todoist 작업을 관리합니다. 이를 통해 VSC나 Obsidian의 Smart Composer와 같은 MCP 클라이언트에서 채팅 형식으로 작업 관리가 가능해집니다.
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

## 개요

FastAPI를 사용하여 사용자 정의 MCP 서버를 구축하고 Todoist 작업을 관리하는 방법을 소개합니다. MCP를 활용하면 생성 AI를 통해 비구조화 데이터에서 작업을 생성하고, 우선순위를 설정하거나 마감일을 지정할 수 있습니다. 또한 Todoist 작업을 조회하여 다음 날 할 일을 정리하거나 일정을 계획하는 방법도 설명합니다. FastAPI와 MCP를 결합하여 대화 기반으로 자연스럽게 작업을 관리할 수 있는 이점을 구체적인 코드 예제와 함께 논의하겠습니다.

## 사용 언어 및 주요 라이브러리

* Python 3.12 이상: FastAPI를 사용할 때 타입 별칭을 쉽게 사용할 수 있는 3.12 이상 버전을 권장합니다. 일부 라이브러리는 3.12 이상의 문법을 사용합니다.
* 라이브러리
  * FastAPI: Flask처럼 가볍지만 타입 별칭을 사용하여 견고한 백엔드 API를 개발할 수 있습니다.
  * FastAPI-MCP: FastAPI 애플리케이션을 MCP 서버로 변환합니다.
  * Pydantic: FastAPI에서 사용할 타입을 정의하는 데 사용됩니다.
  * todoist-api-python: Python에서 Todoist API를 쉽게 조작할 수 있는 라이브러리입니다. API 요청 처리를 직접 작성할 필요가 없으므로 특별한 요구 사항이 없다면 주저 없이 사용하세요.

## MCP를 통해 Todoist로 할 수 있는 일

MCP는 생성 AI를 통해 외부 도구에 직접 영향을 미칠 수 있는 메커니즘으로, Function Calling과 유사하지만 HTTP 통신을 통해 MCP 서버와 통신하여 영향을 미친다는 점에서 차이가 있습니다. 기존 서버나 사용자 정의 웹/로컬 서버에 작업을 위임할 수 있어 재사용성과 프로세스 분리가 명확하다는 장점이 있습니다.

MCP 서버가 Todoist API에 요청을 보내기 때문에 Todoist의 핵심 기능은 변하지 않습니다. 그러나 MCP 클라이언트는 컨텍스트를 해석한 후 Todoist 작업을 수행할 수 있습니다. 예를 들어, 사용자가 메모에서 작업을 만들고자 할 때 생성 AI가 Todoist에 맞는 요청을 생성하고 이를 전송할 수 있습니다. 비구조화 데이터를 Todoist API에 적합한 형식으로 변환하거나 작업 우선순위 또는 마감일을 결정하고 API용 데이터 구조화를 AI를 통해 수행할 수 있습니다. 이를 통해 사람은 특별한 조작 없이 자연스럽게 말하거나 생각하는 느낌으로 작업을 생성할 수 있습니다. 또한 Todoist에 등록된 작업을 MCP를 통해 조회하여 다음 날 할 일이나 일정을 정리하는 등의 사용법도 가능하므로, Todoist에 AI의 의사 결정 및 데이터 구조화 기능을 쉽게 통합할 수 있다는 점에서 유용합니다. API와 AI를 자유롭게 사용하여 기능을 추가하고 대화 기반으로 이러한 기능을 다룰 수 있는 것이 MCP를 통한 작업의 큰 장점이라고 생각합니다.

### 나의 사용 사례

저는 Obsidian이라는 텍스트 편집기를 사용하여 일상적인 메모나 일기를 작성합니다. Obsidian에는 플러그인 기능이 있으며, Smart Composer라는 플러그인을 추가하면 생성 AI를 통한 채팅, RAG를 통한 텍스트 추출, MCP 클라이언트 기능을 사용할 수 있습니다.

Obsidian에 작성한 메모를 기반으로 하고 싶은 일을 Todoist 작업으로 변환하거나, 작업 목록을 조회하여 다음 날 할 일을 정리하거나 시간을 배정하여 일정으로 만드는 작업을 하고 있습니다.

## 코드

코드는 크게 세 부분으로 나뉩니다: (1) FastAPI API 부분, (2) 기능별로 API를 묶는 부분, (3) FastAPI 앱을 FastAPI-MCP로 감싸 실행 가능한 상태로 만드는 부분입니다.

API 부분을 기능별로 나누면 유지보수가 쉬워지고 하나의 파일이 지나치게 커지는 것을 방지할 수 있습니다. 이번에는 Todoist 작업과 날짜 정보 조회를 위한 프로세스를 작성하겠습니다. 다음으로 Todoist와 날짜 작업을 위한 API를 하나의 앱으로 통합합니다. 마지막으로 통합된 FastAPI 앱을 MCP 서버로 변환합니다.

### 라이브러리 설치

pip 또는 유사한 도구를 사용하여 라이브러리를 설치합니다.

```bash
python -m pip install fastapi pydantic todoist-api-python fastapi-mcp
```

라이브러리가 부족하거나 사용하는 패키지 관리 도구가 다를 경우, 환경에 맞게 적절히 조정해 주세요.

### (1) FastAPI API 부분

여기서는 웹 측에서 요청을 처리하고 Todoist 작업을 수행하기 위한 코드를 작성합니다. 또한 날짜 정보를 조회하는 프로세스를 포함합니다. 생성 AI에게 현재 날짜와 시간을 물어보면 정확한 결과를 얻지 못할 수 있습니다. 매우 지능적으로 보이지만 실시간 정보를 이해하지 못하기 때문에 서버 측에서 날짜 정보를 접근 가능하게 만드는 것이 편리합니다. 날짜 지원이 가능해지면 작업 마감일을 내일로 설정하는 등의 작업이 가능해집니다. 사용자가 직접 날짜를 제공할 필요가 없어지고 시스템이 자동으로 판단하므로 편의성과 비용 측면에서 필수 수준으로 만드는 것이 좋다고 생각합니다.

#### 날짜 정보를 조회하는 코드

원하는 위치에 다음 코드를 작성합니다. 저는 일단 `libs/utils/__init__.py`에 배치했습니다.

```py
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post("/current_time", operation_id="current_time", response_model=None)
async def get_current_time() -> datetime:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo"))
```

프로세스는 매우 간단하며, 현재 날짜와 시간을 JST로 반환하는 것뿐입니다. `APIRouter`를 사용하여 `@router`를 만들면 계층 구조를 유지하면서 처리를 위한 함수를 정의할 수 있습니다. `@router` 데코레이터 뒤에 `.post` 또는 `.get`을 추가하면 요청 메서드를 지정할 수 있습니다.

router는 나중에 (2) 단계에서 기능별로 API를 하나로 통합할 때 사용되므로 중요합니다. 이름을 지정할 때 첫 글자로 언더스코어(_)를 사용하지 말고 공개 변수로 취급하는 것이 좋습니다.

#### Todoist를 조작하는 코드

마찬가지로 원하는 위치에 다음 코드를 작성합니다. 저는 일단 `libs/todoist/__init__.py`에 배치했습니다.

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
    """Todoist 작업 매개변수를 정의하는 모델."""
    content: str = Field(description="작업 이름")
    description: str | None = Field(description="작업 설명")
    priority: Literal[1, 2, 3, 4] | None = Field(description="작업 우선순위. 1이 가장 높은 우선순위이고, 4가 가장 낮은 우선순위입니다. 지정되지 않은 경우 기본적으로 None으로 설정됩니다.")
    due_datetime: datetime | None = Field(description="작업 마감일")


def _get_tasks() -> list[Task]:
    """
    Todoist API에서 모든 작업을 조회합니다.

    Returns:
        list[Task]: 조회된 작업 목록.

    Raises:
        Exception: API 호출이 실패한 경우.
    """
    try:
        api = TodoistAPI(token=todoist_api_key)
        tasks_objs = api.get_tasks()
        tasks = []
        for tasks_obj in tasks_objs:
            tasks.extend(tasks_obj)
    except Exception as e:
        msg = str(e)
        logger.exception("작업 조회 실패: %s", msg)
        raise
    else:
        return tasks


def _get_someday_tasks(date: date) -> list[Task]:
    """
    특정 날짜에 마감일이 설정된 작업을 조회합니다.

    Args:
        date (date): 작업 마감일.

    Returns:
        list[Task]: 지정된 날짜에 마감일이 설정된 작업 목록.
    """
    tasks = _get_tasks()
    return [t for t in tasks if t.due is not None and t.due.date == date]


def _get_today_tasks() -> list[Task]:
    """
    오늘의 작업을 조회합니다.

    Returns:
        list[Task]: 오늘 마감일이 설정된 작업 목록.
    """
    return _get_someday_tasks(today)


def _get_tomorrow_tasks() -> list[Task]:
    """
    내일의 작업을 조회합니다.

    Returns:
        list[Task]: 내일 마감일이 설정된 작업 목록.
    """
    return _get_someday_tasks(tomorrow)


def _get_yesterday_tasks() -> list[Task]:
    """
    어제의 작업을 조회합니다.

    Returns:
        list[Task]: 어제 마감일이 설정된 작업 목록.
    """
    return _get_someday_tasks(yesterday)


def _get_this_week_tasks() -> list[Task]:
    """
    이번 주의 작업을 조회합니다.

    Returns:
        list[Task]: 이번 주 마감일이 설정된 작업 목록.
    """
    tasks = _get_tasks()
    return [t for t in tasks if t.due is not None and this_week >= t.due.date >= today]


router = APIRouter(prefix="/todoist", tags=["todoist"])


@router.post("/get_today_tasks", operation_id="get_today_tasks", response_model=None)
async def get_today_tasks() -> list[Task]:
    """
    Todoist에서 오늘의 작업을 조회하는 엔드포인트.

    Returns:
        list[Task]: 오늘의 작업 목록.

    Raises:
        HTTPException: API 호출이 실패한 경우.
    """
    try:
        return _get_today_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("오늘의 작업 엔드포인트에서 오류: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_tomorrow_tasks", operation_id="get_tomorrow_tasks", response_model=None)
async def get_tomorrow_tasks() -> list[Task]:
    """
    Todoist에서 내일의 작업을 조회하는 엔드포인트.

    Returns:
        list[Task]: 내일의 작업 목록.

    Raises:
        HTTPException: API 호출이 실패한 경우.
    """
    try:
        return _get_tomorrow_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("내일의 작업 엔드포인트에서 오류: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_yesterday_tasks", operation_id="get_yesterday_tasks", response_model=None)
async def get_yesterday_tasks() -> list[Task]:
    """
    Todoist에서 어제의 작업을 조회하는 엔드포인트.

    Returns:
        list[Task]: 어제의 작업 목록.

    Raises:
        HTTPException: API 호출이 실패한 경우.
    """
    try:
        return _get_yesterday_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("어제의 작업 엔드포인트에서 오류: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_this_week_tasks", operation_id="get_this_week_tasks", response_model=None)
async def get_this_week_tasks() -> list[Task]:
    """
    Todoist에서 이번 주의 작업을 조회하는 엔드포인트.

    Returns:
        list[Task]: 이번 주의 작업 목록.

    Raises:
        HTTPException: API 호출이 실패한 경우.
    """
    try:
        return _get_this_week_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("이번 주의 작업 엔드포인트에서 오류: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/put_task",
    operation_id="put_task",
)
async def put_task(task_param: Annotated[TaskParam, fastapi.Body(embed=True)]) -> dict[str, str]:
    """
    Todoist에 새 작업을 추가하는 엔드포인트.

    Args:
        task_param (TaskParam): 추가할 작업의 매개변수.

    Returns:
        dict[str, str]: 작업 결과. 성공 시 상태와 성공 메시지, 실패 시 오류 메시지를 포함합니다.
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
        logger.info("작업 '%s' 추가됨.", task_param.content)

    except Exception as e:
        msg = str(e)
        logger.exception("작업 추가 엔드포인트에서 오류: %s", msg)
        return {"status": "error", "message": msg}
    else:
        return {"status": "success", "message": "작업이 성공적으로 추가되었습니다."}


@router.post(
    "/put_tasks",
    operation_id="put_tasks",
)
async def put_tasks(task_params: Annotated[list[TaskParam], fastapi.Body(embed=True)]) -> dict[str, list[dict[str, str]]]:
    """
    Todoist에 여러 개의 새 작업을 추가하는 엔드포인트.

    Args:
        task_params (list[TaskParam]): 추가할 작업 매개변수 목록.

    Returns:
        dict[str, list[dict[str, str]]]: 각 작업 작업 결과 목록.
    """
    results: list[dict[str, str]] = []
    for task_param in task_params:
        r = await put_task(task_param)
        results.append(r)
    logger.info("%s개의 작업 처리 완료.", str(len(results)))
    return {"results": results}

```

API 토큰은 환경 변수를 통해 수신하도록 설정되어 있습니다. 클라이언트 측에서 변수를 설정하는 방법도 있을 수 있지만 Smart Composer와 원활하게 작동하는 방법을 찾지 못했기 때문에 일단 서버 측에서 환경 변수를 통해 관리하고 있습니다. FastAPI와 MCP를 사용할 때는 함수가 어떤 값을 받아들이고 반환하는지 명시적으로 선언해야 합니다. Python은 동적 타입 언어이므로 타입 별칭, Pydantic, 또는 mypy에 익숙하지 않은 분들도 계실 수 있습니다. 그러나 개발 중 코드 완성과 생성 AI와의 호환성 측면에서 유용합니다. 또한 MCP에서 정확한 처리를 위해 필수적이므로 코드가 길어지더라도 받아들여야 할 부분입니다. 함수 인수는 `Annotated[<T>, fastapi.Body(embed=True)]` 형식으로 타입 지정이 필요합니다. `<T>` 부분은 `str`이나 `int`와 같은 내장 타입뿐만 아니라 Pydantic으로 정의한 타입도 사용할 수 있습니다. API 통신에 사용되는 매개변수나 반환 값이 복잡한 구조를 가질 때 Pydantic으로 정보를 하나의 타입으로 통합하면 인수와 반환 값을 더 쉽게 표현할 수 있어 추천합니다.

### (2) 기능별로 API 묶기

(1)에서 만든 날짜 및 Todoist 작업을 위한 라우터를 하나로 통합합니다. 저는 통합 프로세스를 `libs/api.py`에 작성했습니다.

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

하위 폴더에서 기능을 나누어 개발하고, 라우터 변수에 기능을 요약하여 `libs/api.py`에서 접근할 수 있도록 만들고, FastAPI 앱에 라우터를 로드하여 단일 API로 통합할 수 있습니다. 규모가 커질수록 이 접근 방식이 효과적이며 유지보수와 정리가 쉬워집니다. 코드 자체는 복잡하지 않으므로 소규모 프로젝트에서도 채택하는 것이 좋은 관행입니다.

### (3) FastAPI 앱을 FastAPI-MCP로 감싸 실행 가능하게 만들기

마지막으로 FastAPI 앱을 MCP 서버로 변환합니다. `libs`가 있는 위치에 `main.py`를 만들고 다음 코드를 작성합니다.

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

`libs/api.py`에서 정의한 FastAPI 앱을 FastApiMCP에 전달하고 mount 메서드를 실행하면 MCP 변환이 쉽게 이루어집니다. 로컬 PC나 Render와 같은 플랫폼에서 호스팅하면 MCP 지원 앱이 MCP 서버로 작동합니다.

## MCP 클라이언트에서 MCP 서버로 요청하기

MCP 클라이언트로는 Claude Desktop, VS Code 확장 프로그램(Cline, Continue), Cursor, 또는 MCP 저장소에 공개된 정보를 활용한 사용자 정의 MCP 클라이언트 등 여러 옵션이 있습니다. 앞서 언급했듯이 저는 Obsidian에서 Smart Composer라는 플러그인을 사용하여 일상 작업 자동화에 중점을 둔 MCP 활용을 하고 있습니다.

FastAPI로 만든 MCP 서버를 사용하려면 `mcp-proxy`가 있으면 편리하므로 uv 또는 유사한 도구를 사용하여 추가하세요.

```bash
uv tool install mcp-proxy
```

그런 다음 클라이언트 측에서 MCP 서버 정보를 구성합니다.

```json
{
  "command": "mcp-proxy",
  "args": [
    "https://example.com/mcp"
  ],
  "env": {}
}
```

macOS의 경우 `command`에 `mcp-proxy`가 기본 경로에 없는 경우 전체 경로가 필요할 수 있다는 점에 유의하세요. 올바르게 구성하면 MCP 서버에서 만든 함수 수에 해당하는 도구가 로드됩니다. 클라이언트에 따라 도구 수, 함수 이름, 함수에 필요한 값 등이 표시됩니다.

MCP 클라이언트 설정이 완료된 후 Todoist에 작업을 생성하도록 요청하면 다음과 같습니다:

![MCP](https://b.rmc-8.com/img/2025/05/24/081ec420839d5e2bfa69d9f23dafd255.png)

프롬프트에는 "내일 오후 12시 30분에 낮잠 작업을 추가해 주세요."라고 작성되어 있습니다. 그런 다음 `current_time` 함수가 현재 시간을 조회하고, 생성 AI는 조회된 날짜를 기반으로 내일이 언제인지 이해합니다. 이 날짜 정보를 사용하여 작업 마감일을 설정하고 Todoist API를 통해 낮잠 작업을 생성합니다. 사람이 작업을 만들 때는 마감일이나 우선순위를 하나씩 설정해야 잊지 않지만, 이를 생성 AI에 맡기면 훨씬 쉬워집니다.

## 요약

FastAPI를 사용하여 사용자 정의 MCP 서버를 만들었습니다. MCP 클라이언트에서 서버로 지시를 보내 날짜를 조회하거나 Todoist를 조작할 수 있음을 확인했습니다.

Python을 사용한 프로세스를 함수에 통합할 수 있으므로 웹 정보를 참조하거나 API를 통해 앱을 조작하는 프로세스를 생성 AI에 맡기고 사람이 해야 할 작업에 집중할 수 있다는 점에서 매우 편리하다고 생각합니다. 편리한 앱이라도 컴퓨터 관리로 인해 엄격하고 세부적인 규칙이 설정되어 있으며, 저는 아날로그 도구와 다른 "소프트웨어의 냄새"라고 부를 수 있는 것을 느낍니다.

MCP를 사용하면 "소프트웨어의 냄새"를 느끼지 않고 인간의 사고에 따라 데이터를 다룰 수 있어 이전과는 다른 자연스러운 경험이 제공됩니다. 개발자나 프롬프트 엔지니어 분들께 MCP로 많이 놀아보시길 권장드립니다.
