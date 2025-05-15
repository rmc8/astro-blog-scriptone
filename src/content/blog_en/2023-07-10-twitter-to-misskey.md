---
title: "[IFTTT] Automatically Post from Twitter to Misskey"
slug: twitter-to-misskey
description: This article describes how to use IFTTT's paid plan to automatically post the content of a Tweet from Twitter to Misskey as a note.
date: 2023-07-10T13:32:56.828Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/twiToMisskeyEyecatch.webp
draft: false
tags: ['GoogleAppsScript', 'Misskey', 'Twitter', 'IFTTT']
categories: ['Programming']
---

# [IFTTT] Automatically Post from Twitter to Misskey

I started using Misskey after the Twitter API restrictions incident. Although Misskey is personally developed and operated, it has a more approachable atmosphere than Threads, and I've come to appreciate it as a fun platform, especially for programming-related aspects. However, since no one around me has switched to Misskey, I'm mostly posting notes alone, which can feel a bit lonely. To address this, I decided to continue posting casually on Twitter while also mirroring relevant Tweet content to Misskey as notes for parallel operation. To avoid indiscriminately auto-posting, which could result in unrelated content on Misskey, I'll implement measures to filter it. While copy-paste methods are possible, this article includes programming with JavaScript.

## Preparation

* IFTTT Pro+ (a paid plan)
* Google account
* X (Twitter) account
* Account on any server running Misskey

## Procedure

The general procedure involves publishing an API using Google Apps Script to automatically post to Misskey. When a Tweet is posted from your own Twitter account, IFTTT will send the Tweet via Webhook to that API, which then forwards the data to the Misskey API. Once the data is received on the Misskey server, the Tweet content will be posted as a note on your Misskey account. I'll detail the steps one by one below.

### Write the API Processing in Google Apps Script

First, here's a simple outline of the steps:

* Access the [Google Apps Script homepage](https://script.google.com)
* Click "New Project"
* Change "Untitled project" to a recognizable name like "twitterToMisskey"
* Rename "Code.gs" to something like "main.gs"
* From the left menu, click the + button under Files and select "Script"
* A new script will be generated; type "local" and press Enter
* Follow the code below to write the script

In main.gs, you'll write code to receive posts from IFTTT (e.g., Twitter posts) and post the Tweet content as a note on Misskey.

```
function doPost(e) {
  const jsonString = e.postData.getDataAsString();
  const data = JSON.parse(jsonString);
  const tweet = data.tweet;
  const iftttSec = data.secret;
  if (checkHashtags(tweet) || SECRET !== iftttSec) {
    return JSON.stringify({});
  }
  const res = postToMisskey(tweet);
  return JSON.stringify(res);
}

function checkHashtags(tweet) {
  // Add processing to skip noting to Misskey if the tweet contains words listed in hashtags
  const hashtags = ["#プロセカ協力", "#プロセカ募集"];
  for (let i = 0; i < hashtags.length; i++) {
    if (tweet.includes(hashtags[i])) {
      return true;
    }
  }
  return false;
}

function postToMisskey(noteText) {
  // For non-official servers, replace with your server's host name
  const host = "misskey.io";
  const ENDPOINT = `https://${host}/api/notes/create`;
  let options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      localOnly: false,
      noExtractMentions: false,
      noExtractHashtags: false,
      noExtractEmojis: false,
      text: noteText,
      i: MISSKEY_TOKEN
    })
  };
  let response = UrlFetchApp.fetch(ENDPOINT, options);
  return response.getContentText();
}
```

Next, obtain the token for accessing the Misskey API. Access Misskey, go to Settings > API, and click "Issue Access Token".

When the access token issuance screen appears, enable the permission for "Create and delete notes" and click the checkmark in the top right. Copy the displayed token, then return to Google Apps Script.

Paste the copied token into local.gs as follows:

```
const MISSKEY_TOKEN = "Paste the copied token here";
const SECRET = "An arbitrary string"; // Use the same string in IFTTT as a password substitute
```

### Publish the API

Click "Deploy" in the top right of the screen and select "New deployment".

* Under "Select type", choose "Web app"
* Enter a recognizable description like "iftttToMisskey"
* For "Execute as", select "Me"
* For "Who has access", select "Anyone"
* Click "Deploy"

Once deployment is complete, click the copy icon next to the web app URL. You'll use this URL in IFTTT.

## IFTTT Settings

In IFTTT, set up a process to detect Tweets from your own account and send the data to the deployed API.

### Detection Settings

* Access IFTTT and click "Add"
* In "Search Service", enter "Twitter"
* From the search results, click "Twitter"
* Click "New tweet by you"
* Fill in the form:
  * Select your Twitter account under "Twitter account"
    * If not connected, follow the prompts to log in and authorize
  * Leave "Include" unchecked normally
    * Checking it will also post Retweets or replies to Misskey
* Click "Create trigger"

### Send Data to the API

* Click "Add" under "Then That"
* In "Search Service", enter "Webhooks"
* From the search results, click "Webhooks"
* Click "Make a web request"
* Paste the URL copied from Google Apps Script into "URL"
* Change "Method" to "POST"
* Set "Content Type" to "application/json"
* Set "Body" to '{"tweet": "{{text}}", "secret": "Paste the SECRET value from local.gs here"}'
* Click "Create action"

### Save the Recipe

* Click "Continue"
* Enter a recognizable name in "Applet Title", like "When @rmc_km makes a new tweet, note it to @<rmc8@misskey.io>"
* Click "Finish"

### Summary

* <https://misskey.io/notes/9h0f5igbtl>

Once you've completed these steps, the setup is done. Now, post a Tweet from your configured Twitter account, and if the content appears as a note on your Misskey account, it's successful. This article explains how to use IFTTT to send Tweets to Google Apps Script and automatically post them as notes on Misskey. With IFTTT Pro, you can reuse settings for multiple Twitter accounts to post to Misskey, making it easy to operate in parallel even if users haven't migrated there yet. Even if your followers on Twitter don't switch to Misskey or similar platforms, this allows for seamless parallel use, potentially fostering new connections alongside existing ones. However, since it's automated, be mindful of filtering unnecessary posts and preventing Retweets or replies from being reposted. By using it effectively, you can stay attentive to Twitter trends while creating a smooth transition environment. We hope you find this useful.