---
title: "TickTick에서 완료된 작업을 Notion에 자동 등록하기"
slug: "ticktick2notion"
description: ""
date: 2023-06-27T16:47:13.987Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/notion.webp"
draft: false
tags: ['Python', 'JSON', 'Notion', 'API', 'TickTick']
categories: ['Programming']
---

<p>TickTick에서 완료된 작업을 Notion의 데이터베이스에 자동으로 등록하는 메커니즘을 구축합니다.</p><h2 id="h9707d3a59a">개요</h2><p>Notion은 노트 작성, 칸반 관리, 데이터베이스 구축 등 모든 것을 하나의 플랫폼에서 정보를 관리할 수 있습니다. 데이터베이스를 사용한 GUI로 흐름을 구축하거나 정보를 저장할 수 있는 점이 장점인 반면, 특정 목적에 특화된 도구를 사용하는 것이 더 높은 편의성을 제공할 때도 있습니다.<br>이번에는 ToDo 관리를 TickTick으로 하면서, 완료된 작업을 Notion에 축적하여 집계로 되돌아볼 수 있도록 기능을 만듭니다.</p><h2 id="h466509ec71">할 일</h2><p>TickTick에서 완료된 작업을 Notion의 데이터베이스에 축적합니다. 대략적인 흐름은 다음과 같습니다.</p><ul><li>TickTick에서 작업을 완료합니다.</li><li>IFTTT로 작업 완료를 감지하여 GAS로 Webhook(POST)합니다.</li><li>GAS에서 Notion의 인증과 값 변환을 한 후 Webhook(POST)합니다.</li><li>Notion의 데이터베이스에 완료된 작업을 삽입합니다.</li></ul><p>이벤트 발화를 위해 IFTTT와 같은 웹 서비스를 연결하는 도구가 편리합니다. IFTTT만으로는 Webhook의 헤더에 인증 정보를 추가하거나 값을 변환하는 것이 어렵기 때문에, 이 격차를 GAS로 메웁니다.</p><h2 id="hcf1b4f26d1">Notion API 준비</h2><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">Integrations＞절차</a>를 참고하여 Notion 측에서 API를 사용할 수 있도록 준비합니다.</p><h2 id="h5f23fd791c">데이터베이스 구축</h2><p></p><p></p><p>TICKTick에서 IFTTT로 Webhook에 실릴 수 있는 정보는 위와 같습니다. 모든 데이터를 유지하는 데 현재는 단점이 없으므로, 위 정보를 저장할 수 있는 데이터베이스(테이블)를 Notion에 만듭니다.</p><p></p><p></p><p>날짜 관련 열은 Date 형식, Tag는 MultiSelect 형식, 나머지는 String 형식으로 설정합니다. 데이터베이스 구축이 완료되면, 페이지 오른쪽 상단의 Share에서 생성한 Integrations를 초대하여 API를 사용할 수 있도록 해주세요.</p><p>［FYI］<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">https://www.notion.so/mikohei/TicktickToNotion-025088cb072748fbba1a1586346d108d#4377d6f1fc2b4efbad100d0b54c4a06f</a></p><h2 id="hdea9182d4e">GAS 구축</h2><h3 id="h8f44530b0b">HTTP-POST 테스트</h3><p>［FYI］<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">IFTTT의 Webhook을 GAS의 POST로 받을 때의 파라미터 메모</a></p><p>위를 참고하여 IFTTT에서 Webhook을 받는 코드를 테스트로 작성합니다. Google Apps Script의 Editor를 열고, 다음 코드를 입력합니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-keyword">do</span><span class="hljs-constructor">Post(<span class="hljs-params">e</span>)</span> {
  var jsonString = e.postData.get<span class="hljs-constructor">DataAsString()</span>
  const options = {name: <span class="hljs-string">"webhookTest"</span>}
  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">GmailApp</span>.</span></span>send<span class="hljs-constructor">Email(<span class="hljs-string">"yourAlias@gmail.com"</span>, <span class="hljs-string">"webhookTest"</span>, <span class="hljs-params">jsonString</span>, <span class="hljs-params">options</span>)</span>
}
</code></pre><p><code>yourAlias@gmail.com</code>의 <code>yourAlias</code>는 사용 중인 Google 계정의 ID 등으로, 임의의 주소로 변경합니다. <code>doPost</code> 함수로 POST를 테스트로 받기 위해, API를 배포합니다.</p><p></p><p></p><ul><li>［배포］를 클릭</li><li>［새 배포］를 클릭</li><li>［유형 선택］를 클릭</li><li>［웹 앱］를 클릭</li><li>폼에 입력<ul><li>설명문을 작성<ul><li>e.g. Receive a webhook from IFTTT</li></ul></li><li>다음 사용자로서 실행에서 자신을 선택</li><li>액세스할 수 있는 사용자를 “모두”로 함</li></ul></li><li>［배포］를 클릭</li><li>웹 앱의 URL을 복사하여 메모장 등에 붙여넣기</li></ul><p>절차가 완료되면, <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">ARC</a>나 IFTTT 등을 사용하여 복사한 URL에 HTTP-POST를 보내 보세요. POST의 Request 내용이 위에서 설정한 이메일 주소로 전송됩니다. 실패할 경우, 배포 설정이나 코드 오류 등을 확인하세요.</p><h3 id="h2beb075646">라이브러리 도입</h3><p>Notion API를 조작하는 라이브러리를 도입합니다. 소스 코드는 다음과 같습니다.</p><ul><li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">https://github.com/rmc8/notion-sdk-gs</a></li></ul><p>Error 처리 등은 생략했지만, <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">notion-sdk-py</a>와 <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">공식 문서</a>를 참고하여 작성한 것입니다.</p><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">공식 라이브러리</a>를 GAS용으로 재작성한 분도 있을 수 있으니, <code>notion-sdk-gs</code>를 사용하기 전에 재사용 가능한 리소스가 없는지 확인하세요. 또한, API의 업데이트로 기능이 강화될 가능성도 있으므로, 공식 문서도 최대한 보세요.</p><p>아래는 <code>notion-sdk-gs</code>의 도입 절차입니다.</p><ul><li>GAS Editor의 왼쪽 사이드 메뉴에서 ［라이브러리］를 클릭</li><li>스크립트 ID에 다음을 입력<ul><li>1C6kLuU1Ugclg-8C7hsbK221IgepJoGTrbh2VI4itdExvyFDCzc4adK8h</li></ul></li><li>［검색］을 클릭</li><li>ID에 “Notion”을 입력</li><li>［추가］를 클릭</li></ul><p>추가가 완료되면 사이드 메뉴의 라이브러리에 “Notion”이 추가됩니다. “Notion” 이외의 표시가 되어 있으면, 그것을 클릭하여 ID를 “Notion”으로 수정하세요.</p><h3 id="ha32fd56be0">Notion의 Token 등록</h3><p>다음 코드를 실행하여 Notion의 Token을 GAS의 프로젝트에 등록합니다. <code>{{yourToken}}</code>을 “Notion API 준비”에서 얻은 Token으로 변경하여 <code>setNotionToken</code>을 실행하세요. 실행 후, <code>readProp</code>을 실행하여 Token이 표시되는지 확인합니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> set<span class="hljs-constructor">NotionToken()</span> {
  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>.set<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>, <span class="hljs-string">"{{yourToken}}"</span>)</span>
}
<span class="hljs-keyword">function</span> read<span class="hljs-constructor">Prop()</span> {
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>
  console.log(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>)
}
</code></pre><p>Token이 등록되고 올바르게 출력되면 위 코드는 삭제해도 됩니다.</p><h3 id="hf0a8633530">데이터베이스를 분석하기</h3><pre><code class="hljs">https:<span class="hljs-string">//www.notion.so/1349f9e927674a03a87d772483dd5b1b</span>?v=05282e02290749fd95decb0df0dc3f5c&amp;p=de3635356a224c569f103a2038dc3521
                      |<span class="hljs-params">---------</span> DatabaseID <span class="hljs-params">---------</span>|                                      |<span class="hljs-params">---------</span> Page ID <span class="hljs-params">------------</span>|
