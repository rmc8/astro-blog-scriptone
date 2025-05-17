---
title: "공식 Notion API를 Python으로 사용하기( Notion SDK for Python)"
slug: "using-notion-api-with-python"
description: ""
date: 2023-06-27T16:48:20.257Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/notion.webp"
draft: false
tags: ['Python', 'Notion', 'API']
categories: ['Programming']
---

<p>Python으로 Notion API(Public Beta)를 사용해 보겠습니다.</p><h2 id="h9707d3a59a">개요</h2><p>2021년 5월에 Notion의 API가 공개되었습니다. 이전에는 <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">notin-py</a>와 같은 비공식 API를 사용하는 수밖에 없었습니다. Public Beta 단계이지만, 공식 API를 사용하여 Notion을 조작하는 한국어 정보가 부족하므로 간단히 설명하겠습니다. 자세한 확인은 영어이지만 공식 문서가 매우 유용합니다.<br>현재 Notion은 한국어 지원이 되지 않으므로, Notion의 언어는 영어 상태로 절차를 설명합니다.</p><ul><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Notion API</a></li><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Notion SDK for Python</a></li><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">[FYI] notion-py</a></li></ul><h2 id="h31d727ccda">준비</h2><h3 id="h56d25f79e1">Installation</h3><p>pip 등을 사용하여 <code>notion-client</code>을 설치합니다.</p><pre><code class="language-shell hljs">pip install notion-client
</code></pre><h3 id="h35695e9877">Integrations</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">https://www.notion.so/my-integrations</a>에서 Integration을 생성합니다. <code>notion-client</code>로 생성한 Integration을 사용하여 Notion API를 호출합니다.</p><h4 id="h046876a126">절차</h4><ul><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">페이지</a>에 접근합니다.</li><li>［New integration］을 클릭합니다.</li><li>폼에 값을 입력합니다.<ul><li>Integration 이름을 입력합니다. (e.g. myIntg)</li><li>아이콘을 설정합니다. (선택사항)</li><li>API로 조작할 Workspaces를 선택합니다.</li></ul></li><li>［Submit］을 클릭합니다.<br>일련의 작업을 마치면, Token이 발급됩니다. ［Secret］의 <code>Internal Integration Token</code> 텍스트 박스를 클릭하면 Token을 표시할 수 있습니다. 다시 클릭하여 Token을 복사하세요.<br>복사한 Token은 환경 변수 <code>NOTION_TOKEN</code>에 설정하거나, 메모장 등에 붙여넣으세요.</li></ul><h3 id="h3d0309d9da">Integration Invitations（중요）</h3><p>Integration을 생성했지만, 그대로 두면 API를 충분히 사용할 수 없습니다. Workspaces에 접근하여 다음 절차로 조작을 준비합니다.</p><ul><li>API로 조작하고 싶은 페이지를 선택합니다.</li><li>화면 상단의 바에서 Share를 클릭합니다.</li><li>［Invite］를 클릭합니다.</li><li>생성한 Integration을 클릭합니다.</li><li>［Invite］를 클릭합니다.</li></ul><p>조작 후, Share 목록에 생성한 Integration이 표시되면 그 페이지를 API를 통해 조작할 수 있습니다.</p><h3 id="hf1ecb3158c">Python에서 API 인증하기</h3><p>Python에서 API를 조작할 준비를 합니다. 다음 코드를 사용하여 인증합니다.</p><pre><code class="language-python hljs">import os

from notion_client import Client

token: str = os.environ.get("NOTION_TOKEN", "yourToken")
notion = Client(auth=token)
</code></pre><p>공식 문서를 따르세요. 환경 변수를 사용하여 token을 입력합니다. 환경 변수가 잘 모르거나, <code>os.environ</code> 부분에서 에러가 발생하면, <code>"yourToken"</code>을 메모장 등에 붙여넣은 Token으로 바꾸어 다시 실행하세요 (이때, GitHub 등에 Token을 공유하지 않도록 주의하세요).<br>Error의 Response가 없으면, 일단 API 인증이 완료됩니다.</p><h3 id="hb9451998cb">사용자 정보 얻기(UserEndpoint)</h3><p>준비의 마지막 단계로, <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">UsersEndpoint</a>를 사용하여 사용자 정보를 얻습니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; from pprint import pprint
&gt;&gt;&gt;
&gt;&gt;&gt; list_users_response = notion.users.list()
&gt;&gt;&gt; pprint(list_users_response)
{'has_more': False,
 'next_cursor': None,
 'object': 'list',
 'results': [{'avatar_url': 'https://lh3.googleusercontent.com/a-/HOGEHOGE',
             'id': '323343xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
             'name': 'yourName',
             'object': 'user',
             'person': {'email': 'yourAddress@gmail.com'},
             'type': 'person'},
            {'avatar_url': None,
             'bot': {},
             'id': '323343xx-yyyy-yyyy-yyyy-xxxxxxxxxxxx,
             'name': 'myIntg',
             'object': 'user',
             'type': 'bot'},
            ]}
