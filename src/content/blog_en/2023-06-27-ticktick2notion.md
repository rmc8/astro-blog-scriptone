---
title: "Automatically Register Completed TickTick Tasks to Notion"
slug: "ticktick2notion"
description: ""
date: 2023-06-27T16:47:13.987Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/notion.webp"
draft: false
tags: ['Python', 'JSON', 'Notion', 'API', 'TickTick']
categories: ['Programming']
---

<p>Build a system to automatically register tasks completed in TickTick to a Notion database.</p>
<h2 id="h9707d3a59a">Overview</h2>
<p>Notion allows for all-in-one information management, including note creation, Kanban-style management, and database building. While it offers benefits like building GUI flows with databases or stocking information, sometimes using tools specialized for specific purposes provides higher convenience. In this case, we will manage ToDo with TickTick and create a function to accumulate completed tasks in Notion for aggregation and review.</p>
<h2 id="h466509ec71">What to Do</h2>
<p>We will accumulate tasks completed in TickTick into a Notion database. The general flow is as follows.</p>
<ul>
<li>Complete a task in TickTick</li>
<li>Detect task completion with IFTTT and send a Webhook (POST) to GAS</li>
<li>In GAS, handle Notion authentication and value conversion, then send a Webhook (POST)</li>
<li>Insert the completed task into the Notion database</li>
</ul>
<p>Tools like IFTTT are convenient for triggering events. However, since IFTTT makes it difficult to add authentication information to Webhook headers or convert values, we will use GAS to fill this gap.</p>
<h2 id="hcf1b4f26d1">Preparing to Use Notion API</h2>
<p>Refer to <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">Integrations > Steps</a> to prepare the Notion side for API usage.</p>
<h2 id="h5f23fd791c">Database Construction</h2>
<p></p>
<p></p>
<p>The information that can be carried via Webhook from TickTick through IFTTT is as above. Since there are no current disadvantages to retaining all data, we will create a database (table) in Notion to store this information.</p>
<p></p>
<p></p>
<p>Set date-related columns to Date type, Tag to MultiSelect type, and all others to String type. Once database construction is complete, go to the page's top-right Share menu, invite the created Integration, and enable API access.</p>
<p>[FYI] <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">https://www.notion.so/mikohei/TicktickToNotion-025088cb072748fbba1a1586346d108d#4377d6f1fc2b4efbad100d0b54c4a06f</a></p>
<h2 id="hdea9182d4e">GAS Construction</h2>
<h3 id="h8f44530b0b">HTTP-POST Testing</h3>
<p>[FYI] <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">Memo on Parameters for Receiving IFTTT Webhook via GAS POST</a></p>
<p>Referring to the above, write sample code to receive the Webhook from IFTTT. Open the Google Apps Script Editor and input the following code.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-keyword">do</span><span class="hljs-constructor">Post(<span class="hljs-params">e</span>)</span> {
  var jsonString = e.postData.get<span class="hljs-constructor">DataAsString()</span>
  const options = {name: <span class="hljs-string">"webhookTest"</span>}
  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">GmailApp</span>.</span></span>send<span class="hljs-constructor">Email(<span class="hljs-string">"yourAlias@gmail.com"</span>, <span class="hljs-string">"webhookTest"</span>, <span class="hljs-params">jsonString</span>, <span class="hljs-params">options</span>)</span>
}
</code></pre>
<p>Replace <code>yourAlias</code> in <code>yourAlias@gmail.com</code> with your Google account ID or any desired address. To test receiving POST, deploy the API.</p>
<p></p>
<p></p>
<ul>
<li>Click [Deploy]</li>
<li>Click [New deployment]</li>
<li>Click [Select type]</li>
<li>Click [Web app]</li>
<li>Fill in the form:<ul>
<li>Write a description (e.g., Receive a webhook from IFTTT)</li>
<li>Select yourself for "Execute as"</li>
<li>Set "Who has access" to "Anyone"</li>
</ul>
</li>
<li>Click [Deploy]</li>
<li>Copy the web app URL and paste it into a notepad or similar</li>
</ul>
<p>Once the steps are complete, use tools like <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">ARC</a> or IFTTT to send an HTTP-POST to the copied URL. The request content of the POST will be sent to the email address you set. If it doesn't work, check the deployment settings or code for errors.</p>
<h3 id="h2beb075646">Library Introduction</h3>
<p>Introduce the library to operate the Notion API. The source code is as follows.</p>
<ul>
<li><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">https://github.com/rmc8/notion-sdk-gs</a></li>
</ul>
<p>Error handling has been omitted, but it was written based on <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">notion-sdk-py</a> and the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/2595771111680511772#">official documentation</a>.</p>
<p>There might be individuals who have adapted the official library for GAS, so before using <code>notion-sdk-gs</code>, check for reusable resources. Also, since the API might be updated to include more features, please refer to the official documentation as much as possible.</p>
<p>Below are the steps to introduce <code>notion-sdk-gs</code>.</p>
<ul>
<li>From the GAS Editor's left side menu, click [Library]</li>
<li>Enter the following in the script ID:<ul>
<li>1C6kLuU1Ugclg-8C7hsbK221IgepJoGTrbh2VI4itdExvyFDCzc4adK8h</li>
</ul>
</li>
<li>Click [Look up]</li>
<li>Enter "Notion" in the ID field</li>
<li>Click [Add]</li>
</ul>
<p>Once added, "Notion" will appear in the side menu libraries. If something other than "Notion" is displayed, click it and correct the ID to "Notion".</p>
<h3 id="ha32fd56be0">Registering Notion Token</h3>
<p>Execute the following code to register the Notion Token in the GAS project. Replace <code>{{yourToken}}</code> with the Token obtained in "Preparing to Use Notion API" and run <code>setNotionToken</code>. After execution, run <code>readProp</code> to confirm that the Token is displayed.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> set<span class="hljs-constructor">NotionToken()</span> {
  <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>.set<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>, <span class="hljs-string">"{{yourToken}}"</span>)</span>
}
<span class="hljs-keyword">function</span> read<span class="hljs-constructor">Prop()</span> {
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>
  console.log(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>)
}
</code></pre>
<p>If the Token is registered and output correctly, you can delete the above code.</p>
<h3 id="hf0a8633530">Analyzing the Database</h3>
<pre><code class="hljs">https:<span class="hljs-string">//www.notion.so/1349f9e927674a03a87d772483dd5b1b</span>?v=05282e02290749fd95decb0df0dc3f5c&amp;p=de3635356a224c569f103a2038dc3521
                      |<span class="hljs-params">---------</span> DatabaseID <span class="hljs-params">---------</span>|                                      |<span class="hljs-params">---------</span> Page ID <span class="hljs-params">------------</span>|
