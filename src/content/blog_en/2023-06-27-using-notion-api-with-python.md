---
title: "Using the Official Notion API with Python (Notion SDK for Python)"
slug: "using-notion-api-with-python"
description: ""
date: 2023-06-27T16:48:20.257Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/notion.webp"
draft: false
tags: ['Python', 'Notion', 'API']
categories: ['Programming']
---

<p>Let's try using the Notion API (Public Beta) with Python.</p>
<h2 id="h9707d3a59a">Overview</h2>
<p>The Notion API was released in May 2021. Before that, unofficial APIs like <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">notin-py</a> were the only options. Although it's still in the Public Beta stage, official documentation in English is very helpful for details. Since Notion does not yet support Japanese, the procedures will be described with Notion set to English.
Currently, Notion does not support Japanese, so the language in Notion is set to English for these steps.</p>
<ul>
<li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Notion API</a></li>
<li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Notion SDK for Python</a></li>
<li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">[FYI] notion-py</a></li>
</ul>
<h2 id="h31d727ccda">Preparation</h2>
<h3 id="h56d25f79e1">Installation</h3>
<p>Install <code>notion-client</code> using pip or similar.</p>
<pre><code class="language-shell hljs">pip install notion-client
</code></pre>
<h3 id="h35695e9877">Integrations</h3>
<p>From <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">https://www.notion.so/my-integrations</a>, create an Integration. Use this Integration with <code>notion-client</code> to access the Notion API.</p>
<h4 id="h046876a126">Steps</h4>
<ul>
<li>Access the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">page</a></li>
<li>Click [New integration]</li>
<li>Fill in the form:
<ul>
<li>Enter an Integration name (e.g., myIntg)</li>
<li>Set an icon (optional)</li>
<li>Select the Workspaces to operate with the API</li>
</ul>
</li>
<li>Click [Submit]<br>After completing the process, a Token will be issued. Click the [Secret] [Internal Integration Token] text box to display the Token, then click again to copy it.<br>Set the copied Token in the environment variable <code>NOTION_TOKEN</code> or paste it into a notepad.</li>
</ul>
<h3 id="h3d0309d9da">Integration Invitations (Important)</h3>
<p>Even after creating the Integration, you cannot fully use the API. Access your Workspaces and follow these steps to prepare:</p>
<ul>
<li>Select the page you want to operate with the API</li>
<li>Click Share from the bar at the top of the screen</li>
<li>Click [Invite]</li>
<li>Click the Integration you created</li>
<li>Click [Invite]</li>
</ul>
<p>After the operation, if the Integration appears in the Share list, you can operate that page via the API.</p>
<h3 id="hf1ecb3158c">Authenticating the API in Python</h3>
<p>Prepare to operate the API in Python. Authenticate with the following code.</p>
<pre><code class="language-python hljs">import os
from notion_client import Client
token: str = os.environ.get("NOTION_TOKEN", "yourToken")
notion = Client(auth=token)
</code></pre>
<p>Follow the official documentation to input the token using environment variables. If you're unfamiliar with environment variables or encounter errors with <code>os.environ</code>, replace <code>"yourToken"</code> with the Token you pasted into a notepad and re-run (be careful not to share the Token on GitHub or elsewhere).<br>If there's no error response, the API authentication is complete.</p>
<h3 id="hb9451998cb">Retrieving User Information (User Endpoint)</h3>
<p>As the final preparation step, use the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Users Endpoint</a> to retrieve user information.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; from pprint import pprint
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
</code></pre>
<h3 id="h30db973bee">ID</h3>
<p>When using the Notion API, specify the target with an ID. You can check the ID to some extent from the URL. For IDs below the Page ID, you may need to use the API or Chrome's Developer Tools to confirm.</p>
<pre><code class="hljs">https://www.notion.so/1349f9e927674a03a87d772483dd5b1b?v=05282e02290749fd95decb0df0dc3f5c&amp;p=de3635356a224c569f103a2038dc3521
                     |--------- Database ID ---------|
                                      |--------- Page ID ------------|
