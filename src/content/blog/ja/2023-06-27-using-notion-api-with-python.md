---
title: using-notion-api-with-python
description: 
date: 2023-06-27T16:48:20.257Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/notion.webp
draft: false
tags: ['Python', 'Notion', 'API']
categories: ['Programming']
---

# 公式のNotion APIをPythonで叩く（Notion SDK for Python）

<p>PythonでNotion API(Public Beta)を叩いてみます。</p><h2 id="h9707d3a59a">概要</h2><p>2021年5月にNotionのAPIが公開されました。これ以前は<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">notin-py</a>など非公式のAPIを使う他ありませんでした。Public Betaの段階ですが、公式APIを使ってNotionを操作するための日本語の情報が少ないため、簡単に記述していきます。詳細の確認は英語ですが公式ドキュメントがとても役立ちます。<br>現時点でNotionは日本語対応していないため、Notionの言語は英語の状態で手順を記載します。</p><ul><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Notion API</a></li><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">Notion SDK for Python</a></li><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">[FYI] notion-py</a></li></ul><h2 id="h31d727ccda">準備</h2><h3 id="h56d25f79e1">Installation</h3><p>pipなどで<code>notion-client</code>を導入します。</p><pre><code class="language-shell hljs">pip install notion-<span class="hljs-keyword">client</span>
</code></pre><h3 id="h35695e9877">Integrations</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">https://www.notion.so/my-integrations</a>からIntegrationを作成します。<code>notion-client</code>で作成したIntegrationを使い、Notion APIを叩きます。</p><h4 id="h046876a126">手順</h4><ul><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">ページ</a>にアクセスする</li><li>［New integration］をクリックする</li><li>フォームに値を入力する<ul><li>Integration名を入力する（e.g. myIntg）</li><li>アイコンを設定する（任意）</li><li>APIで操作するWorkspacesを選択する</li></ul></li><li>［Submit］をクリックする<br>一連の操作を終えると、Tokenが発行されます。［Secret］の<code>Internal Integration Token</code>のテキストボックスをクリックすると、Tokenを表示できます。もう一度、クリックしてTokenをCopyしてください。<br>コピーしたTokenは環境変数<code>NOTION_TOKEN</code>にセットするか、メモ帳などに貼り付けるかしてください。</li></ul><h3 id="h3d0309d9da">Integration Invitations（重要）</h3><p>Integrationを作成しましたが、作成したままの状態だとAPIを十分に使用できません。Workspacesにアクセスして、以下の手順で操作の準備をします。</p><ul><li>APIで操作したいページを選択する</li><li>画面上部のバーからShareをクリックする</li><li>［Invite］をクリックする</li><li>作成したIntegrationをクリックする</li><li>［Invite］をクリックする</li></ul><p>操作のあと、Shareの一覧に作成したIntegrationが表示されたら、そのページをAPI経由で操作できるようになります。</p><h3 id="hf1ecb3158c">PythonでAPIの認証をする</h3><p>PythonでAPIを操作する準備をします。以下のコードで認証します。</p><pre><code class="language-python hljs">import os

<span class="hljs-keyword">from</span> notion_client import<span class="hljs-built_in"> Client
</span>
token: str = os.environ.<span class="hljs-built_in">get</span>(<span class="hljs-string">"NOTION_TOKEN"</span>, <span class="hljs-string">"yourToken"</span>)
notion = Client(<span class="hljs-attribute">auth</span>=token)
</code></pre><p>公式ドキュメントに従って、環境変数を使ってtokenの入力をします。環境変数がよくわからなかったり、<code>os.environ</code>の箇所でエラーが出てしまう場合には、<code>"yourToken"</code>をメモ帳などに貼り付けたTokenに書き換えて再実行してください（この時、GitHubなどにTokenをシェアしてしまわないようご注意ください）。<br>ErrorのResponseがなければ、一旦APIの認証が完了となります。</p><h3 id="hb9451998cb">ユーザー情報を取得する(UserEndpoint)</h3><p>準備の最終段階として、<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">UsersEndpoint</a>をつかってユーザー情報の取得をします。</p><pre><code class="language-python hljs">&gt;&gt;&gt; <span class="hljs-keyword">from</span> pprint <span class="hljs-keyword">import</span> pprint
&gt;&gt;&gt;
&gt;&gt;&gt; list_users_response = notion.users.list()
&gt;&gt;&gt; pprint(list_users_response)
{<span class="hljs-string">'has_more'</span>: <span class="hljs-keyword">False</span>,
 <span class="hljs-string">'next_cursor'</span>: <span class="hljs-keyword">None</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'list'</span>,
 <span class="hljs-string">'results'</span>: [{<span class="hljs-string">'avatar_url'</span>: <span class="hljs-string">'https://lh3.googleusercontent.com/a-/HOGEHOGE'</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'323343xx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'</span>,
              <span class="hljs-string">'name'</span>: <span class="hljs-string">'yourName'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'user'</span>,
              <span class="hljs-string">'person'</span>: {<span class="hljs-string">'email'</span>: <span class="hljs-string">'yourAddress@gmail.com'</span>},
              <span class="hljs-string">'type'</span>: <span class="hljs-string">'person'</span>},
             {<span class="hljs-string">'avatar_url'</span>: <span class="hljs-keyword">None</span>,
              <span class="hljs-string">'bot'</span>: {},
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'323343xx-yyyy-yyyy-yyyy-xxxxxxxxxxxx,
              '</span><span class="hljs-type">name</span><span class="hljs-string">': '</span>myIntg<span class="hljs-string">',
              '</span><span class="hljs-keyword">object</span><span class="hljs-string">': '</span><span class="hljs-keyword">user</span><span class="hljs-string">',
              '</span>typ<span class="hljs-string">e': '</span>bot<span class="hljs-string">'},
             ]}
