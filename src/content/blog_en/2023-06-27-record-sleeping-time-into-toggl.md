---
title: "[Python] Automatically Record Sleep Time to Toggl"
slug: "record-sleeping-time-into-toggl"
description: ""
date: 2023-06-27T16:59:36.201Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/garmin_toggl.webp"
draft: false
tags: ['Python', 'toggl', 'API']
categories: ['Programming']
---

<p>Create a program using Python to automatically write sleep time to Toggl.</p>
<h2 id="h9707d3a59a">Overview</h2>
<p>To squeeze out free time or relaxation, I use several task management tools. As my main tool, I use TickTick to track completed tasks. However, I noticed it's hard to see how much time I spent on each one.<br>In terms of input visibility, Toggl allows me to easily measure time like a stopwatch and quickly record the work done. It also has an API for automatically accumulating data. Additionally, with its CSV export function, I can easily store and analyze data.<br>As a starting point, I'll write a process to automatically register sleep time from my smartwatch to Toggl and gradually get familiar with the API.</p>
<h2 id="h18a86fe6b9">Input Data</h2>
<p>I use Garmin's Venu 2 as my smartwatch.</p>
<p>Garmin does not have an official API, but there is a <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">library that can access the API</a>. I'll use this to obtain sleep logs and convert the data for the Toggl API. Although I'm using a Garmin watch this time, Fitbit has an <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">official API</a> as well.</p>
<p>Since it's a third-party product, the returns from the API will differ, but I can still obtain sleep records. As long as I can get the data, other watches should work fine for recording sleep time.</p>
<p>Additionally, by modifying the data, I can input various things beyond sleep, such as exercise time from other APIs, or record human activities, or even use it for non-human time tracking purposes, which could be interesting.</p>
<h2 id="h30fa20b7e1">Coding</h2>
<p>The repository for the code I wrote is at the following URL:<br><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">https://github.com/rmc8/Tool-for-transcribing-sleep-records-to-toggl</a></p>
<h3 id="h9e5ec7394d">Main</h3>
<p>The main processing is written in <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">main.py</a>. It pulls settings from a YAML file or command line and executes the program.</p>
<p>The command line is structured as follows.</p>
<pre><code class="language-shell hljs">python main.py {number of days to go back}
</code></pre>
<p>If you input <code>1</code> for the number of days to go back via the command line, it will try to retrieve sleep records from the previous day up to the day of program execution. If you input <code>30</code>, it will retrieve records from 30 days prior. If you omit the argument, it will only try to get data for the current day. It's a bit inconvenient not being able to specify dates, but I've simplified it since I want to set it up for automatic registration with a task scheduler.</p>
<p>The YAML file is as follows.</p>
<pre><code class="language-yaml hljs">time_zone: 9  
toggl:  
  token: # Required  
  time_entry:  
  workspace_id:  
  project_id:  
  task_id:  
  billable: False # Not required  
  tags:  
  - 睡眠  
garmin:  
  email: # Required  
  password: # Required
</code></pre>
<p>YAML loading is implemented in util.py using PyYAML, a convenient library for reading YAML files into dictionary format. All contents of this configuration file are values to be passed to the API. The time_zone is the offset from UTC. The rest will be explained later.</p>
<p>After that, it retrieves sleep time from the Garmin API, converts the data for Toggl, and registers the sleep time to Toggl via the API. Finally, it outputs the response from the Toggl API as a CSV file in the <code>./output</code> directory.</p>
<h3 id="h191d0c9280">Garmin API</h3>
<p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">https://github.com/rmc8/Tool-for-transcribing-sleep-records-to-toggl/blob/main/pkg/garmin.py</a></p>
<p>Data acquisition from Garmin uses the unofficial <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">library</a> as mentioned earlier. Therefore, there are no clues for data acquisition other than the repository's README, source code, and developer tools analysis. While reading the source code reveals endpoints and POST contents, I'll omit that here.</p>
<h4 id="h13055cb0bb">API Connection</h4>
<pre><code class="language-python hljs">class GarminAPI:  
 def __init__(self, email: str, password: str, time_deff: int = 9):  
  self.client = Garmin(email, password)  
  self.client.login()  
  self.time_deff: int = time_deff
</code></pre>
<p>The GarminAPI class connects to the API upon initialization. Authentication uses the same user information as Garmin Connect. Enter the email address and password in <code>config.yml</code>. Since returns from the Garmin API are in UTC (GMT), I added <code>time_deff</code> for time difference adjustment.</p>
<h4 id="hd23087fde4">Sleep Log Acquisition</h4>
<p>Use the <code>get_sleep_logs</code> method to retrieve sleep information in bulk. Although encapsulated, the <code>get_sleep_data</code> method from the garminconnect library quickly obtains a JSON including sleep time.<br>The <code>dailySleepDTO</code> value in that JSON contains bedtime and wake-up time in epoch seconds (GMT). The following processes convert these to Python's datetime format and adjust for the time difference.</p>
<pre><code class="language-python hljs">@staticmethod
def epoc2date(epoc: int, time_deff: int):
 dt = datetime.fromtimestamp(epoc / 1000)
 return dt + timedelta(hours=time_deff)