</code></pre><h3 id="h30db973bee">ID</h3><p>Notion의 API를 사용할 때, ID로 조작 대상을 지정합니다. URL에서 어느 정도 ID를 확인할 수 있습니다. Page ID보다 하위에 있는 ID는 API를 호출하거나, Chrome의 Developer 도구 등에서 확인해야 합니다.</p><pre><code class="hljs">https://www.notion.so/1349f9e927674a03a87d772483dd5b1b?v=05282e02290749fd95decb0df0dc3f5c&amp;p=de3635356a224c569f103a2038dc3521
                     |--------- Database ID ---------|
                                      |--------- Page ID ------------|
</code></pre><h2 id="hb9b8690a99">API 사용하기</h2><h3 id="h6082932692">SearchEndpoint</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">SearchEndpoint</a>에서는 페이지나 데이터베이스의 검색이 가능합니다. Query 인수에 검색할 텍스트를 입력하면, 일치하는 페이지나 데이터베이스를 반환합니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; from pprint import pprint
&gt;&gt;&gt;
&gt;&gt;&gt; ret = notion.search(query="My", )
&gt;&gt;&gt; pprint(ret)
{'has_more': False,
 'next_cursor': None,
 'object': 'list',
 'results': [{'archived': False,
             'created_time': '2021-06-26T05:29:00.000Z',
             'id': '65431967-c345-4c73-94eb-089c7781874f',
             'last_edited_time': '2021-06-27T02:37:36.229Z',
             'object': 'page',
             'parent': {'type': 'workspace', 'workspace': True},
             'properties': {'title': {'id': 'title',
                                      'title': [{'annotations': {'bold': False,
                                                                 'code': False,
                                                                 'color': 'default',
                                                                 'italic': False,
                                                                 'strikethrough': False,
                                                                 'underline': False},
                                                 'href': None,
                                                 'plain_text': 'MyTask',
                                                 'text': {'content': 'MyTask',
                                                          'link': None},
                                                 'type': 'text'}],
                                      'type': 'title'}}}]}