</span></code></pre><h3 id="h30db973bee">ID</h3><p>NotionのAPIを使うときに、IDで操作の対象を指定します。URLからある程度IDを確認できます。Page IDより下位にあるIDはAPIを叩いたり、ChromeのDeveloperツールなどから確認したりなどが必要となります。</p><pre><code class="hljs">https:<span class="hljs-string">//www.notion.so/1349f9e927674a03a87d772483dd5b1b</span>?v=05282e02290749fd95decb0df0dc3f5c&amp;p=de3635356a224c569f103a2038dc3521
                     |<span class="hljs-params">---------</span> Database ID <span class="hljs-params">---------</span>|                                      |<span class="hljs-params">---------</span> Page ID <span class="hljs-params">------------</span>|
</code></pre><h2 id="hb9b8690a99">APIをつかう</h2><h3 id="h6082932692">SearchEndpoint</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">SearchEndpoint</a>では、ページやデータベースの検索ができます。Query引数に検索した文字を入力すると、一致したページやデータベースを返してくれます。</p><pre><code class="language-python hljs"><span class="hljs-meta">&gt;&gt;&gt; </span><span class="hljs-keyword">from</span> pprint <span class="hljs-keyword">import</span> pprint
&gt;&gt;&gt;
<span class="hljs-meta">&gt;&gt;&gt; </span>ret = notion.search(query=<span class="hljs-string">"My"</span>, )
<span class="hljs-meta">&gt;&gt;&gt; </span>pprint(ret)
{<span class="hljs-string">'has_more'</span>: <span class="hljs-literal">False</span>,
 <span class="hljs-string">'next_cursor'</span>: <span class="hljs-literal">None</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'list'</span>,
 <span class="hljs-string">'results'</span>: [{<span class="hljs-string">'archived'</span>: <span class="hljs-literal">False</span>,
              <span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-26T05:29:00.000Z'</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'65431967-c345-4c73-94eb-089c7781874f'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T02:37:36.229Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'page'</span>,
              <span class="hljs-string">'parent'</span>: {<span class="hljs-string">'type'</span>: <span class="hljs-string">'workspace'</span>, <span class="hljs-string">'workspace'</span>: <span class="hljs-literal">True</span>},
              <span class="hljs-string">'properties'</span>: {<span class="hljs-string">'title'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'title'</span>,
                                       <span class="hljs-string">'title'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                                                  <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                                                  <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                                                  <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                                                  <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                                                  <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                                                  <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                                                  <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'MyTask'</span>,
                                                  <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'MyTask'</span>,
                                                           <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                                                  <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}],
                                       <span class="hljs-string">'type'</span>: <span class="hljs-string">'title'</span>}}}]}
