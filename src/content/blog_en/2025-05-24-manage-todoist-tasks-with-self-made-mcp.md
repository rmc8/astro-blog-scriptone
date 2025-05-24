---
title: Managing Todoist Tasks with a Self-Made MCP Server Using FastAPI
slug: manage_todoist_tasks_with_self_made_mcp
description: Build a custom MCP server with FastAPI to manage Todoist tasks. This enables task management through chat interfaces from MCP clients like VSC or Obsidian's Smart Composer.
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

## Overview

This article introduces how to build a custom MCP server using FastAPI to manage Todoist tasks. By leveraging MCP, it becomes possible to use generative AI to create tasks from unstructured data, set priorities, and define deadlines. Additionally, I will explain how to retrieve Todoist tasks, summarize tasks for the next day, or plan schedules. The benefits of combining FastAPI and MCP for natural, conversation-based task management will be discussed with specific code examples.

## Languages and Main Libraries Used

* Python 3.12 or later: Versions 3.12 and above are recommended for using FastAPI with type aliases. Some libraries utilize syntax specific to 3.12 or later.
* Libraries
  * FastAPI: Lightweight like Flask, yet allows for robust backend API development using type aliases.
  * FastAPI-MCP: Converts FastAPI applications into MCP servers.
  * Pydantic: Used for defining types in FastAPI.
  * todoist-api-python: A library for easily interacting with the Todoist API from Python. It eliminates the need to write API request handling manually, so use it unless you have specific requirements.

## What You Can Do with Todoist via MCP

MCP is a mechanism that allows generative AI to directly influence external tools, similar to Function Calling, but differs in that it communicates with an MCP server via HTTP. Its advantage lies in the ease of reuse and clear separation of processes, as it delegates tasks to existing servers or custom web/local servers.

Since the MCP server sends requests to the Todoist API, the core functionality of Todoist remains unchanged. However, MCP clients can interpret context before performing Todoist operations. For instance, when a user wants to create a task from a note, the generative AI can generate a request tailored for Todoist and send it. It can transform unstructured data into a format suitable for the Todoist API, decide on task priorities or deadlines, and structure the data for the API using AI. This allows humans to create tasks naturally, as if speaking or thinking, without special operations. Additionally, tasks registered in Todoist can be read via MCP to summarize tasks for the next day or create schedules, making it easy to integrate AI's decision-making and data structuring capabilities into Todoist. The significant advantage of MCP-mediated operations is the ability to freely add functionality using APIs and AI, and handle these functions conversationally.

### My Use Case

I use a text editor called Obsidian to jot down daily notes or diaries. Obsidian has a plugin feature, and by adding a plugin called Smart Composer, I can use generative AI for chat, text extraction via RAG, and MCP client functionalities.

Based on notes written in Obsidian, I convert ideas into Todoist tasks, retrieve task lists to summarize tasks for the next day, or allocate time to create schedules.

## Code

The code is broadly divided into three parts: (1) the FastAPI API section, (2) the section that bundles APIs by functionality, and (3) the section that wraps the FastAPI app with FastAPI-MCP to make it executable.

Dividing the API section by functionality makes maintenance easier and prevents a single file from becoming overly large. In this case, I will write processes for Todoist operations and date information retrieval. Next, I will aggregate the APIs for Todoist and date operations into a single app. Finally, I will convert the aggregated FastAPI app into an MCP server.

### Installing Libraries

Install the libraries using pip or similar tools.

```bash
python -m pip install fastapi pydantic todoist-api-python fastapi-mcp
```

If there are missing libraries or if you use a different package manager, please adjust accordingly for your environment.

### (1) FastAPI API Section

Here, I write code to handle requests on the web side and perform Todoist operations. Additionally, I include a process to retrieve date information. Asking generative AI for the current date and time might not yield accurate results. Although it may seem very intelligent, it does not understand real-time information. Making date information accessible on the server side is convenient. With date support, operations like setting a task deadline for tomorrow become possible. Users no longer need to manually provide dates, as the system can decide automatically, making it highly beneficial in terms of convenience and cost.

#### Code to Retrieve Date Information

Write the following code in any location. I have placed it in `libs/utils/__init__.py` for now.

```py
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter

router = APIRouter(prefix="/utils", tags=["utils"])


@router.post("/current_time", operation_id="current_time", response_model=None)
async def get_current_time() -> datetime:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo"))
```

The process is very simple, merely returning the current date and time in JST. Using `APIRouter`, you can create a `@router` to define functions for processing while maintaining a hierarchical structure. Adding `.post` or `.get` after the `@router` decorator specifies the request method.

The router is important as it will be used later in step (2) to aggregate APIs by functionality into one. When naming, avoid using an underscore (_) as the first character and treat it as a public variable.