</code></pre><h3 id="h15d56a3788">DatabasesEndpoint</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">DatabasesEndpoint</a>로 데이터베이스 관련 조작이 가능합니다.</p><h4 id="h05a51bf494">list</h4><p>데이터베이스의 목록과 데이터베이스의 정의를 얻을 수 있습니다. 데이터베이스의 정의는 API(Query)를 사용하여 값을 업데이트할 때 유용합니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.list()
&gt;&gt;&gt; pprint(ret)
{'has_more': False,
 'next_cursor': None,
 'object': 'list',
 'results': [{'created_time': '2021-06-26T04:01:53.032Z',
             'id': '1349f9e9-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
             'last_edited_time': '2021-06-27T02:37:36.229Z',
             'object': 'database',
             'parent': {'type': 'workspace', 'workspace': True},
             'properties': {'Created': {'created_time': {},
                                        'id': 's]Ff',
                                        'type': 'created_time'},
                            'Favorite': {'checkbox': {},
                                         'id': 'VQ{u',
                                         'type': 'checkbox'},
                            'Name': {'id': 'title',
                                     'title': {},
                                     'type': 'title'},
                            'Notion': {'id': 'ta`F',
                                       'rich_text': {},
                                       'type': 'rich_text'},
                            'Tags': {'id': '{OB\',
                                     'multi_select': {'options': [{'color': 'pink',
                                                                   'id': 'fd33a0a5-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
                                                                   'name': 'Notion'},
                                                                  {'color': 'red',
                                                                   'id': '035c85d1-zzzz-zzzz-zzzz-zzzzzzzzzzzz',
                                                                   'name': 'Python'},
                                                                  {'color': 'green',
                                                                   'id': 'b8f93b98-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                                                                   'name': 'DLL'},
                                                                  {'color': 'green',
                                                                   'id': '38341073-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                                                                   'name': 'GoLang'},
                                                                  {'color': 'brown',
                                                                   'id': 'b77ec500-cccc-cccc-cccc-cccccccccc',
                                                                   'name': 'API'},
                                                                  {'color': 'blue',
                                                                   'id': 'f0613703-dddd-dddd-dddd-dddddddddddd',
                                                                   'name': 'Swift'}]},
                                     'type': 'multi_select'},
                            'URL': {'id': 'b;Si', 'type': 'url', 'url': {}}},
             'title': [{'annotations': {'bold': False,
                                        'code': False,
                                        'color': 'default',
                                        'italic': False,
                                        'strikethrough': False,
                                        'underline': False},
                        'href': None,
                        'plain_text': 'WebClips',
                        'text': {'content': 'WebClips', 'link': None},
                        'type': 'text'}]},
            {'created_time': '2021-06-26T13:02:55.254Z',
             'id': '9da953b5-dddd-dddd-dddd-dddddddddddd',
             'last_edited_time': '2021-06-27T03:36:00.000Z',
             'object': 'database',
             'parent': {'type': 'workspace', 'workspace': True},
             'properties': {'Created': {'created_time': {},
                                        'id': ']r?p',
                                        'type': 'created_time'},
                            'Ebook': {'checkbox': {},
                                      'id': 'An=Z',
                                      'type': 'checkbox'},
                            'Favorite': {'checkbox': {},
                                         'id': 'iHkR',
                                         'type': 'checkbox'},
                            'Name': {'id': 'title',
                                     'title': {},
                                     'type': 'title'},
                            'Rate': {'id': '\\Lit',
                                     'select': {'options': [{'color': 'red',
                                                             'id': '64d85ca2-eeee-eeee-eeee-eeeeeeeeeeee',
                                                             'name': '5'},
                                                            {'color': 'pink',
                                                             'id': '2ec6eb09-ffff-ffff-ffff-ffffffffffff',
                                                             'name': '4'},
                                                            {'color': 'gray',
                                                             'id': 'e86ef2d6-gggg-gggg-gggg-gggggggggggg',
                                                             'name': '3'},
                                                            {'color': 'purple',
                                                             'id': '10c2e5f8-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
                                                             'name': '2'},
                                                            {'color': 'green',
                                                             'id': '75aeb67c-iiii-iiii-iiii-iiiiiiiiiiii',
                                                             'name': '1'}]},
                                     'type': 'select'},
                            'Tags': {'id': 'bdzl',
                                     'select': {'options': [{'color': 'blue',
                                                             'id': '3d2d9f81-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
                                                             'name': 'Bought'},
                                                            {'color': 'orange',
                                                             'id': '98f3d800-gggg-gggg-gggg-gggggggggg',
                                                             'name': 'Read'},
                                                            {'color': 'red',
                                                             'id': 'cdbbc5aa-kkkk-kkkk-kkkk-kkkkkkkkkkkk',
                                                             'name': 'Reviewd'},
                                                            {'color': 'pink',
                                                             'id': 'b534b43e-llll-llll-llllllllllll',
                                                             'name': 'Reading'},
                                                            {'color': 'yellow',
                                                             'id': '12863085-mmmm-mmmm-mmmm-mmmmmmmmmmmm',
                                                             'name': 'Pending'}]},
                                     'type': 'select'},
                            'URL': {'id': 'DFAE', 'type': 'url', 'url': {}}},
             'title': [{'annotations': {'bold': False,
                                        'code': False,
                                        'color': 'default',
                                        'italic': False,
                                        'strikethrough': False,
                                        'underline': False},
                        'href': None,
                        'plain_text': 'Bookshelf',
                        'text': {'content': 'Bookshelf', 'link': None},
                        'type': 'text'}]}]}
</code></pre><h4 id="hccfefa60e5">query</h4><p>query를 사용하면 데이터베이스의 행을 추출할 수 있습니다. <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">filter</a>는 별도의 문서가 있으며, 열의 Type에 따라 Filter 방법 등이 설명되어 있습니다. 다음은 지정된 database_id의 Tags 열(multi_select type)에 값 <code>Swift</code>가 포함된 레코드를 추출하는 쿼리입니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.query(
...     **{
...         "database_id": "1349f9e927674a03a87d772483dd5b1b",
...         "filter": {
...             "property": "Tags",
...             "multi_select": {
...                 "contains": "Swift"
...             }
...         }
...     }
... )
&gt;&gt;&gt; pprint(ret)
{'has_more': False,
 'next_cursor': None,
 'object': 'list',
 'results': [{'archived': False,
             'created_time': '2021-06-26T05:33:23.002Z',
             'id': 'd74a8d3e-73c0-4d04-817a-897192fbfb2e',
             'last_edited_time': '2021-06-26T05:33:00.000Z',
             'object': 'page',
             'parent': {'database_id': '1349f9e9-2767-4a03-a87d-772483dd5b1b',
                        'type': 'database_id'},
             'properties': {'Created': {'created_time': '2021-06-26T05:33:23.002Z',
                                        'id': 's]Ff',
                                        'type': 'created_time'},
                            'Favorite': {'checkbox': False,
                                         'id': 'VQ{u',
                                         'type': 'checkbox'},
                            'Name': {'id': 'title',
                                     'title': [{'annotations': {'bold': False,
                                                                'code': False,
                                                                'color': 'default',
                                                                'italic': False,
                                                                'strikethrough': False,
                                                                'underline': False},
                                                'href': None,
                                                'plain_text': 'noppefoxwolf/notion: noppefoxwolf/notion is a notion.so API library written in swift.',
                                                'text': {'content': 'noppefoxwolf/notion: noppefoxwolf/notion is a notion.so API library written in swift.',
                                                         'link': None},
                                                'type': 'text'}],
                                     'type': 'title'},
                            'Notion': {'id': 'ta`F',
                                       'rich_text': [],
                                       'type': 'rich_text'},
                            'Tags': {'id': '{OB\',
                                     'multi_select': [{'color': 'pink',
                                                       'id': 'fd33a0a5-5c7a-469d-aafc-168106a15208',
                                                       'name': 'Notion'},
                                                      {'color': 'brown',
                                                       'id': 'b77ec500-aed1-45b0-be10-06a38973273f',
                                                       'name': 'API'},
                                                      {'color': 'blue',
                                                       'id': 'f0613703-e876-4dbd-8ff3-2f08f158d07e',
                                                       'name': 'Swift'}],
                                     'type': 'multi_select'},
                            'URL': {'id': 'b;Si',
                                    'type': 'url',
                                    'url': 'https://github.com/noppefoxwolf/notion'}}}]}
</code></pre><p>Query 내의 딕셔너리 앞에 붙은 <code>**</code>는 <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">딕셔너리 언패킹</a>입니다. 다음과 같습니다.</p><pre><code class="language-python hljs">ret = notion.databases.query(
    database_id="1349f9e927674a03a87d772483dd5b1b",
    filter={
        "property": "Tags",
        "multi_select": {
                "contains": "Swift"
        }
    }
)
</code></pre><h4 id="h1d4310746d">retrieve</h4><p>database_id에 해당하는 데이터베이스의 정보를 얻습니다. ID가 필요하지만, 단일 데이터베이스의 정보를 얻을 수 있고, 간단한 구조로 편리합니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.retrieve(database_id="1349f9e927674a03a87d772483dd5b1b")
&gt;&gt;&gt; pprint(ret)
{'created_time': '2021-06-26T04:01:53.032Z',
 'id': '1349f9e9-2767-4a03-a87d-772483dd5b1b',
 'last_edited_time': '2021-06-27T02:37:36.229Z',
 'object': 'database',
 'parent': {'type': 'workspace', 'workspace': True},
 'properties': {'Created': {'created_time': {},
                            'id': 's]Ff',
                            'type': 'created_time'},
                'Favorite': {'checkbox': {}, 'id': 'VQ{u', 'type': 'checkbox'},
                'Name': {'id': 'title', 'title': {}, 'type': 'title'},
                'Notion': {'id': 'ta`F', 'rich_text': {}, 'type': 'rich_text'},
                'Tags': {'id': '{OB\',
                         'multi_select': {'options': [{'color': 'pink',
                                                       'id': 'fd33a0a5-5c7a-469d-aafc-168106a15208',
                                                       'name': 'Notion'},
                                                      {'color': 'red',
                                                       'id': '035c85d1-e9a0-4b40-9f7b-0f78516b084f',
                                                       'name': 'Python'},
                                                      {'color': 'green',
                                                       'id': 'b8f93b98-2f81-4e4f-913a-9e355aef267c',
                                                       'name': 'DLL'},
                                                      {'color': 'green',
                                                       'id': '38341073-3d35-46f3-84bc-baeab8d3093f',
                                                       'name': 'GoLang'},
                                                      {'color': 'brown',
                                                       'id': 'b77ec500-aed1-45b0-be10-06a38973273f',
                                                       'name': 'API'},
                                                      {'color': 'blue',
                                                       'id': 'f0613703-e876-4dbd-8ff3-2f08f158d07e',
                                                       'name': 'Swift'}]},
                         'type': 'multi_select'},
                'URL': {'id': 'b;Si', 'type': 'url', 'url': {}}},
 'title': [{'annotations': {'bold': False,
                            'code': False,
                            'color': 'default',
                            'italic': False,
                            'strikethrough': False,
                            'underline': False},
            'href': None,
            'plain_text': 'WebClips',
            'text': {'content': 'WebClips', 'link': None},
            'type': 'text'}]}