</code></pre><h3 id="h15d56a3788">DatabasesEndpoint</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">DatabasesEndpoint</a>でデータベース周りの操作ができます。</p><h4 id="h05a51bf494">list</h4><p>データベースの一覧とデータベースの定義を取得できます。データベースの定義は、API（Query）を使って値を更新する際に役立ちます。</p><pre><code class="language-python hljs"><span class="hljs-meta">&gt;&gt;&gt; </span>ret = notion.databases.<span class="hljs-built_in">list</span>()
<span class="hljs-meta">&gt;&gt;&gt; </span>pprint(ret)
{<span class="hljs-string">'has_more'</span>: <span class="hljs-literal">False</span>,
 <span class="hljs-string">'next_cursor'</span>: <span class="hljs-literal">None</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'list'</span>,
 <span class="hljs-string">'results'</span>: [{<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-26T04:01:53.032Z'</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'1349f9e9-xxxx-xxxx-xxxx-xxxxxxxxxxxx'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T02:37:36.229Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'database'</span>,
              <span class="hljs-string">'parent'</span>: {<span class="hljs-string">'type'</span>: <span class="hljs-string">'workspace'</span>, <span class="hljs-string">'workspace'</span>: <span class="hljs-literal">True</span>},
              <span class="hljs-string">'properties'</span>: {<span class="hljs-string">'Created'</span>: {<span class="hljs-string">'created_time'</span>: {},
                                         <span class="hljs-string">'id'</span>: <span class="hljs-string">'s]Ff'</span>,
                                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'created_time'</span>},
                             <span class="hljs-string">'Favorite'</span>: {<span class="hljs-string">'checkbox'</span>: {},
                                          <span class="hljs-string">'id'</span>: <span class="hljs-string">'VQ{u'</span>,
                                          <span class="hljs-string">'type'</span>: <span class="hljs-string">'checkbox'</span>},
                             <span class="hljs-string">'Name'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'title'</span>,
                                      <span class="hljs-string">'title'</span>: {},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'title'</span>},
                             <span class="hljs-string">'Notion'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'ta`F'</span>,
                                        <span class="hljs-string">'rich_text'</span>: {},
                                        <span class="hljs-string">'type'</span>: <span class="hljs-string">'rich_text'</span>},
                             <span class="hljs-string">'Tags'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'{OB\\'</span>,
                                      <span class="hljs-string">'multi_select'</span>: {<span class="hljs-string">'options'</span>: [{<span class="hljs-string">'color'</span>: <span class="hljs-string">'pink'</span>,
                                                                    <span class="hljs-string">'id'</span>: <span class="hljs-string">'fd33a0a5-yyyy-yyyy-yyyy-yyyyyyyyyyyy'</span>,
                                                                    <span class="hljs-string">'name'</span>: <span class="hljs-string">'Notion'</span>},
                                                                   {<span class="hljs-string">'color'</span>: <span class="hljs-string">'red'</span>,
                                                                    <span class="hljs-string">'id'</span>: <span class="hljs-string">'035c85d1-zzzz-zzzz-zzzz-zzzzzzzzzzzz'</span>,
                                                                    <span class="hljs-string">'name'</span>: <span class="hljs-string">'Python'</span>},
                                                                   {<span class="hljs-string">'color'</span>: <span class="hljs-string">'green'</span>,
                                                                    <span class="hljs-string">'id'</span>: <span class="hljs-string">'b8f93b98-aaaa-aaaa-aaaa-aaaaaaaaaaaa'</span>,
                                                                    <span class="hljs-string">'name'</span>: <span class="hljs-string">'DLL'</span>},
                                                                   {<span class="hljs-string">'color'</span>: <span class="hljs-string">'green'</span>,
                                                                    <span class="hljs-string">'id'</span>: <span class="hljs-string">'38341073-bbbb-bbbb-bbbb-bbbbbbbbbbbb'</span>,
                                                                    <span class="hljs-string">'name'</span>: <span class="hljs-string">'GoLang'</span>},
                                                                   {<span class="hljs-string">'color'</span>: <span class="hljs-string">'brown'</span>,
                                                                    <span class="hljs-string">'id'</span>: <span class="hljs-string">'b77ec500-cccc-cccc-cccc-cccccccccc'</span>,
                                                                    <span class="hljs-string">'name'</span>: <span class="hljs-string">'API'</span>},
                                                                   {<span class="hljs-string">'color'</span>: <span class="hljs-string">'blue'</span>,
                                                                    <span class="hljs-string">'id'</span>: <span class="hljs-string">'f0613703-dddd-dddd-dddd-dddddddddddd'</span>,
                                                                    <span class="hljs-string">'name'</span>: <span class="hljs-string">'Swift'</span>}]},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'multi_select'</span>},
                             <span class="hljs-string">'URL'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'b;Si'</span>, <span class="hljs-string">'type'</span>: <span class="hljs-string">'url'</span>, <span class="hljs-string">'url'</span>: {}}},
              <span class="hljs-string">'title'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                         <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                         <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                         <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'WebClips'</span>,
                         <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'WebClips'</span>, <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}]},
             {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-26T13:02:55.254Z'</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'9da953b5-dddd-dddd-dddd-dddddddddddd'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T03:36:00.000Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'database'</span>,
              <span class="hljs-string">'parent'</span>: {<span class="hljs-string">'type'</span>: <span class="hljs-string">'workspace'</span>, <span class="hljs-string">'workspace'</span>: <span class="hljs-literal">True</span>},
              <span class="hljs-string">'properties'</span>: {<span class="hljs-string">'Created'</span>: {<span class="hljs-string">'created_time'</span>: {},
                                         <span class="hljs-string">'id'</span>: <span class="hljs-string">']r?p'</span>,
                                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'created_time'</span>},
                             <span class="hljs-string">'Ebook'</span>: {<span class="hljs-string">'checkbox'</span>: {},
                                       <span class="hljs-string">'id'</span>: <span class="hljs-string">'An=Z'</span>,
                                       <span class="hljs-string">'type'</span>: <span class="hljs-string">'checkbox'</span>},
                             <span class="hljs-string">'Favorite'</span>: {<span class="hljs-string">'checkbox'</span>: {},
                                          <span class="hljs-string">'id'</span>: <span class="hljs-string">'iHkR'</span>,
                                          <span class="hljs-string">'type'</span>: <span class="hljs-string">'checkbox'</span>},
                             <span class="hljs-string">'Name'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'title'</span>,
                                      <span class="hljs-string">'title'</span>: {},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'title'</span>},
                             <span class="hljs-string">'Rate'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'\\Lit'</span>,
                                      <span class="hljs-string">'select'</span>: {<span class="hljs-string">'options'</span>: [{<span class="hljs-string">'color'</span>: <span class="hljs-string">'red'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'64d85ca2-eeee-eeee-eeee-eeeeeeeeeeee'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'5'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'pink'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'2ec6eb09-ffff-ffff-ffff-ffffffffffff'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'4'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'gray'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'e86ef2d6-gggg-gggg-gggg-gggggggggggg'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'3'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'purple'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'10c2e5f8-hhhh-hhhh-hhhh-hhhhhhhhhhhh'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'2'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'green'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'75aeb67c-iiii-iiii-iiii-iiiiiiiiiiii'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'1'</span>}]},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'select'</span>},
                             <span class="hljs-string">'Tags'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'bdzl'</span>,
                                      <span class="hljs-string">'select'</span>: {<span class="hljs-string">'options'</span>: [{<span class="hljs-string">'color'</span>: <span class="hljs-string">'blue'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'3d2d9f81-jjjj-jjjj-jjjj-jjjjjjjjjjjj'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'Bought'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'orange'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'98f3d800-gggg-gggg-gggg-gggggggggg'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'Read'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'red'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'cdbbc5aa-kkkk-kkkk-kkkk-kkkkkkkkkkkk'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'Reviewd'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'pink'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'b534b43e-llll-llll-llllllllllll'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'Reading'</span>},
                                                             {<span class="hljs-string">'color'</span>: <span class="hljs-string">'yellow'</span>,
                                                              <span class="hljs-string">'id'</span>: <span class="hljs-string">'12863085-mmmm-mmmm-mmmm-mmmmmmmmmmmm'</span>,
                                                              <span class="hljs-string">'name'</span>: <span class="hljs-string">'Pending'</span>}]},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'select'</span>},
                             <span class="hljs-string">'URL'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'DFAE'</span>, <span class="hljs-string">'type'</span>: <span class="hljs-string">'url'</span>, <span class="hljs-string">'url'</span>: {}}},
              <span class="hljs-string">'title'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                         <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                         <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                         <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                         <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'Bookshelf'</span>,
                         <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'Bookshelf'</span>, <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}]}]}
