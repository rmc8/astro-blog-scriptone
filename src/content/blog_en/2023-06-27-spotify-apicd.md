---
title: "Obtaining CD Jacket Images Using Spotify API"
slug: "spotify-apicd"
description: ""
date: 2023-06-27T16:44:52.580Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/tunebrowser.webp"
draft: false
tags: ['Python', 'JSON', 'API', 'Spotify']
categories: ['Programming']
---

<p>In Python, I will try to obtain CD jacket images using the Spotify API.</p>
<h2 id="h9707d3a59a">Overview</h2>
<p>Using the music directory managed on Windows 10, I create a Query for the Spotify API to obtain the URL of the CD jacket images. By obtaining the jacket images, they will be displayed in the player software. This is a time-consuming task if done manually, but I will automate most of it.</p>
<p>Repository: <a href="https://github.com/rmc8/cd_jacket_scraper_for_spotify">https://github.com/rmc8/cd_jacket_scraper_for_spotify</a></p>
<h2 id="h255e3e779e">Preparation for Using the API</h2>
<p>Here, I will obtain the keys for using the API and install the Python libraries.</p>
<h3 id="he3e7f8020b">Obtaining the API Key</h3>
<p>Log in to the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Developer page</a>. You can log in with your Spotify account. If you don't have an account, create a Spotify account.</p>
<p>Once logged in, click [CREATE AN APP].<br>For "App name", enter a recognizable name like "CD Jacket scraper", and for "App description", enter a clear description like "Get the CD jacket". Then, check the two checkboxes. Checking them means you agree to the Permissions and Guidelines. Confirm that the input is correct and click the [CREATE] button.</p>
<p>After clicking, the app will be created, and the dashboard will be displayed. On the dashboard, click [SHOW CLIENT SECRET] to register the Client ID and Client Secret in the Windows environment variables.</p>
<p>[FYI] <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Setting environment variables</a></p>
<p>For the Client ID, set the variable name to "SPOTIFY_CLIENT_ID" and paste the value displayed on the dashboard as the variable value. Similarly, for the Client Secret, set the variable name to "SPOTIFY_SECRET_ID" and paste the dashboard value as the variable value. After registering the variables, <strong>restart your PC</strong> to make them usable.</p>
<h3 id="h0f9c9e996f">Installing Python Libraries</h3>
<p>Please install the following libraries using pip or similar.</p>
<ul>
<li>spotipy</li>
<li>requests</li>
<li>PySimpleGUI</li>
</ul>
<pre><code class=