</code></pre><h3 id="h95689e9c8a">PagesEndpoint</h3><p>페이지의 조작이 가능합니다.</p><h4 id="ha278f9d5a2">create</h4><p>page에 값을 추가할 수 있습니다. 다음은 페이지 내의 테이블에 값을 추가하는 코드입니다. <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">properties</a>의 설정 방법은 문서를 확인하세요.</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.create(
... **{
...         "parent": {"database_id": "1349f9e927674a03a87d772483dd5b1b"},
...         "properties": {
...             "Name": {
...                 "title": [
...                     {
...                         "text": {
...                             "content": "TEST"
...                         }
...                     }
...                 ]
...             },
...             "URL": {
...                 "url": "https://google.com"
...             },
...             "Favorite": {
...                 "checkbox": True
...             },
...             "Tags": {
...                 "multi_select": [
...                     {"name": tag} for tag in "Python,API".split(",")
...                 ]
...             }
...         }
...     }
... )
&gt;&gt;&gt; pprint(ret)
{'archived': False,
 'created_time': '2021-06-27T05:18:59.743Z',
 'id': 'de363535-6a22-4c56-9f10-3a2038dc3521',
 'last_edited_time': '2021-06-27T05:18:59.743Z',
 'object': 'page',
 'parent': {'database_id': '1349f9e9-2767-4a03-a87d-772483dd5b1b',
            'type': 'database_id'},
 'properties': {'Created': {'created_time': '2021-06-27T05:18:59.743Z',
                            'id': 's]Ff',
                            'type': 'created_time'},
                'Favorite': {'checkbox': True,
                             'id': 'VQ{u',
                             'type': 'checkbox'},
                'Name': {'id': 'title',
                         'title': [{'annotations': {'bold': False,
                                                    'code': False,
                                                    'color': 'default',
                                                    'italic': False,
                                                    'strikethrough': False,
                                                    'underline': False},
                                    'href': None,
                                    'plain_text': 'TEST',
                                    'text': {'content': 'TEST', 'link': None},
                                    'type': 'text'}],
                         'type': 'title'},
                'Tags': {'id': '{OB\',
                         'multi_select': [{'color': 'red',
                                           'id': '035c85d1-e9a0-4b40-9f7b-0f78516b084f',
                                           'name': 'Python'},
                                          {'color': 'brown',
                                           'id': 'b77ec500-aed1-45b0-be10-06a38973273f',
                                           'name': 'API'}],
                         'type': 'multi_select'},
                'URL': {'id': 'b;Si',
                        'type': 'url',
                        'url': 'https://google.com'}}}