</code></pre><h4 id="hccfefa60e5">query</h4><p>queryを使うとデータベースの行を抽出できます。<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">filter</a>は別途ドキュメントがあり、列のTypeごとにFilter方法などが記載されています。以下は、指定のdatabase_idのTags列(multi_select型)に値<code>Swift</code>が含まれているレコードを抽出するクエリです。</p><pre><code class="language-python hljs"><span class="hljs-meta">&gt;&gt;&gt; </span>ret = notion.databases.query(
<span class="hljs-meta">... </span>    **{
<span class="hljs-meta">... </span>        <span class="hljs-string">"database_id"</span>: <span class="hljs-string">"1349f9e927674a03a87d772483dd5b1b"</span>,
<span class="hljs-meta">... </span>        <span class="hljs-string">"filter"</span>: {
<span class="hljs-meta">... </span>            <span class="hljs-string">"property"</span>: <span class="hljs-string">"Tags"</span>,
<span class="hljs-meta">... </span>            <span class="hljs-string">"multi_select"</span>: {
<span class="hljs-meta">... </span>                <span class="hljs-string">"contains"</span>: <span class="hljs-string">"Swift"</span>
<span class="hljs-meta">... </span>            }
<span class="hljs-meta">... </span>        }
<span class="hljs-meta">... </span>    }
<span class="hljs-meta">... </span>)
<span class="hljs-meta">&gt;&gt;&gt; </span>pprint(ret)
{<span class="hljs-string">'has_more'</span>: <span class="hljs-literal">False</span>,
 <span class="hljs-string">'next_cursor'</span>: <span class="hljs-literal">None</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'list'</span>,
 <span class="hljs-string">'results'</span>: [{<span class="hljs-string">'archived'</span>: <span class="hljs-literal">False</span>,
              <span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-26T05:33:23.002Z'</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'d74a8d3e-73c0-4d04-817a-897192fbfb2e'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-26T05:33:00.000Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'page'</span>,
              <span class="hljs-string">'parent'</span>: {<span class="hljs-string">'database_id'</span>: <span class="hljs-string">'1349f9e9-2767-4a03-a87d-772483dd5b1b'</span>,
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'database_id'</span>},
              <span class="hljs-string">'properties'</span>: {<span class="hljs-string">'Created'</span>: {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-26T05:33:23.002Z'</span>,
                                         <span class="hljs-string">'id'</span>: <span class="hljs-string">'s]Ff'</span>,
                                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'created_time'</span>},
                             <span class="hljs-string">'Favorite'</span>: {<span class="hljs-string">'checkbox'</span>: <span class="hljs-literal">False</span>,
                                          <span class="hljs-string">'id'</span>: <span class="hljs-string">'VQ{u'</span>,
                                          <span class="hljs-string">'type'</span>: <span class="hljs-string">'checkbox'</span>},
                             <span class="hljs-string">'Name'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'title'</span>,
                                      <span class="hljs-string">'title'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                                                 <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                                                 <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                                                 <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                                                 <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                                                 <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                                                 <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                                                 <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'noppefoxwolf/notion: '</span>
                                                               <span class="hljs-string">'noppefoxwolf/notion '</span>
                                                               <span class="hljs-string">'is a notion.so '</span>
                                                               <span class="hljs-string">'API library '</span>
                                                               <span class="hljs-string">'written in '</span>
                                                               <span class="hljs-string">'swift.'</span>,
                                                 <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'noppefoxwolf/notion: '</span>
                                                                     <span class="hljs-string">'noppefoxwolf/notion '</span>
                                                                     <span class="hljs-string">'is a '</span>
                                                                     <span class="hljs-string">'notion.so '</span>
                                                                     <span class="hljs-string">'API '</span>
                                                                     <span class="hljs-string">'library '</span>
                                                                     <span class="hljs-string">'written '</span>
                                                                     <span class="hljs-string">'in '</span>
                                                                     <span class="hljs-string">'swift.'</span>,
                                                          <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                                                 <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}],
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'title'</span>},
                             <span class="hljs-string">'Notion'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'ta`F'</span>,
                                        <span class="hljs-string">'rich_text'</span>: [],
                                        <span class="hljs-string">'type'</span>: <span class="hljs-string">'rich_text'</span>},
                             <span class="hljs-string">'Tags'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'{OB\\'</span>,
                                      <span class="hljs-string">'multi_select'</span>: [{<span class="hljs-string">'color'</span>: <span class="hljs-string">'pink'</span>,
                                                        <span class="hljs-string">'id'</span>: <span class="hljs-string">'fd33a0a5-5c7a-469d-aafc-168106a15208'</span>,
                                                        <span class="hljs-string">'name'</span>: <span class="hljs-string">'Notion'</span>},
                                                       {<span class="hljs-string">'color'</span>: <span class="hljs-string">'brown'</span>,
                                                        <span class="hljs-string">'id'</span>: <span class="hljs-string">'b77ec500-aed1-45b0-be10-06a38973273f'</span>,
                                                        <span class="hljs-string">'name'</span>: <span class="hljs-string">'API'</span>},
                                                       {<span class="hljs-string">'color'</span>: <span class="hljs-string">'blue'</span>,
                                                        <span class="hljs-string">'id'</span>: <span class="hljs-string">'f0613703-e876-4dbd-8ff3-2f08f158d07e'</span>,
                                                        <span class="hljs-string">'name'</span>: <span class="hljs-string">'Swift'</span>}],
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'multi_select'</span>},
                             <span class="hljs-string">'URL'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'b;Si'</span>,
                                     <span class="hljs-string">'type'</span>: <span class="hljs-string">'url'</span>,
                                     <span class="hljs-string">'url'</span>: <span class="hljs-string">'https://github.com/noppefoxwolf/notion'</span>}}}]}