start = self.epoc2date(display["sleepStartTimestampGMT"], self.time_deff)
end = self.epoc2date(display["sleepEndTimestampGMT"], self.time_deff)
</code></pre>
<p>After that, the data is converted for Toggl. The dictionary contents are as follows.</p>
<table><tbody><tr><th colspan="1" rowspan="1"><p>Key</p></th><th colspan="1" rowspan="1"><p>Value</p></th><th colspan="1" rowspan="1"><p>Description</p></th></tr><tr><td colspan="1" rowspan="1"><p>date</p></td><td colspan="1" rowspan="1"><p>Date slept</p></td><td colspan="1" rowspan="1"><p>Not used, but for reference</p></td></tr><tr><td colspan="1" rowspan="1"><p>description</p></td><td colspan="1" rowspan="1"><p>Description</p></td><td colspan="1" rowspan="1"><p>Here, it describes when you went to sleep.<br>This can be considered as the title for now.</p></td></tr><tr><td colspan="1" rowspan="1"><p>start</p></td><td colspan="1" rowspan="1"><p>Start time</p></td><td colspan="1" rowspan="1"><p>This corresponds to bedtime.</p></td></tr><tr><td colspan="1" rowspan="1"><p>stop</p></td><td colspan="1" rowspan="1"><p>End time</p></td><td colspan="1" rowspan="1"><p>This corresponds to wake-up time.</p></td></tr><tr><td colspan="1" rowspan="1"><p>duration</p></td><td colspan="1" rowspan="1"><p>Duration</p></td><td colspan="1" rowspan="1"><p>Time elapsed in seconds.</p></td></tr></tbody></table>
<p><code>duration</code> is explained in a complicated way in Toggl's official documentation, but it's used for the display in the yellow-marked section in the figure below.</p>
<p><br></p>
<p></p>
<p>It mentions that negatives are possible, which is unclear, but using it effectively could allow subtracting time spent awake during sleep. The others aren't particularly tricky, so I'll omit them for now.</p>
<p>Once the data for all dates is compiled with sleep times, it's converted to a Pandas DataFrame and returned to <code>main.py</code>.</p>
<h3 id="hb8761e8974">Toggl API</h3>
<p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">https://github.com/rmc8/Tool-for-transcribing-sleep-records-to-toggl/blob/main/pkg/toggl.py</a></p>
<p>The Toggl API is summarized on <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">GitHub</a>. There's a Python client, but since I couldn't get it from PyPI and the usage wasn't clear without reading the source code, I wrote only the necessary processes based on the documentation.</p>
<p>Authentication for the API uses a token. It's located at the bottom of the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">Profile page</a>. Enter this in <code>config.yml</code> under <code>toggl &gt; token</code>. The other three IDs in <code>toggl &gt; time_entry</code> are for recording in specific locations. <code>billable</code> is basically False since sleep doesn't directly generate profit. Additionally, <code>tags</code> can be set as a list for multiple tags. For now, I've set just one: <code>- 睡眠</code>.</p>
<h4 id="he45ecfd0c2">Recording to Toggl</h4>
<p>Use the <code>create_time_entry</code> method to record sleep time to Toggl. It takes the required values as arguments and uses keyword arguments and unpacking for others as needed.<br><code>stop</code> isn't mandatory, but since duration can be tricky, including it ensures the end time is accurate.</p>
<p>Then, it generates a JSON payload based on the documentation and sends it via the <code>_request</code> method to register the sleep times in bulk through the API.</p>
<h3 id="h16ceed364c">Log Output</h3>
<p>Output the API results as a CSV file in the <code>./output</code> directory. A sample is as follows.</p>
<pre><code class="language-csv hljs">id,wid,billable,start,stop,duration,description,tags,duronly,at,uid
2xxxxxxxxx,5xxxxxxxx,False,2021-09-25T23:46:00.000+09:00,2021-09-26T06:56:00.000+09:00,25800,Sleep time on 2021-09-25,['睡眠'],False,2021-09-26T08:59:03+00:00,7xxxxxxxx</code></pre>
<h2 id="h6eac5e0dfa">Future Applications</h2>
<p>I was able to automatically register sleep time. Similarly, for anything that can be automatically registered using smartwatches or IoT, I want to proceed with automatic registration first.</p>
<p>For TickTick, I'm using GAS or IFTTT for integration, and manually registering important tasks to organize what to do. If I can get this via API and select the tasks being done to control the stopwatch (start/stop) and (complete/incomplete), managing input and output would become easier.</p>
<p>Additionally, for parts without API, the app's functions are very simple, so using them as-is would make task management and analysis much easier.</p>
<p>Besides just using the Toggl app normally, there's still a lot of coding needed, but by reusing what's available and integrating via API, and since it's cloud-based for information sharing across all devices, it's very convenient. For personal use, it's free and has more than enough features, so I'm grateful.</p>
<h2 id="ha214098e44">Summary</h2>
<p>Toggl is a great platform for managing and analyzing time. Although Japanese support is still limited, if you're not allergic to English, it's a highly useful and extensible tool. Please try combining it with various IoT devices or APIs for fun.</p>