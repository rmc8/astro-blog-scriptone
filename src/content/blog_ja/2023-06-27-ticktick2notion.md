---
title: "TickTickで完了したタスクをNotionに自動登録する"
slug: "ticktick2notion"
description: ""
date: 2023-06-27T16:47:13.987Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/notion.webp"
draft: false
tags: ['Python', 'JSON', 'Notion', 'API', 'TickTick']
categories: ['Programming']
---

<p>TickTickで完了したTaskを自動的にNotionのデータベースに登録する仕組みを構築します。</p><h2 id="h9707d3a59a">概要</h2><p>Notionはノートの作成やカンバンによる管理、データベースの構築などオールインワンに情報を管理できます。データベースを使ったGUIでフローを構築したり、情報をストックできたりする点にメリットがある一方で、特定の目的に特化したツールを使うほうが時には高い利便性を得られることもあります。<br>今回はToDoの管理をTickTickを用いつつ、完了したTaskをNotionに蓄積させて集計で振り返りができるように機能をつくります。</p><h2 id="h466509ec71">やること</h2><p>TickTickで完了したタスクをNotion上のデータベースに蓄積します。大まかな流れは以下の通りです。</p><ul><li>TickTickでタスクの完了をする</li><li>IFTTTでタスクの完了を検知してGASへWebhook(POST)</li><li>GASでNotionの認証と値の変換をしてWebhook(POST)</li><li>Notionのデータベースに完了したタスクを挿入する</li></ul><p>イベントの発火にはIFTTTのようなWebサービスをつなぐツールが便利なので、これを使います。IFTTTだけではWebhookのHeaderに認証情報を加えたり値を変換したりが難しいので、このギャップをGASで埋めます。</p><h2 id="hcf1b4f26d1">Notion APIを使う準備</h2><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">Integrations＞手順</a>を参考に、Notion側でAPIを使えるように準備します。</p><h2 id="h5f23fd791c">データベースの構築</h2><p></p><p></p><p>TickTickからIFTTTでWebhookにのせられる情報は上の通りです。すべてのデータを保持することに現状ではデメリットはないので、上の情報をストックできるデータベース（テーブル）をNotion上につくります。</p><p></p><p></p><p>日付系の列はDate型、TagはMultiSelect型、それ以外はString型に設定します。データベースの構築が完了したら、ページ右上のShareから作成したIntegrationsをInviteしてAPIを使えるようにしてください。</p><p>［FYI］<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">https://www.notion.so/mikohei/TicktickToNotion-025088cb072748fbba1a1586346d108d#4377d6f1fc2b4efbad100d0b54c4a06f</a></p><h2 id="hdea9182d4e">GASの構築</h2><h3 id="h8f44530b0b">HTTP-POSTのテスト</h3><p>［FYI］<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">IFTTTのWebhookをGASのPOSTで受け取るときのパラメータ覚書</a></p><p>上を参考にIFTTTからWebhookを受け取るコードをためしに書きます。Google Apps ScriptのEditorを開き、以下のコードを入力します。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-keyword">do</span><span class="hljs-constructor">Post(<span class="hljs-params">e</span>)</span> {
  var jsonString = e.postData.get<span class="hljs-constructor">DataAsString()</span>
  const options = {name: <span class="hljs-string">"webhookTest"</span>}
  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">GmailApp</span>.</span></span>send<span class="hljs-constructor">Email(<span class="hljs-string">"yourAlias@gmail.com"</span>, <span class="hljs-string">"webhookTest"</span>, <span class="hljs-params">jsonString</span>, <span class="hljs-params">options</span>)</span>
}
</code></pre><p><code>yourAlias@gmail.com</code>の<code>yourAlias</code>は使っているGoogleアカウントのIDなど、任意のアドレスに書き換えます。<code>doPost</code>関数でPOSTをためしに受け取るため、APIをデプロイします。</p><p></p><p></p><ul><li>［デプロイ］をクリック</li><li>［新しいデプロイ］をクリック</li><li>［種類の選択］をクリック</li><li>［ウェブアプリ］をクリック</li><li>フォームに入力する<ul><li>説明文を書く<ul><li>e.g. Receive a webhook from IFTTT</li></ul></li><li>次のユーザーとして実行で自分を選ぶ</li><li>アクセスできるユーザーを「全員」にする</li></ul></li><li>［デプロイ］をクリック</li><li>ウェブアプリのURLをコピーしてメモ帳などにペースト</li></ul><p>手順が完了したら、<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">ARC</a>やIFTTTなどを使い、コピーしたURL宛にHTTP-POSTを投げてみてください。POSTのRequest内容が上記で設定したメールアドレスに送信されます。うまくいかない場合には、デプロイの設定やコードの誤りなどご確認ください。</p><h3 id="h2beb075646">ライブラリの導入</h3><p>Notion APIを操作するライブラリを導入します。ソースコードは以下の通りです。</p><ul><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">https://github.com/rmc8/notion-sdk-gs</a></li></ul><p>Error処理などは省きましたが、<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">notion-sdk-py</a>と<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">公式ドキュメント</a>を参考に書いたものです。</p><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">公式のライブラリ</a>をGAS用に作り直してくださっている方もいるかもなので、<code>notion-sdk-gs</code>を使う前に再利用できるリソースがないかご確認ください。また、APIのアップデートで機能が充実する可能性もあるので、公式ドキュメントもなるべくご覧ください。</p><p>以下、<code>notion-sdk-gs</code>の導入手順です。</p><ul><li>GAS Editorの左側のサイドメニューから［ライブラリ］をクリック</li><li>スクリプトIDに以下を入力<ul><li>1C6kLuU1Ugclg-8C7hsbK221IgepJoGTrbh2VI4itdExvyFDCzc4adK8h</li></ul></li><li>［検索］をクリックする</li><li>IDに「Notion」と入力する</li><li>［追加］をクリックする</li></ul><p>追加が完了するとサイドメニューのライブラリに「Notion」が追加されます。「Notion」以外の表示がされているときは、それをクリックしてIDを「Notion」に修正してください。</p><h3 id="ha32fd56be0">NotionのTokenの登録</h3><p>以下のコードを実行して、NotionのTokenをGASのプロジェクト上に登録します。<code>{{yourToken}}</code>を「Notion APIを使う準備」で取得したTokenに書き換えて、<code>setNotionToken</code>を実行してください。実行後、<code>readProp</code>を実行して Tokenが表示されることを確認します。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> set<span class="hljs-constructor">NotionToken()</span> {
  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>.set<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>, <span class="hljs-string">"{{yourToken}}"</span>)</span>
}
<span class="hljs-keyword">function</span> read<span class="hljs-constructor">Prop()</span> {
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>
  console.log(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>)
}
</code></pre><p>Tokenが登録され、正しく出力できたら上のコードは削除してOKです。</p><h3 id="hf0a8633530">データベースを解析する</h3><pre><code class="hljs">https:<span class="hljs-string">//www.notion.so/1349f9e927674a03a87d772483dd5b1b</span>?v=05282e02290749fd95decb0df0dc3f5c&amp;p=de3635356a224c569f103a2038dc3521
                      |<span class="hljs-params">---------</span> DatabaseID <span class="hljs-params">---------</span>|                                      |<span class="hljs-params">---------</span> Page ID <span class="hljs-params">------------</span>|