</code></pre><p>Query内の辞書の前についている<code>**</code>は<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">辞書のアンパック</a>です。以下と同じになります。</p><pre><code class="language-python hljs">ret = notion<span class="hljs-selector-class">.databases</span><span class="hljs-selector-class">.query</span>(
    database_id=<span class="hljs-string">"1349f9e927674a03a87d772483dd5b1b"</span>,
    <span class="hljs-attribute">filter</span>={
        <span class="hljs-string">"property"</span>: <span class="hljs-string">"Tags"</span>,
        <span class="hljs-string">"multi_select"</span>: {
                <span class="hljs-string">"contains"</span>: <span class="hljs-string">"Swift"</span>
        }
    }
)
</code></pre><h4 id="h1d4310746d">retrieve</h4><p>database_idに対応するデータベースの情報を取得します。IDが必要となりますが、単一のデータベースの情報を取得でき、シンプルな構造となる点で便利です。</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.databases.retrieve(database_id=<span class="hljs-string">"1349f9e927674a03a87d772483dd5b1b"</span>)
&gt;&gt;&gt; pprint(ret)
{'created_time': '<span class="hljs-number">2021-06-26</span>T04:01:53.032Z',
 'id': '<span class="hljs-number">1349</span>f9e9-<span class="hljs-number">2767</span>-4a03-a87d-<span class="hljs-number">772483</span>dd5b1b',
 'last_edited_time': '<span class="hljs-number">2021-06-27</span>T02:37:36.229Z',
 'object': 'database',
 'parent': {'type': 'workspace', 'workspace': True},
 'properties': {'Created': {'created_time': {},
                            'id': 's]Ff',
                            'type': 'created_time'},
                'Favorite': {'checkbox': {}, 'id': 'VQ{u', 'type': 'checkbox'},
                'Name': {'id': 'title', 'title': {}, 'type': 'title'},
                'Notion': {'id': 'ta`F', 'rich_text': {}, 'type': 'rich_text'},
                'Tags': {'id': '{OB\\',
                         'multi_select': {'options': [{'color': 'pink',
                                                       'id': 'fd33a0a5-5c7a-469d-aafc-<span class="hljs-number">168106</span>a<span class="hljs-number">1520</span>8',
                                                       'name': 'Notion'},
                                                      {'color': 'red',
                                                       'id': '035c85d1-e9a0-4b40-9f7b-0f<span class="hljs-number">7851</span>6b084f',
                                                       'name': 'Python'},
                                                      {'color': 'green',
                                                       'id': 'b8f93b98-2f81-4e4f-913a-9e355aef267c',
                                                       'name': 'DLL'},
                                                      {'color': 'green',
                                                       'id': '<span class="hljs-number">38341073</span>-3d35-46f3-84bc-baeab8d<span class="hljs-number">3093</span>f',
                                                       'name': 'GoLang'},
                                                      {'color': 'brown',
                                                       'id': 'b77ec500-aed1-45b0-be10-06a<span class="hljs-number">38973273</span>f',
                                                       'name': 'API'},
                                                      {'color': 'blue',
                                                       'id': 'f<span class="hljs-number">061370</span>3-e876-4dbd-8ff3-2f08f158d07e',
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
</code></pre><h3 id="h95689e9c8a">PagesEndpoint</h3><p>ページの操作ができます。</p><h4 id="ha278f9d5a2">create</h4><p>pageに値を追加できます。以下はページ内のテーブルに値を追加するコードです。<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">properties</a>の設定方法はドキュメントをご確認ください。</p><pre><code class="language-python hljs"><span class="hljs-meta">&gt;&gt;&gt; </span>ret = notion.pages.create(
<span class="hljs-meta">... </span>**{
<span class="hljs-meta">... </span>        <span class="hljs-string">"parent"</span>: {<span class="hljs-string">"database_id"</span>: <span class="hljs-string">"1349f9e927674a03a87d772483dd5b1b"</span>},
<span class="hljs-meta">... </span>        <span class="hljs-string">"properties"</span>: {
<span class="hljs-meta">... </span>            <span class="hljs-string">"Name"</span>: {
<span class="hljs-meta">... </span>                <span class="hljs-string">"title"</span>: [
<span class="hljs-meta">... </span>                    {
<span class="hljs-meta">... </span>                        <span class="hljs-string">"text"</span>: {
<span class="hljs-meta">... </span>                            <span class="hljs-string">"content"</span>: <span class="hljs-string">"TEST"</span>
<span class="hljs-meta">... </span>                        }
<span class="hljs-meta">... </span>                    }
<span class="hljs-meta">... </span>                ]
<span class="hljs-meta">... </span>            },
<span class="hljs-meta">... </span>            <span class="hljs-string">"URL"</span>: {
<span class="hljs-meta">... </span>                <span class="hljs-string">"url"</span>: <span class="hljs-string">"https://google.com"</span>
<span class="hljs-meta">... </span>            },
<span class="hljs-meta">... </span>            <span class="hljs-string">"Favorite"</span>: {
<span class="hljs-meta">... </span>                <span class="hljs-string">"checkbox"</span>: <span class="hljs-literal">True</span>
<span class="hljs-meta">... </span>            },
<span class="hljs-meta">... </span>            <span class="hljs-string">"Tags"</span>: {
<span class="hljs-meta">... </span>                <span class="hljs-string">"multi_select"</span>: [
<span class="hljs-meta">... </span>                    {<span class="hljs-string">"name"</span>: tag} <span class="hljs-keyword">for</span> tag <span class="hljs-keyword">in</span> <span class="hljs-string">"Python,API"</span>.split(<span class="hljs-string">","</span>)
<span class="hljs-meta">... </span>                ]
<span class="hljs-meta">... </span>            }
<span class="hljs-meta">... </span>        }
<span class="hljs-meta">... </span>    }
<span class="hljs-meta">... </span>)
<span class="hljs-meta">&gt;&gt;&gt; </span>pprint(ret)
{<span class="hljs-string">'archived'</span>: <span class="hljs-literal">False</span>,
 <span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T05:18:59.743Z'</span>,
 <span class="hljs-string">'id'</span>: <span class="hljs-string">'de363535-6a22-4c56-9f10-3a2038dc3521'</span>,
 <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T05:18:59.743Z'</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'page'</span>,
 <span class="hljs-string">'parent'</span>: {<span class="hljs-string">'database_id'</span>: <span class="hljs-string">'1349f9e9-2767-4a03-a87d-772483dd5b1b'</span>,
            <span class="hljs-string">'type'</span>: <span class="hljs-string">'database_id'</span>},
 <span class="hljs-string">'properties'</span>: {<span class="hljs-string">'Created'</span>: {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T05:18:59.743Z'</span>,
                            <span class="hljs-string">'id'</span>: <span class="hljs-string">'s]Ff'</span>,
                            <span class="hljs-string">'type'</span>: <span class="hljs-string">'created_time'</span>},
                <span class="hljs-string">'Favorite'</span>: {<span class="hljs-string">'checkbox'</span>: <span class="hljs-literal">True</span>,
                             <span class="hljs-string">'id'</span>: <span class="hljs-string">'VQ{u'</span>,
                             <span class="hljs-string">'type'</span>: <span class="hljs-string">'checkbox'</span>},
                <span class="hljs-string">'Name'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'title'</span>,
                         <span class="hljs-string">'title'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                                    <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                                    <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                                    <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'TEST'</span>,
                                    <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'TEST'</span>, <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                                    <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}],
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'title'</span>},
                <span class="hljs-string">'Tags'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'{OB\\'</span>,
                         <span class="hljs-string">'multi_select'</span>: [{<span class="hljs-string">'color'</span>: <span class="hljs-string">'red'</span>,
                                           <span class="hljs-string">'id'</span>: <span class="hljs-string">'035c85d1-e9a0-4b40-9f7b-0f78516b084f'</span>,
                                           <span class="hljs-string">'name'</span>: <span class="hljs-string">'Python'</span>},
                                          {<span class="hljs-string">'color'</span>: <span class="hljs-string">'brown'</span>,
                                           <span class="hljs-string">'id'</span>: <span class="hljs-string">'b77ec500-aed1-45b0-be10-06a38973273f'</span>,
                                           <span class="hljs-string">'name'</span>: <span class="hljs-string">'API'</span>}],
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'multi_select'</span>},
                <span class="hljs-string">'URL'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'b;Si'</span>,
                        <span class="hljs-string">'type'</span>: <span class="hljs-string">'url'</span>,
                        <span class="hljs-string">'url'</span>: <span class="hljs-string">'https://google.com'</span>}}}