</code></pre><h4 id="h1d4310746d">retrieve</h4><p>page_id에 해당하는 대상의 정보를 얻습니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.retrieve(page_id="de3635356a224c569f103a2038dc3521")
&gt;&gt;&gt; pprint(ret)
{'archived': False,
 'created_time': '2021-06-27T05:18:59.743Z',
 'id': 'de363535-6a22-4c56-9f10-3a2038dc3521',
 'last_edited_time': '2021-06-27T05:20:00.000Z',
 'object': 'page',
 'parent': {'database_id': '1349f9e9-2767-4a03-a87d-772483dd5b1b',
            'type': 'database_id'},
 'properties': {'Created': {'created_time': '2021-06-27T05:18:59.743Z',
                            'id': 's]Ff',
                            'type': 'created_time'},
                'Favorite': {'checkbox': True,
                             'id': 'VQ{u',
                             'type': 'checkbox'},
                'Name': {'id': 'title',
                         'title': [{'annotations': {'bold': False,
                                                    'code': False,
                                                    'color': 'default',
                                                    'italic': False,
                                                    'strikethrough': False,
                                                    'underline': False},
                                    'href': None,
                                    'plain_text': 'TEST',
                                    'text': {'content': 'TEST', 'link': None},
                                    'type': 'text'}],
                         'type': 'title'},
                'Tags': {'id': '{OB\',
                         'multi_select': [{'color': 'red',
                                           'id': '035c85d1-e9a0-4b40-9f7b-0f78516b084f',
                                           'name': 'Python'},
                                          {'color': 'brown',
                                           'id': 'b77ec500-aed1-45b0-be10-06a38973273f',
                                           'name': 'API'}],
                         'type': 'multi_select'},
                'URL': {'id': 'b;Si',
                        'type': 'url',
                        'url': 'https://google.com'}}}