</code></pre>
<h2 id="hb9b8690a99">Using the API</h2>
<h3 id="h6082932692">Search Endpoint</h3>
<p>With the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Search Endpoint</a>, you can search for pages or databases. Entering a search string in the Query argument will return matching pages or databases.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; from pprint import pprint
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
</code></pre>
<h3 id="h15d56a3788">Databases Endpoint</h3>
<p>You can perform operations related to databases with the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Databases Endpoint</a>.</p>
<h4 id="h05a51bf494">list</h4>
<p>Retrieve a list of databases and their definitions. Database definitions are useful when updating values using the API (Query).</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.list()
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
</code></pre>
<h4 id="hccfefa60e5">query</h4>
<p>Using query, you can extract rows from the database. The <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">filter</a> is documented separately, with filtering methods described for each column type. The following is a query to extract records where the Tags column (multi_select type) in the specified database_id contains the value <code>Swift</code>.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.query(
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
</code></pre>
<p>The <code>**</code> before the dictionary in the Query is <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">dictionary unpacking</a>. It is equivalent to the following.</p>
<pre><code class="language-python hljs">ret = notion.databases.query(
    database_id="1349f9e927674a03a87d772483dd5b1b",
    filter={
        "property": "Tags",
        "multi_select": {
                "contains": "Swift"
        }
    }
)
</code></pre>
<h4 id="h1d4310746d">retrieve</h4>
<p>Retrieve information for the database corresponding to database_id. Although you need the ID, it's convenient for getting information about a single database in a simple structure.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.retrieve(database_id="1349f9e927674a03a87d772483dd5b1b")
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
</code></pre>
<h3 id="h95689e9c8a">Pages Endpoint</h3>
<p>You can perform operations on pages.</p>
<h4 id="ha278f9d5a2">create</h4>
<p>Add values to a page. The following code adds values to a table in the page. Refer to the documentation for <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">properties</a> settings.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.create(
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
</code></pre>
<h4 id="h1d4310746d">retrieve</h4>
<p>Retrieve information for the target corresponding to page_id.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.retrieve(page_id="de3635356a224c569f103a2038dc3521")
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
</code></pre>
<h4 id="hf4867d209f">update</h4>
<p>Update the properties values corresponding to page_id.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.update(
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
</code></pre>
<h3 id="h912a4c0433">Blocks Endpoint</h3>
<p>Edit blocks.</p>
<h4 id="h05a51bf494">list</h4>
<p>Retrieve a list of blocks. Use page_id or block_id. Using page_id gets the blocks within the page.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; page_id: str = "098ebc861d35448a9dd725184512e95d"
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
</code></pre>
<h4 id="h23fd378117">append</h4>
<p>Add blocks to the specified page_id (block_id). The method for defining blocks is described in the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">documentation</a>.</p>
<pre><code class="language-python hljs">&gt;&gt;&gt; blocks: list = [
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
</code></pre>
<h2 id="h789c0a1c8d">Trying Out the Notion SDK for Python</h2>
<p>I used the library while comparing it with the documentation. At the Public Beta stage, it covers the usable functions and seems to work fine. While you need to check the details in the official documentation, it looks useful for importing large amounts of data or automating inputs.</p>
<h2 id="ha739b3b8f6">Other</h2>
<h3 id="hb4ea2eb796">Upload</h3>
<p>As mentioned in the FAQ, file uploads are not supported. The method I can think of right now is uploading one by one using Selenium + AHK. I hope for support like Bulk uploads with Dropbox API.</p>
<h3 id="hc03fa10a86">Other Languages</h3>
<p>It seems to be supported in various languages. Among them, I'm a bit interested in uses like integrating with Google apps using GAS or triggering the Notion API with time triggers. I probably won't write an article about it, but if I find convenient uses, I might share them.</p>