</code></pre><h4 id="h1d4310746d">retrieve</h4><p>page_idに対応する対象の情報を取得します。</p><pre><code class="language-python hljs">&gt;&gt;&gt; ret = notion.pages.retrieve(page_id=<span class="hljs-string">"de3635356a224c569f103a2038dc3521"</span>)
&gt;&gt;&gt; pprint(ret)
{'archived': False,
 'created_time': '<span class="hljs-number">2021-06-27</span>T05:18:59.743Z',
 'id': 'de<span class="hljs-number">363535</span>-6a22-4c56-9f10-3a<span class="hljs-number">2038</span>dc<span class="hljs-number">3521</span>',
 'last_edited_time': '<span class="hljs-number">2021-06-27</span>T05:20:00.000Z',
 'object': 'page',
 'parent': {'database_id': '<span class="hljs-number">1349</span>f9e9-<span class="hljs-number">2767</span>-4a03-a87d-<span class="hljs-number">772483</span>dd5b1b',
            'type': 'database_id'},
 'properties': {'Created': {'created_time': '<span class="hljs-number">2021-06-27</span>T05:18:59.743Z',
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
                'Tags': {'id': '{OB\\',
                         'multi_select': [{'color': 'red',
                                           'id': '035c85d1-e9a0-4b40-9f7b-0f<span class="hljs-number">7851</span>6b084f',
                                           'name': 'Python'},
                                          {'color': 'brown',
                                           'id': 'b77ec500-aed1-45b0-be10-06a<span class="hljs-number">38973273</span>f',
                                           'name': 'API'}],
                         'type': 'multi_select'},
                'URL': {'id': 'b;Si',
                        'type': 'url',
                        'url': 'https://google.com'}}}
</code></pre><h4 id="hf4867d209f">update</h4><p>page_idに対応するpropatiesの値を更新します。</p><pre><code class="language-python hljs"><span class="hljs-meta">&gt;&gt;&gt; </span>ret = notion.pages.update(
<span class="hljs-meta">... </span>    **{
<span class="hljs-meta">... </span>        <span class="hljs-string">"page_id"</span>: <span class="hljs-string">"de3635356a224c569f103a2038dc3521"</span>,
<span class="hljs-meta">... </span>        <span class="hljs-string">"properties"</span>: {
<span class="hljs-meta">... </span>            <span class="hljs-string">"Name"</span>: {
<span class="hljs-meta">... </span>                <span class="hljs-string">"title"</span>: [
<span class="hljs-meta">... </span>                    {
<span class="hljs-meta">... </span>                        <span class="hljs-string">"text"</span>: {
<span class="hljs-meta">... </span>                            <span class="hljs-string">"content"</span>: <span class="hljs-string">"UPDATE_TEST"</span>
<span class="hljs-meta">... </span>                        }
<span class="hljs-meta">... </span>                    }
<span class="hljs-meta">... </span>                ]
<span class="hljs-meta">... </span>            }
<span class="hljs-meta">... </span>        }
<span class="hljs-meta">... </span>    }
<span class="hljs-meta">... </span>)
<span class="hljs-meta">&gt;&gt;&gt; </span>pprint(ret)
{<span class="hljs-string">'archived'</span>: <span class="hljs-literal">False</span>,
 <span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T05:18:59.743Z'</span>,
 <span class="hljs-string">'id'</span>: <span class="hljs-string">'de363535-6a22-4c56-9f10-3a2038dc3521'</span>,
 <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T05:36:47.559Z'</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'page'</span>,
 <span class="hljs-string">'parent'</span>: {<span class="hljs-string">'database_id'</span>: <span class="hljs-string">'1349f9e9-2767-4a03-a87d-772483dd5b1b'</span>,
            <span class="hljs-string">'type'</span>: <span class="hljs-string">'database_id'</span>},
 <span class="hljs-string">'properties'</span>: {<span class="hljs-string">'Created'</span>: {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T05:18:59.743Z'</span>,
                            <span class="hljs-string">'id'</span>: <span class="hljs-string">'s]Ff'</span>,
                            <span class="hljs-string">'type'</span>: <span class="hljs-string">'created_time'</span>},
                <span class="hljs-string">'Favorite'</span>: {<span class="hljs-string">'checkbox'</span>: <span class="hljs-literal">True</span>,
                             <span class="hljs-string">'id'</span>: <span class="hljs-string">'VQ{u'</span>,
                             <span class="hljs-string">'type'</span>: <span class="hljs-string">'checkbox'</span>},
                <span class="hljs-string">'Name'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'title'</span>,
                         <span class="hljs-string">'title'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                                    <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                                    <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                                    <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                                    <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'UPDATE_TEST'</span>,
                                    <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'UPDATE_TEST'</span>,
                                             <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                                    <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}],
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'title'</span>},
                <span class="hljs-string">'Tags'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'{OB\\'</span>,
                         <span class="hljs-string">'multi_select'</span>: [{<span class="hljs-string">'color'</span>: <span class="hljs-string">'red'</span>,
                                           <span class="hljs-string">'id'</span>: <span class="hljs-string">'035c85d1-e9a0-4b40-9f7b-0f78516b084f'</span>,
                                           <span class="hljs-string">'name'</span>: <span class="hljs-string">'Python'</span>},
                                          {<span class="hljs-string">'color'</span>: <span class="hljs-string">'brown'</span>,
                                           <span class="hljs-string">'id'</span>: <span class="hljs-string">'b77ec500-aed1-45b0-be10-06a38973273f'</span>,
                                           <span class="hljs-string">'name'</span>: <span class="hljs-string">'API'</span>}],
                         <span class="hljs-string">'type'</span>: <span class="hljs-string">'multi_select'</span>},
                <span class="hljs-string">'URL'</span>: {<span class="hljs-string">'id'</span>: <span class="hljs-string">'b;Si'</span>,
                        <span class="hljs-string">'type'</span>: <span class="hljs-string">'url'</span>,
                        <span class="hljs-string">'url'</span>: <span class="hljs-string">'https://google.com'</span>}}}
