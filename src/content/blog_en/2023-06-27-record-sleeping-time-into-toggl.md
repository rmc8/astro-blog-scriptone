---
title: "[Python] Automatically Record Sleep Time to Toggl"
slug: record-sleeping-time-into-toggl
description: ""
date: 2023-06-27T16:59:36.201Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/garmin_toggl.webp
draft: false
tags: ['Python', 'toggl', 'API']
categories: ['Programming']
---

# [Python] Automatically Record Sleep Time to Toggl

<p>Using Python, we will create a program to automatically export sleep time to toggl.</p>
<h2 id="h9707d3a59a">Overview</h2>
<p>To squeeze out free time or relaxation time, I use several task management tools as my main tools. I use TickTick and others to track the content of completed tasks. However, I noticed that it's hard to see how much time I spent on each one in terms of input volume.<br>On the point where input is hard to see, with the tool called toggl, I can easily measure time like a stopwatch and quickly record the work I did. It also has an API, so I can automatically accumulate data. Additionally, it has a CSV export function, making it easy to accumulate and analyze data.<br>As a starting point, I will write a process to automatically register the sleep time accumulated in my smartwatch to toggl and gradually get used to the API.</p>
<h2 id="h18a86fe6b9">Input Data</h2>
<p>I use Garmin's Venu 2 as the smartwatch.</p>
<p>Garmin does not have an official API, but there is a <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">library that can access the API</a>. Using this, I obtain the sleep log and convert the data for the toggl API. Although I'm using Garmin's watch this time, Fitbit has an <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">official API</a> as well.</p>
<p>Since it's a third-party product, the returns from the API differ, but I can obtain sleep records. Regarding sleep time records, as long as I can get the data, other watches should work fine too.</p>
<p>Additionally, by changing the data, I can input various things beyond just sleep, so it might be interesting to record human activities like exercise time from other APIs, or even use it for purposes that record time not limited to people.</p>
<h2 id="h30fa20b7e1">Coding</h2>
<p>The repository for the code I wrote is at the following URL.<br><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">https://github.com/rmc8/Tool-for-transcribing-sleep-records-to-toggl</a></p>
<h3 id="h9e5ec7394d">Main</h3>
<p>The main processing is written in <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">main.py</a>. It pulls settings from a YAML file or command line and executes the program.</p>
<p>The command line is structured as follows.</p>
<pre><code class="language-shell hljs">python main.py {number of days to go back}
</code></pre>
<p>If you input <code>1</code> as the number of days to go back on the command line, it will try to retrieve sleep records for the range from the day before the program execution date. If you input <code>30</code>, it will try to retrieve records for the range up to 30 days before. If you omit the argument, it will only try to get the data for the current day. It's a bit inconvenient not to be able to specify the number of days, but I've simplified it a lot since I want to set it up for automatic registration with a task scheduler.</p>
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
<p>Loading the YAML is implemented in util.py using PyYAML. It's a convenient library that can read YAML files into a dictionary format. All the contents of this configuration file are values to be passed to the API. time_zone is the time difference from UTC. The rest will be explained later.</p>
<p>After that, it retrieves the sleep time from the Garmin API, converts the data for toggl, and registers the sleep time to toggl via the API. Finally, it outputs the response from the toggl API as a CSV file in the <code>./output</code> directory.</p>
<h3 id="h191d0c9280">Garmin API</h3>
<p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">https://github.com/rmc8/Tool-for-transcribing-sleep-records-to-toggl/blob/main/pkg/garmin.py</a></p>
<p>Data acquisition from Garmin uses the unofficial <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">library</a> as mentioned earlier. Therefore, there are no leads for data acquisition other than the repository's README, source code, and developer tools analysis. While reading the source code reveals endpoints and POST contents, I'll omit that for now.</p>
<h4 id="h13055cb0bb">API Connection</h4>
<pre><code class="language-python hljs">class GarminAPI:  
 def __init__(self, email: str, password: str, time_deff: int = 9):  
  self.client = Garmin(email, password)  
  self.client.login()  
  self.time_deff: int = time_deff
</code></pre>
<p>It connects to the API when calling the GarminAPI class. Authentication uses the same user information as Garmin Connect. Enter the email address and password in <code>config.yml</code>. Since the returns from the Garmin API are in UTC (GMT), I added <code>time_deff</code> for time difference adjustment.</p>
<h4 id="hd23087fde4">Sleep Log Acquisition</h4>
<p>Use the <code>get_sleep_logs</code> method to obtain sleep information in bulk. It's encapsulated, but using the <code>get_sleep_data</code> method from the garminconnect library quickly gets JSON including sleep time.<br>The value of <code>dailySleepDTO</code> in that JSON stores the bedtime and wake-up time in epoch seconds (GMT) format. The following processes convert these to Python's datetime format and adjust for the time difference.</p>
<pre><code class="language-python hljs">@staticmethod
def epoc2date(epoc: int, time_deff: int):
 dt = datetime.fromtimestamp(epoc / 1000)
 return dt + timedelta(hours=time_deff)