</code></pre><h4 id="hf4867d209f">update</h4><p>page_id에 해당하는 propaties의 값을 업데이트합니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.update(
...     **{
...         "page_id": "de3635356a224c569f103a2038dc3521",
...         "properties": {
...             "Name": {
...                 "title": [
...                     {
...                         "text": {
...                             "content": "UPDATE_TEST"
...                         }
...                     }
...                 ]
...             }
...         }
...     }
... )
&gt;&gt;&gt; pprint(ret)
{'archived': False,
 'created_time': '2021-06-27T05:18:59.743Z',
 'id': 'de363535-6a22-4c56-9f10-3a2038dc3521',
 'last_edited_time': '2021-06-27T05:36:47.559Z',
 'object': 'page',
 'parent': {'database_id': '1349f9e9-2767-4a03-a87d-772483dd5b1b',
            'type': 'database_id'},
 'properties': {'Created': {'created_time': '2021-06-27T05:18:59.743Z',
                            'id': 's]Ff',
                            'type': 'created_time'},
                'Favorite': {'checkbox': True,
                             'id': 'VQ{u',
                             'type': 'checkbox'},
                'Name': {'id': 'title',
                         'title': [{'annotations': {'bold': False,
                                                    'code': False,
                                                    'color': 'default',
                                                    'italic': False,
                                                    'strikethrough': False,
                                                    'underline': False},
                                    'href': None,
                                    'plain_text': 'UPDATE_TEST',
                                    'text': {'content': 'UPDATE_TEST',
                                             'link': None},
                                    'type': 'text'}],
                         'type': 'title'},
                'Tags': {'id': '{OB\',
                         'multi_select': [{'color': 'red',
                                           'id': '035c85d1-e9a0-4b40-9f7b-0f78516b084f',
                                           'name': 'Python'},
                                          {'color': 'brown',
                                           'id': 'b77ec500-aed1-45b0-be10-06a38973273f',
                                           'name': 'API'}],
                         'type': 'multi_select'},
                'URL': {'id': 'b;Si',
                        'type': 'url',
                        'url': 'https://google.com'}}}