</code></pre><h3 id="h912a4c0433">BlocksEndpoint</h3><p>ブロックの編集をします。</p><h4 id="h05a51bf494">list</h4><p>ブロックのリストを入手します。page_idもしくはblock_idを使います。page_idを使うとページ内のブロックを取得できます。</p><pre><code class="language-python hljs"><span class="hljs-meta">&gt;&gt;&gt; </span>page_id: <span class="hljs-built_in">str</span> = <span class="hljs-string">"098ebc861d35448a9dd725184512e95d"</span>
<span class="hljs-meta">&gt;&gt;&gt; </span>ret = notion.blocks.children.<span class="hljs-built_in">list</span>(block_id=page_id)
<span class="hljs-meta">&gt;&gt;&gt; </span>pprint(ret)
{<span class="hljs-string">'has_more'</span>: <span class="hljs-literal">False</span>,
 <span class="hljs-string">'next_cursor'</span>: <span class="hljs-literal">None</span>,
 <span class="hljs-string">'object'</span>: <span class="hljs-string">'list'</span>,
 <span class="hljs-string">'results'</span>: [{<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T06:07:00.000Z'</span>,
              <span class="hljs-string">'has_children'</span>: <span class="hljs-literal">False</span>,
              <span class="hljs-string">'heading_2'</span>: {<span class="hljs-string">'text'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                                      <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                                      <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                                      <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'Summary'</span>,
                                      <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'Summary'</span>,
                                               <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}]},
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'a64e91a1-facb-46d9-9190-5eb96e13c217'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'block'</span>,
              <span class="hljs-string">'type'</span>: <span class="hljs-string">'heading_2'</span>},
             {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'has_children'</span>: <span class="hljs-literal">False</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'7428808e-a481-4b0d-9a3d-28ef6a241e4c'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'block'</span>,
              <span class="hljs-string">'paragraph'</span>: {<span class="hljs-string">'text'</span>: [{<span class="hljs-string">'annotations'</span>: {<span class="hljs-string">'bold'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'code'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'color'</span>: <span class="hljs-string">'default'</span>,
                                                      <span class="hljs-string">'italic'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'strikethrough'</span>: <span class="hljs-literal">False</span>,
                                                      <span class="hljs-string">'underline'</span>: <span class="hljs-literal">False</span>},
                                      <span class="hljs-string">'href'</span>: <span class="hljs-literal">None</span>,
                                      <span class="hljs-string">'plain_text'</span>: <span class="hljs-string">'hogehogehugahugapiyopiyo'</span>,
                                      <span class="hljs-string">'text'</span>: {<span class="hljs-string">'content'</span>: <span class="hljs-string">'hogehogehugahugapiyopiyo'</span>,
                                               <span class="hljs-string">'link'</span>: <span class="hljs-literal">None</span>},
                                      <span class="hljs-string">'type'</span>: <span class="hljs-string">'text'</span>}]},
              <span class="hljs-string">'type'</span>: <span class="hljs-string">'paragraph'</span>},
             {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'has_children'</span>: <span class="hljs-literal">False</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'9df4b261-8f93-4261-871e-14b9c25d4a2a'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'block'</span>,
              <span class="hljs-string">'paragraph'</span>: {<span class="hljs-string">'text'</span>: []},
              <span class="hljs-string">'type'</span>: <span class="hljs-string">'paragraph'</span>},
             {<span class="hljs-string">'created_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'has_children'</span>: <span class="hljs-literal">False</span>,
              <span class="hljs-string">'id'</span>: <span class="hljs-string">'395347e7-ccdc-450d-ab99-a730dd68dcd7'</span>,
              <span class="hljs-string">'last_edited_time'</span>: <span class="hljs-string">'2021-06-27T06:08:00.000Z'</span>,
              <span class="hljs-string">'object'</span>: <span class="hljs-string">'block'</span>,
              <span class="hljs-string">'paragraph'</span>: {<span class="hljs-string">'text'</span>: []},
              <span class="hljs-string">'type'</span>: <span class="hljs-string">'paragraph'</span>}]}
