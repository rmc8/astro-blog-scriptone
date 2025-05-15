---
title: Obtain CD Jacket Images Using Spotify API
slug: spotify-apicd
description: ""
date: 2023-06-27T16:44:52.580Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/tunebrowser.webp
draft: false
tags: ['Python', 'JSON', 'API', 'Spotify']
categories: ['Programming']
---

# Obtain CD Jacket Images Using Spotify API

<p>Try to obtain CD jacket images using Python and the Spotify API.</p>
<h2 id="h9707d3a59a">Overview</h2>
<p>Use the music directory managed on Windows 10 to create a Spotify API query and obtain the URL for the CD jacket images. By obtaining the jacket images, they will be displayed in the player software. This is a time-consuming task if done manually, but we will automate most of it.</p>
<p>Repository: <a href="https://github.com/rmc8/cd_jacket_scraper_for_spotify">https://github.com/rmc8/cd_jacket_scraper_for_spotify</a></p>
<h2 id="h255e3e779e">Preparation for Using the API</h2>
<p>Here, we will obtain the keys for using the API and install the Python libraries.</p>
<h3 id="he3e7f8020b">Obtaining the API Key</h3>
<p>Log in to the <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Developer page</a>. You can log in with your Spotify account. If you don't have an account, create one for Spotify.</p>
<p>Once logged in, click [CREATE AN APP]. For "App name", enter a recognizable name like "CD Jacket scraper". For "App description", enter a clear description like "Get the CD jacket". Then, check the two checkboxes, which means you agree to the Permissions and Guidelines. Confirm your input is correct and click the [CREATE] button.</p>
<p>After clicking, the app will be created and the dashboard will be displayed. On the dashboard, click [SHOW CLIENT SECRET] to register the Client ID and Client Secret in your Windows environment variables.</p>
<p>[FYI] <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Setting environment variables</a></p>
<p>For Client ID, set the variable name to "SPOTIFY_CLIENT_ID" and paste the value displayed on the dashboard. Similarly, for Client Secret, set the variable name to "SPOTIFY_SECRET_ID" and paste the value from the dashboard. After registering the variables, <strong>restart your PC</strong> to make them usable.</p>
<h3 id="h0f9c9e996f">Install Python Libraries</h3>
<p>Please install the following libraries using pip.</p>
<ul>
<li>spotipy</li>
<li>requests</li>
<li>PySimpleGUI</li>
</ul>
<pre><code class=