</code></pre><h3 id="h912a4c0433">BlocksEndpoint</h3><p>블록의 편집을 합니다.</p><h4 id="h05a51bf494">list</h4><p>블록의 목록을 얻습니다. page_id 또는 block_id를 사용합니다. page_id를 사용하면 페이지 내의 블록을 얻을 수 있습니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; page_id: str = "098ebc861d35448a9dd725184512e95d"
&gt;&gt;&gt; ret = notion.blocks.children.list(block_id=page_id)
&gt;&gt;&gt; pprint(ret)
{'has_more': False,
 'next_cursor': None,
 'object': 'list',
 'results': [{'created_time': '2021-06-27T06:07:00.000Z',
             'has_children': False,
             'heading_2': {'text': [{'annotations': {'bold': False,
                                                     'code': False,
                                                     'color': 'default',
                                                     'italic': False,
                                                     'strikethrough': False,
                                                     'underline': False},
                                     'href': None,
                                     'plain_text': 'Summary',
                                     'text': {'content': 'Summary',
                                              'link': None},
                                     'type': 'text'}]},
             'id': 'a64e91a1-facb-46d9-9190-5eb96e13c217',
             'last_edited_time': '2021-06-27T06:08:00.000Z',
             'object': 'block',
             'type': 'heading_2'},
            {'created_time': '2021-06-27T06:08:00.000Z',
             'has_children': False,
             'id': '7428808e-a481-4b0d-9a3d-28ef6a241e4c',
             'last_edited_time': '2021-06-27T06:08:00.000Z',
             'object': 'block',
             'paragraph': {'text': [{'annotations': {'bold': False,
                                                     'code': False,
                                                     'color': 'default',
                                                     'italic': False,
                                                     'strikethrough': False,
                                                     'underline': False},
                                     'href': None,
                                     'plain_text': 'hogehogehugahugapiyopiyo',
                                     'text': {'content': 'hogehogehugahugapiyopiyo',
                                              'link': None},
                                     'type': 'text'}]},
             'type': 'paragraph'},
            {'created_time': '2021-06-27T06:08:00.000Z',
             'has_children': False,
             'id': '9df4b261-8f93-4261-871e-14b9c25d4a2a',
             'last_edited_time': '2021-06-27T06:08:00.000Z',
             'object': 'block',
             'paragraph': {'text': []},
             'type': 'paragraph'},
            {'created_time': '2021-06-27T06:08:00.000Z',
             'has_children': False,
             'id': '395347e7-ccdc-450d-ab99-a730dd68dcd7',
             'last_edited_time': '2021-06-27T06:08:00.000Z',
             'object': 'block',
             'paragraph': {'text': []},
             'type': 'paragraph'}]}
</code></pre><h4 id="h23fd378117">append</h4><p>지정된 page_id(block_id)에 블록을 추가합니다. 블록의 정의 방법은 <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">문서</a>에 설명되어 있습니다.</p><pre><code class="language-python hljs">&gt;&gt;&gt; blocks: list = [
...     {
...         "object": "block",
...         "type": "heading_2",
...         "heading_2": {
...                 "text": [
...                     {"type": "text", "text": {"content": "H2_TITLE"}}
...                 ]
...         }
...     },
...     {
...         "object": "block",
...         "type": "paragraph",
...         "paragraph": {
...                 "text": [
...                     {
...                         "type": "text",
...                         "text": {
...                             "content": "Hi, This is a test text.",
...                             "link": {
...                                 "url": "https://google.com"
...                             }
...                         }
...                     }
...                 ]
...         }
...     }
... ]
&gt;&gt;&gt; block_id: str = "098ebc861d35448a9dd725184512e95d"
&gt;&gt;&gt; ret = notion.blocks.children.append(block_id=block_id, children=blocks)
&gt;&gt;&gt; pprint(ret)
{'child_page': {'title': 'HOGEHOGE'},
 'created_time': '2021-06-27T06:07:00.000Z',
 'has_children': True,
 'id': '098ebc86-1d35-448a-9dd7-25184512e95d',
 'last_edited_time': '2021-06-27T06:12:02.595Z',
 'object': 'block',
 'type': 'child_page'}
</code></pre><h2 id="h789c0a1c8d">Notion SDK for Python 사용해보기</h2><p>문서와 비교하면서 라이브러리를 사용했습니다. Public Beta 시점에서 사용할 수 있는 기능을 억제하고 있으며, 문제없이 사용할 수 있을 것 같습니다. 공식 문서에서 자세한 확인이 필요하지만, 대량의 데이터 import나 입력의 자동화 등 편리하게 사용할 수 있을 것 같습니다.</p><h2 id="ha739b3b8f6">기타</h2><h3 id="hb4ea2eb796">Upload</h3><p>FAQ에 설명되어 있지만 파일 업로드가 지원되지 않는 것 같습니다. 현재 생각나는 방법으로는 Selenium+AHK로 하나씩 올리는 정도일까요. DropboxAPI처럼 Bulk 업로드 지원에 기대합니다.</p><h3 id="hc03fa10a86">다른 언어</h3><p>여러 언어를 지원할 것 같습니다. 그 중에서도 GAS로 Google 앱과 연동하거나, 타임 트리거로 NotionAPI를 호출하는 사용법도 가능할 것 같아서, 조금 관심이 있습니다. 아마 기사는 쓰지 않겠지만, 편리한 사용법 등을 공유할 수 있다면 좋을 것 같습니다.</p>