</code></pre><p>데이터베이스의 레코드(페이지)를 열면 PageID를 얻을 수 있습니다. PageID를 사용하여 데이터베이스의 구조를 얻습니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> dispo<span class="hljs-constructor">GetDbPgStructure(<span class="hljs-params">client</span>, <span class="hljs-params">pgId</span>)</span>{
  const ret = client.pages.retrieve(pgId)
  console.log(<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>stringify(ret))
}
<span class="hljs-keyword">function</span> test<span class="hljs-constructor">Main()</span> {
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>
  const notion = <span class="hljs-keyword">new</span> <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Notion</span>.</span></span>client(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>)
  dispo<span class="hljs-constructor">GetDbPgStructure(<span class="hljs-params">notion</span>, <span class="hljs-string">"8aa1faecaba847f488f277a4b711a42e"</span>)</span>
}
</code></pre><p>PageID가 올바르게 설정되어 있으면, JSON으로 데이터베이스의 행 정보를 얻을 수 있습니다. Response의 <code>properties</code>에 각 열 이름이 있습니다. 열 이름 아래에는 텍스트 내용, 색상, 텍스트 장식 등의 정보가 있습니다.<br>단순히 데이터를 삽입하는 경우, 텍스트 등 필요한 정보만 사용하여 업데이트할 수 있으므로, JSON에서 필요한 부분만 추출합니다. 추출한 정보를 참고하여, TickTick의 JSON을 Notion용 형식으로 변환하는 작업을 합니다.</p><h3 id="hfdc4f7ef3b">날짜 형식 변환</h3><p>TICKTick에서는 날짜/시간 정보가 <code>July 4 2021 at 01:13PM</code> 형식으로, 날짜 정보는 <code>July 4 2021</code>으로 표현합니다. Notion에서는 각각 <code>2021-07-04T13:13:00.000+09:00</code>, <code>2021-07-04</code>로 표현됩니다. 이에 맞게 TickTick → Notion으로 날짜 형식을 변환합니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span>  <span class="hljs-title function_">_isDatetime</span>(<span class="hljs-params">dtString</span>) {
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
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">month</span> = (<span class="hljs-string">"00"</span> + (dt.getMonth()+<span class="hljs-number">1</span>)).<span class="hljs-built_in">slice</span>(-<span class="hljs-number">2</span>)
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">day</span> = (<span class="hljs-string">"00"</span> + dt.getDate()).<span class="hljs-built_in">slice</span>(-<span class="hljs-number">2</span>)
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">date</span> = <span class="hljs-string">`<span class="hljs-subst">${<span class="hljs-built_in">year</span>}</span><span class="hljs-subst">${sep}</span><span class="hljs-subst">${<span class="hljs-built_in">month</span>}</span><span class="hljs-subst">${sep}</span><span class="hljs-subst">${<span class="hljs-built_in">day</span>}</span>`</span>
  <span class="hljs-keyword">if</span> (!isDt) {
    <span class="hljs-keyword">return</span>  <span class="hljs-built_in">date</span>;
  }
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">hour</span> = (<span class="hljs-string">"00"</span> + (dt.getHours())).<span class="hljs-built_in">slice</span>(-<span class="hljs-number">2</span>)
  <span class="hljs-keyword">var</span>  <span class="hljs-built_in">min</span> = (<span class="hljs-string">"00"</span> + (dt.getMinutes())).<span class="hljs-built_in">slice</span>(-<span class="hljs-number">2</span>)
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
</code></pre><p>시간 정보를 포함하는지 여부에 따라 처리를 분기시키기 위해, <code>_isDatetime</code> 함수로 날짜/시간 정보를 포함하는지 판단합니다. <code>_rmDtNoise</code> 함수에서는 <code>at</code> 등을 제거하면서, 시간 정보가 있으면 AM/PM 앞에 반각 스페이스를 replace를 사용하여 삽입합니다.</p><p><code>Data.parase</code>로 날짜의 숫자 정보를 얻어, <code>Data</code> 객체에 숫자를 전달하여 Date 형식의 객체를 만듭니다. <code>_formatDate</code> 함수로 Date 형식 → String 형식으로 변환하여 Notion용 형식으로 만듭니다.</p><p>위의 일련의 처리를 <code>dtFormatter</code> 함수로 실행합니다. 아래는 <code>dtFormatter</code>로 날짜 형식을 변환하는 코드입니다. 테스트용이므로 실행 후 삭제해도 됩니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">dispoTest</span>(<span class="hljs-params"></span>){
  <span class="hljs-keyword">var</span> ret1 = dtFormatter(<span class="hljs-string">"July 4 2021 at 01:13PM"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret1) <span class="hljs-comment">// 2021-07-04T13:13:00.000+09:00</span>
  <span class="hljs-keyword">var</span> ret2 = dtFormatter(<span class="hljs-string">"July 4 2021"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret2) <span class="hljs-comment">// 2021-07-04</span>
}
</code></pre><h3 id="hdd8590ba40">Tag(MultiSelect) 변환</h3><p>Notion의 MultiSelect 형식 구조를 간단히 표현하면 다음과 같습니다.</p><pre><code class="language-json hljs">{
  <span class="hljs-attr">"Tag"</span>: {
    <span class="hljs-attr">"multi_select"</span>: [
        {<span class="hljs-attr">"name"</span>: <span class="hljs-string">"Private"</span>,},
        {<span class="hljs-attr">"name"</span>: <span class="hljs-string">"Work"</span>, }
      ]
    }
}
</code></pre><p>TICKTick 측의 Tag 정보는 <code>#{tagName}</code> 형식입니다. 여러 태그가 있는 경우에는 반각 스페이스로 구분하여 태그를 여러 개 표기하는 방식입니다. 이 사양 때문에 <code>{tagName}</code>에 <code>#</code>이나 반각 스페이스를 포함할 수 없는 사양입니다. 이 사양을 사용하여 <code>multi_select</code>의 값을 만드는 함수를 작성합니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">genMultiSel</span>(<span class="hljs-params">multiSelStr</span>) {
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
</code></pre><p>아래는 테스트용 코드입니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">test</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">var</span> ret = genMultiSel(<span class="hljs-string">"#test1 #test2"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret)
  <span class="hljs-comment">// [ { name: 'test1' }, { name: 'test2' } ]</span>
}
</code></pre><h3 id="hbf41954a8e">Body(JSON) 생성</h3><p>Notion에 POST하기 위한 JSON을 만듭니다.</p><pre><code class="language-jsx hljs">function <span class="hljs-built_in">_addDate</span>(params, dateStrings, key, value) {
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
</code></pre><p>DatabaseID를 사용하여 데이터를 흘려 넣을 대상 데이터베이스를 식별합니다. 데이터베이스의 형식에 맞게 <code>properties</code>를 설정합니다. MultiSelect는 빈 문자열의 경우도 있으므로, 태그의 유무에 따라 나중에 값을 추가하는 처리를 하고 있습니다. 이로써 TickTick → Notion의 변환 처리는 완료입니다.</p><h3 id="h2daff9da5f">doPost 배포하기</h3><p>위 처리를 doPost에 반영합니다.</p><pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-keyword">do</span><span class="hljs-constructor">Post(<span class="hljs-params">e</span>)</span> {
  <span class="hljs-comment">// Init</span>
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>;
  const notion = <span class="hljs-keyword">new</span> <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Notion</span>.</span></span>client(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>);
  var jsonString = e.postData.get<span class="hljs-constructor">DataAsString()</span>;
  var data = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>parse(jsonString);

  <span class="hljs-comment">// Generate a Parameter</span>
  const params = gen<span class="hljs-constructor">Params(<span class="hljs-params">data</span>, <span class="hljs-string">"cf0bc59e33734173838e0370c210fa3d"</span>)</span>

  <span class="hljs-comment">// Create a record</span>
  var ret = notion.pages.create(params)
  <span class="hljs-keyword">if</span> (ret<span class="hljs-literal">["<span class="hljs-identifier">status"</span>]</span> &gt;= <span class="hljs-number">300</span><span class="hljs-operator">&amp;&amp;</span> ret<span class="hljs-literal">["<span class="hljs-identifier">status"</span>]</span> &lt; <span class="hljs-number">200</span> ) {
    const options = {name: <span class="hljs-string">"IFTTT Webhooks Error"</span>};
    <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">GmailApp</span>.</span></span>send<span class="hljs-constructor">Email(<span class="hljs-string">"yourAlias@gmail.com"</span>, <span class="hljs-string">"webhookTest"</span>, JSON.<span class="hljs-params">stringify</span>(<span class="hljs-params">ret</span>)</span>, options);
  }
}
</code></pre><p>변경을 반영하기 위해 다시 배포 작업을 해주세요. 작업 후, 새로운 URL이 발급되므로, 그 URL을 사용하여 Notion의 데이터베이스에 레코드가 추가되는지 확인합니다. 에러 메일이나 에러 메시지가 있으면 메시지에 따라 디버그하세요.</p><h2 id="h8088f2eceb">IFTTT 설정</h2><p>마지막으로, IFTTT에서 GAS의 API를 호출하도록 설정합니다. Trigger에는 TickTick의 <code>New completed task</code>를 선택합니다. New completed task에서는 대상 List, Tag, Priority를 선택할 수 있습니다. Notion의 데이터베이스에서 집계나 필터링이 가능하므로, 여기서는 다음과 같이 설정하여 모든 작업을 저장하는 설정으로 합니다.</p><table><tbody><tr><th colspan="1" rowspan="1"><p>항목</p></th><th colspan="1" rowspan="1"><p>값</p></th></tr><tr><td colspan="1" rowspan="1"><p>List</p></td><td colspan="1" rowspan="1"><p>All Lists</p></td></tr><tr><td colspan="1" rowspan="1"><p>Tag</p></td><td colspan="1" rowspan="1"><p>Please Select(기본)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Priority</p></td><td colspan="1" rowspan="1"><p>Please Select(기본)</p></td></tr></tbody></table><p>설정한 ［Create trigger］를 클릭합니다. Then That에는 Webhook을 선택하고 다음 설정을 합니다.</p><table><tbody><tr><th colspan="1" rowspan="1"><p>항목</p></th><th colspan="1" rowspan="1"><p>값</p></th></tr><tr><td colspan="1" rowspan="1"><p>URL</p></td><td colspan="1" rowspan="1"><p>배포한 GAS API의 URL</p></td></tr><tr><td colspan="1" rowspan="1"><p>Method</p></td><td colspan="1" rowspan="1"><p>POST</p></td></tr><tr><td colspan="1" rowspan="1"><p>Content Type</p></td><td colspan="1" rowspan="1"><p>application/json</p></td></tr><tr><td colspan="1" rowspan="1"><p>Body</p></td><td colspan="1" rowspan="1"><p>아래 참조</p></td></tr></tbody></table><p><strong>［Body］</strong></p><pre><code class="language-json hljs">{
    <span class="hljs-attr">"TaskName"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{TaskName}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"TaskContent"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{TaskContent}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"CompleteDate"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{CompleteDate}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"StartDate"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{StartDate}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"EndDate"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{EndDate}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"List"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{List}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"Priority"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{Priority}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"Tag"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{Tag}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"LinkToTask"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{LinkToTask}}"</span><span class="hljs-punctuation">,</span>
    <span class="hljs-attr">"CreatedAt"</span><span class="hljs-punctuation">:</span> <span class="hljs-string">"{{CreatedAt}}"</span>
<span class="hljs-punctuation">}</span>
</code></pre><p>설정이 완료되면, ［Create action］를 클릭합니다.</p><h2 id="h3c7222fefe">동작 확인</h2><p>TICKTick에서 작업을 만들고, 작업을 완료 상태로 합니다. 작업 완료와 함께 Notion에 완료된 작업이 등록되면 정상 동작입니다. IFTTT에서 이벤트가 발화하는 데 몇 분의 지연이 있을 수 있으므로, IFTTT의 ‘View activity’나 에러 메일, Notion의 데이터베이스 등으로 동작 상황을 확인하세요.</p><h2 id="ha214098e44">요약</h2><p>GAS나 IFTTT에서 Notion API를 호출할 수 있게 되었습니다. 이로 인해, 시간 트리거나 이벤트 트리거로 Notion을 사용할 수 있게 되어, 더 유연하게 데이터를 저장할 수 있습니다. 작업, 습관, 건강 관리, 분석 등 광범위하게 활용할 수 있으니, 자신의 용도에 맞게 자유롭게 사용하세요.</p>