</code></pre>
<p>Opening a database record (page) allows you to obtain the PageID. Use the PageID to acquire the database structure.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> dispo<span class="hljs-constructor">GetDbPgStructure(<span class="hljs-params">client</span>, <span class="hljs-params">pgId</span>)</span>{
  const ret = client.pages.retrieve(pgId)
  console.log(<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>stringify(ret))
}
<span class="hljs-keyword">function</span> test<span class="hljs-constructor">Main()</span> {
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>
  const notion = <span class="hljs-keyword">new</span> <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Notion</span>.</span></span>client(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>)
  dispo<span class="hljs-constructor">GetDbPgStructure(<span class="hljs-params">notion</span>, <span class="hljs-string">"8aa1faecaba847f488f277a4b711a42e"</span>)</span>
}
</code></pre>
<p>If the PageID is set correctly, you will get the database row information in JSON. The <code>properties</code> in the response contain the column names. Under each column name, there is information like text content, color, and text decoration. For simple data insertion, you can update by using only the necessary information, such as text, so extract only the required parts from the JSON. Use the extracted information as a reference to convert TickTick's JSON to Notion's format.</p>
<h3 id="hfdc4f7ef3b">Date Format Conversion</h3>
<p>In TickTick, date-time information is expressed as <code>July 4 2021 at 01:13PM</code>, and date information as <code>July 4 2021</code>. In Notion, these are expressed as <code>2021-07-04T13:13:00.000+09:00</code> and <code>2021-07-04</code>, respectively. Convert the date format from TickTick to Notion accordingly.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span>  <span class="hljs-title function_">_isDatetime</span>(<span class="hljs-params">dtString</span>) {
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
</code></pre>
<p>To branch processing based on whether it includes date-time information, the <code>_isDatetime</code> function checks for date-time inclusion. The <code>_rmDtNoise</code> function removes <code>at</code> and inserts a half-width space before AM/PM using replace.</p>
<p><code>Date.parse</code> acquires the numerical information of the date and passes it to a <code>Date</code> object to create a Date-type object. The <code>_formatDate</code> function converts from Date type to String type in Notion's format.</p>
<p>Execute the above series of processes with the <code>dtFormatter</code> function. The following is code to convert the date format using <code>dtFormatter</code>. This is for testing, so you can delete it after execution.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">dispoTest</span>(<span class="hljs-params"></span>){
  <span class="hljs-keyword">var</span> ret1 = dtFormatter(<span class="hljs-string">"July 4 2021 at 01:13PM"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret1) <span class="hljs-comment">// 2021-07-04T13:13:00.000+09:00</span>
  <span class="hljs-keyword">var</span> ret2 = dtFormatter(<span class="hljs-string">"July 4 2021"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret2) <span class="hljs-comment">// 2021-07-04</span>
}
</code></pre>
<h3 id="hdd8590ba40">Tag (MultiSelect) Conversion</h3>
<p>The simple structure of Notion's MultiSelect type is as follows.</p>
<pre><code class="language-json hljs">{
  <span class="hljs-attr">"Tag"</span>: {
    <span class="hljs-attr">"multi_select"</span>: [
        {<span class="hljs-attr">"name"</span>: <span class="hljs-string">"Private"</span>,},
        {<span class="hljs-attr">"name"</span>: <span class="hljs-string">"Work"</span>, }
      ]
    }
  }
}
</code></pre>
<p>TickTick's Tag information is in the format <code>#{tagName}</code>. If there are multiple tags, they are written separated by half-width spaces. Due to this specification, <code>#{tagName}</code> cannot include <code>#</code> or half-width spaces. We will write a function to create <code>multi_select</code> values using this specification.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">genMultiSel</span>(<span class="hljs-params">multiSelStr</span>) {
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
</code></pre>
<p>The following is test code.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-title function_">test</span>(<span class="hljs-params"></span>) {
  <span class="hljs-keyword">var</span> ret = genMultiSel(<span class="hljs-string">"#test1 #test2"</span>)
  <span class="hljs-built_in">console</span>.<span class="hljs-built_in">log</span>(ret)
  <span class="hljs-comment">// [ { name: 'test1' }, { name: 'test2' } ]</span>
}
</code></pre>
<h3 id="hbf41954a8e">Generating the Body (JSON)</h3>
<p>Create JSON for POSTing to Notion.</p>
<pre><code class="language-jsx hljs">function <span class="hljs-built_in">_addDate</span>(params, dateStrings, key, value) {
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
</code></pre>
<p>Specify the database using DatabaseID as the destination for data insertion. Set <code>properties</code> according to the database type. For MultiSelect, add values later based on the presence of tags. This completes the conversion process from TickTick to Notion.</p>
<h3 id="h2daff9da5f">Deploy doPost</h3>
<p>Reflect the above processing in doPost.</p>
<pre><code class="language-jsx hljs"><span class="hljs-keyword">function</span> <span class="hljs-keyword">do</span><span class="hljs-constructor">Post(<span class="hljs-params">e</span>)</span> {
  <span class="hljs-comment">// Init</span>
  var props = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">PropertiesService</span>.</span></span>get<span class="hljs-constructor">ScriptProperties()</span>;
  const notion = <span class="hljs-keyword">new</span> <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Notion</span>.</span></span>client(props.get<span class="hljs-constructor">Property(<span class="hljs-string">"NOTION_TOKEN"</span>)</span>);
  var jsonString = e.postData.get<span class="hljs-constructor">DataAsString()</span>;
  var data = <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">JSON</span>.</span></span>parse(jsonString);

  <span class="hljs-comment">// Generate a Parameter</span>
  const params = gen<span class="hljs-constructor">Params(<span class="hljs-params">data</span>, <span class="hljs-string">"cf0bc59e33734173838e0370c210fa3d"</span>)</span>

  <span class="hljs-comment">// Create a record</span>
  var ret = notion.pages.create(params)
  <span class="hljs-keyword">if</span> (ret<span class="hljs-literal">["<span class="hljs-identifier">status"</span>]</span> &gt;= <span class="hljs-number">300</span><span class="hljs-operator"> &amp;&amp; </span>ret<span class="hljs-literal">["<span class="hljs-identifier">status"</span>]</span> &lt; <span class="hljs-number">200</span> ) {
    const options = {name: <span class="hljs-string">"IFTTT Webhooks Error"</span>};
    <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">GmailApp</span>.</span></span>send<span class="hljs-constructor">Email(<span class="hljs-string">"yourAlias@gmail.com"</span>, <span class="hljs-string">"webhookTest"</span>, JSON.<span class="hljs-params">stringify</span>(<span class="hljs-params">ret</span>)</span>, options);
  }
}
</code></pre>
<p>Perform the deployment again to reflect the changes. After deployment, a new URL will be issued, so use that URL to confirm if records are added to the Notion database. If there are error emails or messages, debug according to the message.</p>
<h2 id="h8088f2eceb">IFTTT Settings</h2>
<p>Finally, set IFTTT to call the GAS API. For the Trigger, select TickTick's <code>New completed task</code>. In New completed task, you can select the target List, Tag, or Priority. Since Notion's database allows for aggregation and filtering, set it as follows to stock all tasks.</p>
<table><tbody><tr><th colspan="1" rowspan="1"><p>Item</p></th><th colspan="1" rowspan="1"><p>Value</p></th></tr><tr><td colspan="1" rowspan="1"><p>List</p></td><td colspan="1" rowspan="1"><p>All Lists</p></td></tr><tr><td colspan="1" rowspan="1"><p>Tag</p></td><td colspan="1" rowspan="1"><p>Please Select(Default)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Priority</p></td><td colspan="1" rowspan="1"><p>Please Select(Default)</p></td></tr></tbody></table>
<p>Click [Create trigger]. For Then That, select Webhook and set as follows.</p>
<table><tbody><tr><th colspan="1" rowspan="1"><p>Item</p></th><th colspan="1" rowspan="1"><p>Value</p></th></tr><tr><td colspan="1" rowspan="1"><p>URL</p></td><td colspan="1" rowspan="1"><p>Deployed GAS API URL</p></td></tr><tr><td colspan="1" rowspan="1"><p>Method</p></td><td colspan="1" rowspan="1"><p>POST</p></td></tr><tr><td colspan="1" rowspan="1"><p>Content Type</p></td><td colspan="1" rowspan="1"><p>application/json</p></td></tr><tr><td colspan="1" rowspan="1"><p>Body</p></td><td colspan="1" rowspan="1"><p>See below</p></td></tr></tbody></table>
<p><strong>[Body]</strong></p>
<pre><code class="language-json hljs">{
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
}
</code></pre>
<p>Click [Create action].</p>
<h2 id="h3c7222fefe">Operation Confirmation</h2>
<p>Create a task in TickTick and set it to completed. If the completed task is registered in Notion, it is operating normally. Note that there may be a lag of a few minutes until the event fires in IFTTT, so check the operation status via IFTTT's "View activity", error emails, or the Notion database.</p>
<h2 id="ha214098e44">Summary</h2>
<p>We have now made it possible to call the Notion API from GAS or IFTTT. This allows for more flexible data stocking using time triggers or event triggers with Notion. It can be widely used for tasks, habits, health management, analysis, etc., so feel free to adapt it to your own purposes.</p>