</code></pre><h4 id="h23fd378117">append</h4><p>指定したpage_id(block_id)にブロックを追加します。ブロックの定義方法は<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/4117163140880046642#">ドキュメント</a>に記載されています。</p><pre><code class="language-python hljs"><span class="hljs-meta prompt_">&gt;&gt;&gt;</span> <span class="language-python">blocks: <span class="hljs-built_in">list</span> = [</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">    {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        <span class="hljs-string">"object"</span>: <span class="hljs-string">"block"</span>,</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        <span class="hljs-string">"type"</span>: <span class="hljs-string">"heading_2"</span>,</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        <span class="hljs-string">"heading_2"</span>: {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                <span class="hljs-string">"text"</span>: [</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                    {<span class="hljs-string">"type"</span>: <span class="hljs-string">"text"</span>, <span class="hljs-string">"text"</span>: {<span class="hljs-string">"content"</span>: <span class="hljs-string">"H2_TITLE"</span>}}</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                ]</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        }</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">    },</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">    {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        <span class="hljs-string">"object"</span>: <span class="hljs-string">"block"</span>,</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        <span class="hljs-string">"type"</span>: <span class="hljs-string">"paragraph"</span>,</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        <span class="hljs-string">"paragraph"</span>: {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                <span class="hljs-string">"text"</span>: [</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                    {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                        <span class="hljs-string">"type"</span>: <span class="hljs-string">"text"</span>,</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                        <span class="hljs-string">"text"</span>: {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                            <span class="hljs-string">"content"</span>: <span class="hljs-string">"Hi, This is a test text."</span>,</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                            <span class="hljs-string">"link"</span>: {</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                                <span class="hljs-string">"url"</span>: <span class="hljs-string">"https://google.com"</span></span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                            }</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                        }</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                    }</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">                ]</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">        }</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">    }</span>
<span class="hljs-meta prompt_">...</span> <span class="language-python">]</span>
<span class="hljs-meta prompt_">&gt;&gt;&gt;</span> <span class="language-python">block_id: <span class="hljs-built_in">str</span> = <span class="hljs-string">"098ebc861d35448a9dd725184512e95d"</span></span>
<span class="hljs-meta prompt_">&gt;&gt;&gt;</span> <span class="language-python">ret = notion.blocks.children.append(block_id=block_id, children=blocks)</span>
<span class="hljs-meta prompt_">&gt;&gt;&gt;</span> <span class="language-python">pprint(ret)</span>
{'child_page': {'title': 'HOGEHOGE'},
 'created_time': '2021-06-27T06:07:00.000Z',
 'has_children': True,
 'id': '098ebc86-1d35-448a-9dd7-25184512e95d',
 'last_edited_time': '2021-06-27T06:12:02.595Z',
 'object': 'block',
 'type': 'child_page'}
</code></pre><h2 id="h789c0a1c8d">Notion SDK for Pythonを使ってみて</h2><p>Documentと見比べつつライブラリを使いました。Public Beta時点で使える機能を抑えており、問題なく使えそうに見えます。公式ドキュメントで詳細の確認が必要ですが、多量のデータのimportや入力の自働化など便利に使えそうです。</p><h2 id="ha739b3b8f6">その他</h2><h3 id="hb4ea2eb796">Upload</h3><p>FAQに記載されていましたがファイルのアップロードに対応していないようです。現時点で思いつく方法としては、Selenium+AHKで1つずつ上げていくぐらいでしょうか。DropboxAPIのようにBulkでのアップロードの対応に期待します。</p><h3 id="hc03fa10a86">他の言語</h3><p>色々対応していそうです。その中でも、GASでGoogleのアプリと連携させたり、タイムトリガーでNotionAPIを叩くような使い方もできそうで、ちょっと興味があります。多分、記事にしないだろうと思いますが、便利な使い方とかシェアできたらそれはそれで良さそうです。</p>