</code></pre><p>データベースのレコード（ページ）を開くとPageIDを取得できます。PageIDを使ってデータベースの構造を取得します。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> dispo<span class="hljs-constructor">GetDbPgStructure(<span class="hljs-params">client</span>, <span class="hljs-params">pgId</span>)</span>{
  const ret = client.pages.retrieve(pgId)
  console.log(<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>stringify(ret))
}
<span class="hljs-keyword">function</span> test<span class="hljs-constructor">Main()</span> {
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>
  const notion = <span class="hljs-keyword">new</span> <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Notion</span>.</span></span>client(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>)
  dispo<span class="hljs-constructor">GetDbPgStructure(<span class="hljs-params">notion</span>, <span class="hljs-string">"8aa1faecaba847f488f277a4b711a42e"</span>)</span>
}
</code></pre><p>正しくPageIDが設定されていると、JSONでデータベースの行の情報を得られます。Responseの<code>properties</code>に各列名があります。列名の配下にはテキストの内容や色、文字の装飾などの情報があります。<br>単にデータの挿入をするだけであれば、テキストなど必要な情報だけ使うだけで更新できるので、JSONから必要な箇所のみを抜き出します。抜き出した情報を参考にして、TickTickのJSONをNotion用のフォーマットに変換する作業をします。</p><h3 id="hfdc4f7ef3b">日付フォーマットの変換</h3><p>TickTickでは日時情報は<code>July 4 2021 at 01:13PM</code>の形式で、日付情報は<code>July 4 2021</code>で表現しています。Notionではそれぞれ、<code>2021-07-04T13:13:00.000+09:00</code>、<code>2021-07-04</code>と表現されます。これにあわせてTickTick→Notionへ日付の書式を変換します。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span>  <span class="hljs-title function_">_isDatetime</span>(<span class="hljs-params">dtString</span>) {
  <span class="hljs-keyword">return</span> (dtString.<span class="hljs-built_in">indexOf</span>(<span class="hljs-string">"AM"</span>) &gt;= <span class="hljs-number">0</span> || dtString.<span class="hljs-built_in">indexOf</span>(<span class="hljs-string">"PM"</span>) &gt;= <span class="hljs-number">0</span>)
}
<span class="hljs-keyword">function</span>  <span class="hljs-title function_">_rmDtNoise</span>(<span class="hljs-params">dtString</span>) {
  <span class="hljs-keyword">var</span>  rmAt = dtString.<span class="hljs-built_in">replace</span>(<span class="hljs-string">" at "</span>, <span class="hljs-string">" "</span>)
  <span class="hljs-keyword">var</span>  blAM = rmAt.<span class="hljs-built_in">replace</span>(<span class="hljs-string">"AM"</span>, <span class="hljs-string">" AM"</span>)
  <span class="hljs-keyword">var</span>  blPM = blAM.<span class="hljs-built_in">replace</span>(<span class="hljs-string">"PM"</span>, <span class="hljs-string">" PM"</span>)
  <span class="hljs-keyword">return</span>  blPM
}
<span class="hljs-keyword">function</span>  <span class="hljs-title function_">_formatDate</span>(<span class="hljs-params">dt, isDt, timezone=<span class="hljs-string">"+09:00"</span>, sep=<span class="hljs-string">"-"</span></span>) {
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">year</span> = dt.getFullYear()
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">month</span> = (<span class="hljs-string">"00"</span> + (dt.getMonth()+<span class="hljs-number">1</span>)).<span class="hljs-built_in">slice</span>(<span class="hljs-number">-2</span>)
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">day</span> = (<span class="hljs-string">"00"</span> + dt.getDate()).<span class="hljs-built_in">slice</span>(<span class="hljs-number">-2</span>)
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">date</span> = <span class="hljs-string">`<span class="hljs-subst">${<span class="hljs-built_in">year</span>}</span><span class="hljs-subst">${sep}</span><span class="hljs-subst">${<span class="hljs-built_in">month</span>}</span><span class="hljs-subst">${sep}</span><span class="hljs-subst">${<span class="hljs-built_in">day</span>}</span>`</span>
  <span class="hljs-keyword">if</span> (!isDt) {
    <span class="hljs-keyword">return</span>  <span class="hljs-built_in">date</span>;
  }
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">hour</span> = (<span class="hljs-string">"00"</span> + (dt.getHours())).<span class="hljs-built_in">slice</span>(<span class="hljs-number">-2</span>)
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">min</span> = (<span class="hljs-string">"00"</span> + (dt.getMinutes())).<span class="hljs-built_in">slice</span>(<span class="hljs-number">-2</span>)
  <span class="hljs-keyword">var</span>  datetime = <span class="hljs-string">`<span class="hljs-subst">${<span class="hljs-built_in">date</span>}</span>T<span class="hljs-subst">${<span class="hljs-built_in">hour</span>}</span>:<span class="hljs-subst">${<span class="hljs-built_in">min</span>}</span>:00.000<span class="hljs-subst">${timezone}</span>`</span>
  <span class="hljs-keyword">return</span>  datetime
}
<span class="hljs-keyword">function</span>  <span class="hljs-title function_">dtFormatter</span>(<span class="hljs-params">dtString</span>) {
  <span class="hljs-keyword">var</span>  fmtDtString = _rmDtNoise(dtString)
  <span class="hljs-keyword">var</span>  isDT = _isDatetime(fmtDtString)
  <span class="hljs-keyword">var</span>  dtParse = <span class="hljs-built_in">Date</span>.parse(fmtDtString)
  <span class="hljs-keyword">var</span>  dt = <span class="hljs-keyword">new</span>  <span class="hljs-built_in">Date</span>(dtParse)
  <span class="hljs-keyword">return</span> _formatDate(dt, isDT)
}
</code></pre><p>時間情報を含むか含まないかで処理を分岐させるため、<code>_isDatetime</code>関数で日時情報を含むか判定します。<code>_rmDtNoise</code>関数では<code>at</code>などを取り除きつつ、時間情報があればAM/PMの前に半角スペースをreplaceを使って挿入します。</p><p><code>Data.parase</code>で日付の数値情報を取得して、<code>Data</code>オブジェクトに数値を渡してDate型のオブジェクトをつくります。<code>_formatDate</code>関数でDate型→String型に変換してNotion用のフォーマットにします。</p><p>上記の一連の処理を<code>dtFormatter</code>関数で実行します。以下は<code>dtFormatter</code>で日付の書式を変換するコードです。テスト用なので実行後に削除いただいて大丈夫です。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">dispoTest</span>(<span class="hljs-params"></span>){
  <span class="hljs-keyword">var</span> ret1 = dtFormatter(<span class="hljs-string">"July 4 2021 at 01:13PM"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret1) <span class="hljs-comment">// 2021-07-04T13:13:00.000+09:00</span>
  <span class="hljs-keyword">var</span> ret2 = dtFormatter(<span class="hljs-string">"July 4 2021"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret2) <span class="hljs-comment">// 2021-07-04</span>
}
</code></pre><h3 id="hdd8590ba40">Tag(MultiSelect)の変換</h3><p>NotionのMultiSelect型の構造を単純に表現すると以下の通りになります。</p><pre><code class="language-json hljs">{<span class="hljs-string">"Tag"</span>: {
  <span class="hljs-string">"multi_select"</span>: [
      {<span class="hljs-string">"name"</span>: <span class="hljs-string">"Private"</span>,},
      {<span class="hljs-string">"name"</span>: <span class="hljs-string">"Work"</span>, }
    ]
  }
}
</code></pre><p>TickTick側のTag情報は<code>#{tagName}</code>の書式です。複数のタグがある場合には半角スペース区切りでタグを複数表記する書き方となっています。この仕様のため、<code>{tagName}</code>に<code>#</code>や半角スペースを含めることができない仕様です。この仕様を使って<code>multi_select</code>の値をつくる関数を書きます。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">genMultiSel</span>(<span class="hljs-params">multiSelStr</span>) {
  <span class="hljs-keyword">var</span> ret = []
  <span class="hljs-keyword">var</span> selList = multiSelStr.<span class="hljs-built_in">split</span>(<span class="hljs-string">" "</span>)
  selList.forEach(<span class="hljs-function">(<span class="hljs-params">tag</span>) =&gt;</span> {
    <span class="hljs-keyword">if</span> (tag.<span class="hljs-built_in">length</span> &gt; <span class="hljs-number">0</span>) {
      <span class="hljs-keyword">var</span> rmSharp = tag.<span class="hljs-built_in">replace</span>(<span class="hljs-string">"#"</span>, <span class="hljs-string">""</span>)
      ret.<span class="hljs-built_in">push</span>({<span class="hljs-attr">name</span>: rmSharp})
    }
  })
  <span class="hljs-keyword">return</span> ret
}
</code></pre><p>以下はテスト用のコードです。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">test</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">var</span> ret = genMultiSel(<span class="hljs-string">"#test1 #test2"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret)
  <span class="hljs-comment">// [ { name: 'test1' }, { name: 'test2' } ]</span>
}
</code></pre><h3 id="hbf41954a8e">Body(JSON)の生成</h3><p>NotionにPOSTするためのJSONをつくります。</p><pre><code class="language-jsx hljs">function <span class="hljs-built_in">_addDate</span>(params, dateStrings, key, value) {
  <span class="hljs-keyword">if</span> (dateStrings<span class="hljs-selector-class">.length</span> &gt; <span class="hljs-number">0</span>) {
    params<span class="hljs-selector-attr">[<span class="hljs-string">"properties"</span>]</span><span class="hljs-selector-attr">[key]</span> = { <span class="hljs-string">"date"</span>: { <span class="hljs-string">"start"</span>: value } }
  }
  return params
}
function <span class="hljs-built_in">genParams</span>(data, databaseId) {
  <span class="hljs-selector-tag">var</span> params = {
    <span class="hljs-string">"parent"</span>: { <span class="hljs-string">"database_id"</span>: databaseId },
    <span class="hljs-string">"properties"</span>: {
        <span class="hljs-string">"TaskName"</span>: {
            <span class="hljs-string">"title"</span>: <span class="hljs-selector-attr">[{ <span class="hljs-string">"text"</span>: { <span class="hljs-string">"content"</span>: data.TaskName } }]</span>
        },
        <span class="hljs-string">"TaskContent"</span>: {
            <span class="hljs-string">"rich_text"</span>: <span class="hljs-selector-attr">[{ <span class="hljs-string">"text"</span>: { <span class="hljs-string">"content"</span>: data.TaskContent } }]</span>
        },
        <span class="hljs-string">"List"</span>: {
            <span class="hljs-string">"rich_text"</span>: <span class="hljs-selector-attr">[{ <span class="hljs-string">"text"</span>: { <span class="hljs-string">"content"</span>: data.List } }]</span>
        },
        <span class="hljs-string">"Priority"</span>: {
            <span class="hljs-string">"rich_text"</span>: <span class="hljs-selector-attr">[{ <span class="hljs-string">"text"</span>: { <span class="hljs-string">"content"</span>: data.Priority } }]</span>
        },
        <span class="hljs-string">"LinkToTask"</span>: {
            <span class="hljs-string">"rich_text"</span>: <span class="hljs-selector-attr">[{ <span class="hljs-string">"text"</span>: { <span class="hljs-string">"content"</span>: data.LinkToTask } }]</span>
        },
        <span class="hljs-string">"CreatedAt"</span>: { <span class="hljs-string">"date"</span>: { <span class="hljs-string">"start"</span>: <span class="hljs-built_in">dtFormatter</span>(data.CreatedAt) } }
    }
  }
  <span class="hljs-selector-tag">var</span> tags = <span class="hljs-built_in">genMultiSel</span>(data.Tag)
  <span class="hljs-keyword">if</span> (tags<span class="hljs-selector-class">.length</span> &gt; <span class="hljs-number">0</span>) {
    params<span class="hljs-selector-attr">[<span class="hljs-string">"properties"</span>]</span><span class="hljs-selector-attr">[<span class="hljs-string">"Tag"</span>]</span> = {<span class="hljs-string">"multi_select"</span>: tags}
  }
  params = <span class="hljs-built_in">_addDate</span>(params, data<span class="hljs-selector-class">.StartDate</span><span class="hljs-selector-class">.length</span>, <span class="hljs-string">"StartDate"</span>, <span class="hljs-built_in">dtFormatter</span>(data.StartDate))
  params = <span class="hljs-built_in">_addDate</span>(params, data<span class="hljs-selector-class">.EndDate</span><span class="hljs-selector-class">.length</span>, <span class="hljs-string">"EndDate"</span>, <span class="hljs-built_in">dtFormatter</span>(data.EndDate))
  return params
}
</code></pre><p>DatabaseIDをつかってデータを流し込む先のデータベースを特定します。データベースの型にあわせて<code>properties</code>を設定してあげます。MultiSelectは空文字のケースもあるので、タグの有無にあわせて後から値を追加する処理をしています。これでTickTick→Notionの変換処理は完了です。</p><h3 id="h2daff9da5f">doPostをデプロイする</h3><p>上記の処理をdoPostに反映されます。</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-keyword">do</span><span class="hljs-constructor">Post(<span class="hljs-params">e</span>)</span> {
  <span class="hljs-comment">// Init</span>
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>;
  const notion = <span class="hljs-keyword">new</span> <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Notion</span>.</span></span>client(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>);
  var jsonString = e.postData.get<span class="hljs-constructor">DataAsString()</span>;
  var data = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>parse(jsonString);

  <span class="hljs-comment">// Generate a Parameter</span>
  const params = gen<span class="hljs-constructor">Params(<span class="hljs-params">data</span>, <span class="hljs-string">"cf0bc59e33734173838e0370c210fa3d"</span>)</span>

  <span class="hljs-comment">// Create a record</span>
  var ret = notion.pages.create(params)
  <span class="hljs-keyword">if</span> (ret<span class="hljs-literal">["<span class="hljs-identifier">status</span>"]</span> &gt;= <span class="hljs-number">300</span><span class="hljs-operator"> &amp;&amp; </span>ret<span class="hljs-literal">["<span class="hljs-identifier">status</span>"]</span> &lt; <span class="hljs-number">200</span> ) {
    const options = {name: <span class="hljs-string">"IFTTT Webhooks Error"</span>};
    <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">GmailApp</span>.</span></span>send<span class="hljs-constructor">Email(<span class="hljs-string">"yourAlias@gmail.com"</span>, <span class="hljs-string">"webhookTest"</span>, JSON.<span class="hljs-params">stringify</span>(<span class="hljs-params">ret</span>)</span>, options);
  }
}
</code></pre><p>変更を反映させるためもう一度デプロイする作業をしてください。作業後、新しくURLが発行されるため、そのURLを使ってNotionのデータベースにレコードが追加されるか確認します。エラーメールやエラーメッセージがある場合にはメッセージに従ってデバッグしてください。</p><h2 id="h8088f2eceb">IFTTTの設定</h2><p>最後に、IFTTTからGASのAPIを叩くように設定します。TriggerにはTickTickの<code>New completed task</code>を選択します。New completed taskでは対象のListやTag、Priorityを選択できます。Notionのデータベースで集計やフィルターができるので、ここでは以下の通りに設定してすべてのタスクをストックする設定とします。</p><table><tbody><tr><th colspan="1" rowspan="1"><p>Item</p></th><th colspan="1" rowspan="1"><p>Value</p></th></tr><tr><td colspan="1" rowspan="1"><p>List</p></td><td colspan="1" rowspan="1"><p>All Lists</p></td></tr><tr><td colspan="1" rowspan="1"><p>Tag</p></td><td colspan="1" rowspan="1"><p>Please Select(Default)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Priority</p></td><td colspan="1" rowspan="1"><p>Please Select(Default)</p></td></tr></tbody></table><p>設定した［Create trigger］をクリックします。Then ThatにはWebhookを選び以下の設定をします。</p><table><tbody><tr><th colspan="1" rowspan="1"><p>Item</p></th><th colspan="1" rowspan="1"><p>Value</p></th></tr><tr><td colspan="1" rowspan="1"><p>URL</p></td><td colspan="1" rowspan="1"><p>デプロイしたGAS APIのURL</p></td></tr><tr><td colspan="1" rowspan="1"><p>Method</p></td><td colspan="1" rowspan="1"><p>POST</p></td></tr><tr><td colspan="1" rowspan="1"><p>Content Type</p></td><td colspan="1" rowspan="1"><p>application/json</p></td></tr><tr><td colspan="1" rowspan="1"><p>Body</p></td><td colspan="1" rowspan="1"><p>以下参照</p></td></tr></tbody></table><p><strong>［Body］</strong></p><pre><code class="language-json hljs"><span class="hljs-punctuation">{</span>
    <span class="hljs-attr">"TaskName"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{TaskName}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"TaskContent"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{TaskContent}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"CompleteDate"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{CompleteDate}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"StartDate"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{StartDate}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"EndDate"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{EndDate}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"List"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{List}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"Priority"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{Priority}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"Tag"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{Tag}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"LinkToTask"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{LinkToTask}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"CreatedAt"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{CreatedAt}"</span>
<span class="hljs-punctuation">}</span>
</code></pre><p>設定が完了したら、［Create action］をクリックします。</p><h2 id="h3c7222fefe">動作確認</h2><p>TickTickでタスクをつくり、タスクを完了の状態とします。タスクの完了にあわせてNotionに完了したタスクが登録されたら正常動作となります。なお、IFTTTでイベントが発火するまで数分のラグがあるため、IFTTTの「View activity」やエラーメール、Notionのデータベースなどで動作状況をご確認ください。</p><h2 id="ha214098e44">まとめ</h2><p>GASやIFTTTからNotion APIが叩けるようになりました。これにより、タイムトリガーやイベントトリガーでNotionを使えるようになり、より柔軟にデータをストックできるようになります。タスクや習慣・健康管理・分析など幅広く活用できるので、ご自身の用途に合わせて自由に使っていくきっかけになりましたら幸いです。</p>