#### Code to Operate Todoist

Similarly, write the following code in any location. I have placed it in `libs/todoist/__init__.py` for now.

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
    """Model defining parameters for Todoist tasks."""
    content: str = Field(description="Task name")
    description: str | None = Field(description="Task description")
    priority: Literal[1, 2, 3, 4] | None = Field(description="Task priority. 1 is the highest priority, and 4 is the lowest. If not specified, set to None by default.")
    due_datetime: datetime | None = Field(description="Task deadline")


def _get_tasks() -> list[Task]:
    """
    Retrieve all tasks from Todoist API.

    Returns:
        list[Task]: List of retrieved tasks.

    Raises:
        Exception: If API call fails.
    """
    try:
        api = TodoistAPI(token=todoist_api_key)
        tasks_objs = api.get_tasks()
        tasks = []
        for tasks_obj in tasks_objs:
            tasks.extend(tasks_obj)
    except Exception as e:
        msg = str(e)
        logger.exception("Failed to retrieve tasks: %s", msg)
        raise
    else:
        return tasks


def _get_someday_tasks(date: date) -> list[Task]:
    """
    Retrieve tasks with a deadline set for a specific date.

    Args:
        date (date): Deadline date for tasks.

    Returns:
        list[Task]: List of tasks with deadlines on the specified date.
    """
    tasks = _get_tasks()
    return [t for t in tasks if t.due is not None and t.due.date == date]


def _get_today_tasks() -> list[Task]:
    """
    Retrieve today's tasks.

    Returns:
        list[Task]: List of tasks with deadlines set for today.
    """
    return _get_someday_tasks(today)


def _get_tomorrow_tasks() -> list[Task]:
    """
    Retrieve tomorrow's tasks.

    Returns:
        list[Task]: List of tasks with deadlines set for tomorrow.
    """
    return _get_someday_tasks(tomorrow)


def _get_yesterday_tasks() -> list[Task]:
    """
    Retrieve yesterday's tasks.

    Returns:
        list[Task]: List of tasks with deadlines set for yesterday.
    """
    return _get_someday_tasks(yesterday)


def _get_this_week_tasks() -> list[Task]:
    """
    Retrieve this week's tasks.

    Returns:
        list[Task]: List of tasks with deadlines set for this week.
    """
    tasks = _get_tasks()
    return [t for t in tasks if t.due is not None and this_week >= t.due.date >= today]


router = APIRouter(prefix="/todoist", tags=["todoist"])


@router.post("/get_today_tasks", operation_id="get_today_tasks", response_model=None)
async def get_today_tasks() -> list[Task]:
    """
    Endpoint to retrieve today's tasks from Todoist.

    Returns:
        list[Task]: List of tasks for today.

    Raises:
        HTTPException: If API call fails.
    """
    try:
        return _get_today_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("Error in today's tasks endpoint: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_tomorrow_tasks", operation_id="get_tomorrow_tasks", response_model=None)
async def get_tomorrow_tasks() -> list[Task]:
    """
    Endpoint to retrieve tomorrow's tasks from Todoist.

    Returns:
        list[Task]: List of tasks for tomorrow.

    Raises:
        HTTPException: If API call fails.
    """
    try:
        return _get_tomorrow_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("Error in tomorrow's tasks endpoint: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_yesterday_tasks", operation_id="get_yesterday_tasks", response_model=None)