start = self.epoc2date(display["sleepStartTimestampGMT"], self.time_deff)
end = self.epoc2date(display["sleepEndTimestampGMT"], self.time_deff)
</code></pre>
<p>After that, it converts the data for toggl. The dictionary contents are as follows.</p>
<table><tbody><tr><th colspan="1" rowspan="1"><p>Key</p></th><th colspan="1" rowspan="1"><p>Value</p></th><th colspan="1" rowspan="1"><p>Description</p></th></tr><tr><td colspan="1" rowspan="1"><p>date</p></td><td colspan="1" rowspan="1"><p>Date slept</p></td><td colspan="1" rowspan="1"><p>Not used, just for reference</p></td></tr><tr><td colspan="1" rowspan="1"><p>description</p></td><td colspan="1" rowspan="1"><p>Description</p></td><td colspan="1" rowspan="1"><p>Here, it writes a description of when you went to sleep.<br>You can think of it as the Title for this case.</p></td></tr><tr><td colspan="1" rowspan="1"><p>start</p></td><td colspan="1" rowspan="1"><p>Start time</p></td><td colspan="1" rowspan="1"><p>This corresponds to bedtime here.</p></td></tr><tr><td colspan="1" rowspan="1"><p>stop</p></td><td colspan="1" rowspan="1"><p>End time</p></td><td colspan="1" rowspan="1"><p>This corresponds to wake-up time here.</p></td></tr><tr><td colspan="1" rowspan="1"><p>duration</p></td><td colspan="1" rowspan="1"><p>Elapsed time</p></td><td colspan="1" rowspan="1"><p>Write the elapsed time in seconds.</p></td></tr></tbody></table>
<p><code>duration</code> is explained in a somewhat complicated way in toggl's official documentation, but it's used for the display in the yellow-marked section in the figure below.</p>
<p><br></p>
<p></p>
<p>It mentions that negatives are possible and other unclear things, but by using this effectively, you could subtract time spent awake during sleep and input it. The rest aren't particularly tricky, so I'll omit them for now.</p>
<p>Once the data for all dates going back is compiled with sleep times, etc., it converts to a Pandas DataFrame format and returns it to <code>main.py</code>.</p>
<h3 id="hb8761e8974">toggl API</h3>
<p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">https://github.com/rmc8/Tool-for-transcribing-sleep-records-to-toggl/blob/main/pkg/toggl.py</a></p>
<p>The toggl API is summarized on <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">GitHub</a>. There seems to be a Python client, but since I couldn't get it from PyPI and the usage wasn't clear without reading the source code, I wrote only the necessary processing based on the documentation.</p>
<p>Authentication for the API uses a token. The token is located at the bottom of the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/5316291686161534869?hl=ja#">Profile page</a>. Enter this in <code>config.yml</code> under <code>toggl &gt; token</code>. The other three IDs in <code>toggl &gt; time_entry</code> are for recording in specific locations. <code>billable</code> is basically False since sleep doesn't directly generate profit. Additionally, <code>tags</code> can be set as a list for multiple tags. For now, I've set just one tag as <code>- 睡眠</code>.</p>
<h4 id="he45ecfd0c2">Recording to toggl</h4>
<p>Use the <code>create_time_entry</code> method to record sleep time to toggl. It takes the required values as arguments and uses keyword arguments and unpacking to add others as needed.<br><code>stop</code> is not mandatory, but since the duration part is tricky and the end time can shift without it, I included it to specify the time explicitly.</p>
<p>After that, it generates a JSON Payload-like structure according to the documentation and throws it to the <code>_request</code> method to register the sleep times in bulk via the API.</p>
<h3 id="h16ceed364c">Log Output</h3>
<p>It outputs the API results as a CSV file in the <code>./output</code> directory. A sample is as follows.</p>
<pre><code class="language-csv hljs">id,wid,billable,start,stop,duration,description,tags,duronly,at,uid
2xxxxxxxxx,5xxxxxxxx,False,2021-09-25T23:46:00.000+09:00,2021-09-26T06:56:00.000+09:00,25800,Sleep time on 2021-09-25,['睡眠'],False,2021-09-26T08:59:03+00:00,7xxxxxxxx</code></pre>
<h2 id="h6eac5e0dfa">Future Applications</h2>
<p>I was able to automatically register sleep time. Similarly, for things that can be automatically registered using smartwatches or IoT, I want to proceed with automatic registration first.</p>
<p>For TickTick, I'm summarizing tasks by linking with GAS or IFTTT, and manually registering important tasks. If I can obtain this via API and select the tasks I'm doing to control the stopwatch (start/stop) and (complete/incomplete), it would make managing input and output easier.</p>
<p>Additionally, for parts where API isn't available, the app's functions are very simple, so using them as is would make task management and analysis much easier.</p>
<p>Besides just using the toggl app normally, there's still a lot of coding needed, but by reusing what's available and integrating via API, and since it's cloud-based, information can be shared across all devices. For personal use, it's free and has more than enough features, so it's very helpful.</p>
<h2 id="ha214098e44">Summary</h2>
<p>toggl is a great platform for managing and analyzing time. Although Japanese support is still limited, if you're not allergic to English, it's a very useful and highly extensible tool. Please try combining it with various IoT devices or APIs and have fun with it.