async def get_yesterday_tasks() -> list[Task]:
    """
    Endpoint to retrieve yesterday's tasks from Todoist.

    Returns:
        list[Task]: List of tasks for yesterday.

    Raises:
        HTTPException: If API call fails.
    """
    try:
        return _get_yesterday_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("Error in yesterday's tasks endpoint: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post("/get_this_week_tasks", operation_id="get_this_week_tasks", response_model=None)
async def get_this_week_tasks() -> list[Task]:
    """
    Endpoint to retrieve this week's tasks from Todoist.

    Returns:
        list[Task]: List of tasks for this week.

    Raises:
        HTTPException: If API call fails.
    """
    try:
        return _get_this_week_tasks()
    except Exception as e:
        msg = str(e)
        logger.exception("Error in this week's tasks endpoint: %s", msg)
        raise fastapi.HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/put_task",
    operation_id="put_task",
)
async def put_task(task_param: Annotated[TaskParam, fastapi.Body(embed=True)]) -> dict[str, str]:
    """
    Endpoint to add a new task to Todoist.

    Args:
        task_param (TaskParam): Parameters of the task to add.

    Returns:
        dict[str, str]: Result of the operation. On success, includes status and success message; on failure, includes error message.
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
        logger.info("Added task '%s'.", task_param.content)

    except Exception as e:
        msg = str(e)
        logger.exception("Error in task addition endpoint: %s", msg)
        return {"status": "error", "message": msg}
    else:
        return {"status": "success", "message": "Task added successfully."}


@router.post(
    "/put_tasks",
    operation_id="put_tasks",
)
async def put_tasks(task_params: Annotated[list[TaskParam], fastapi.Body(embed=True)]) -> dict[str, list[dict[str, str]]]:
    """
    Endpoint to add multiple new tasks to Todoist.

    Args:
        task_params (list[TaskParam]): List of task parameters to add.

    Returns:
        dict[str, list[dict[str, str]]]: List of results for each task operation.
    """
    results: list[dict[str, str]] = []
    for task_param in task_params:
        r = await put_task(task_param)
        results.append(r)
    logger.info("Completed processing for %s tasks.", str(len(results)))
    return {"results": results}

```

The API token is set to be received via environment variables. While there might be ways to set variables on the client side, I couldn't figure out how to make it work smoothly with Smart Composer, so for now, I manage it on the server side through environment variables. When using FastAPI and MCP, it's necessary to explicitly state what values a function takes and returns. Python is a dynamically typed language, so those unfamiliar with type aliases, Pydantic, or mypy might find this challenging. However, it's beneficial for code completion during development and compatibility with generative AI. Additionally, it's essential for accurate processing in MCP, so although the code becomes longer, it's something to accept. Function arguments require type specification in the form `Annotated[<T>, fastapi.Body(embed=True)]`. The `<T>` part can be built-in types like `str` or `int`, as well as types defined with Pydantic. When parameters used in API communication or return values have complex structures, aggregating information into a single type with Pydantic makes arguments and return values easier to express, which I recommend.

### (2) Bundling APIs by Functionality

Aggregate the routers for date and Todoist operations created in (1) into one. I have written the aggregation process in `libs/api.py`.

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

By developing functionalities in subfolders, summarizing them in router variables, making them accessible to `libs/api.py`, and loading the routers into the FastAPI app, you can integrate them into a single API. This approach becomes more effective as the scale grows, making maintenance and organization easier. The code itself isn't complex, so it's a good practice to adopt even for smaller projects.

### (3) Wrapping the FastAPI App with FastAPI-MCP to Make It Executable

Finally, convert the FastAPI app into an MCP server. Create `main.py` in the location where `libs` exists and write the following code.

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

By passing the FastAPI app defined in `libs/api.py` to FastApiMCP and executing the mount method, MCP conversion is easily achieved. Once hosted on a local PC or platforms like Render, the MCP-enabled app operates as an MCP server.

## Requesting MCP Server from MCP Client

There are several options for MCP clients, such as Claude Desktop, VS Code extensions (Cline, Continue), Cursor, or custom MCP clients using information published in the MCP repository. As mentioned earlier, I use a plugin called Smart Composer in Obsidian for MCP utilization focused on daily task automation.

To use the MCP server created with FastAPI, having `mcp-proxy` is convenient, so add it using uv or similar tools.

```bash
uv tool install mcp-proxy
```

Then, configure the MCP server information on the client side.

```json
{
  "command": "mcp-proxy",
  "args": [
    "https://example.com/mcp"
  ],
  "env": {}
}
```

Note that for macOS, the `command` may require a full path if `mcp-proxy` is not in the default path. When configured correctly, tools corresponding to the functions created on the MCP server are loaded. Depending on the client, the number of tools, function names, and required values for functions are displayed.

After completing the MCP client setup, requesting to create a task in Todoist looks like this:

![MCP](https://b.rmc-8.com/img/2025/05/24/081ec420839d5e2bfa69d9f23dafd255.png)

The prompt states, "Please add a nap task for tomorrow at 12:30 PM." Then, the `current_time` function retrieves the current time, and the generative AI understands what date tomorrow is based on the retrieved date. Using this date information, it sets the task deadline and creates a nap task via the Todoist API. When humans create tasks, they need to set deadlines or priorities one by one to avoid forgetting, but delegating this to generative AI makes it much easier.

## Summary

I created a custom MCP server using FastAPI. I confirmed that instructions can be sent from an MCP client to the server to retrieve dates or operate Todoist.

Since processes using Python can be incorporated into functions, it's very convenient to create processes that reference web information or operate apps via APIs, delegating to generative AI and allowing humans to focus on tasks they should do. Even with convenient apps, due to computer management, strict and detailed rules are set, and I feel what could be called the "smell of software," different from analog tools.

Using MCP, handling data according to human thought without feeling the "smell of software" offers a natural experience different from before. I think developers and prompt engineers should definitely play around with MCP a lot.
