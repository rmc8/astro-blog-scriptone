---
title: "Using IFTTT to Automatically Post from Twitter to Bluesky"
slug: "twitter-to-bluesky"
description: "This article describes how to post from Twitter to Bluesky using IFTTT and Google Apps Script. You can leverage multiple SNS platforms in parallel for migration, interaction, and more."
date: 2023-07-15T12:17:45.842Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/twiToBsky.webp"
draft: false
tags: ['Bluesky', 'Twitter', 'IFTTT', 'GoogleAppsScript']
categories: ['Programming']
---

Following the previous article ([/twitter-to-misskey](/twitter-to-misskey)), I obtained a [Bluesky account](https://bsky.app/profile/k.rmc-8.com) and started using it. There are fewer Japanese users compared to Misskey, but it's a relaxed space where Japanese users connect, and there are many developers who respond actively, making it surprisingly enjoyable. It's reminiscent of the pre-Japanese support era, like Twitter before the earthquake, which I quite like. However, since there are people I can only interact with on Twitter, I couldn't switch over completely. So, I set up a process to post from Twitter to Bluesky using IFTTT and Google Apps Script, allowing me to enjoy timelines across Twitter, Misskey, and Bluesky in parallel. While you can handle this with copy-paste, similar to last time, this article includes JavaScript programming.

## Preparation
* IFTTT Pro (a paid plan)
* Google account
* X (Twitter) account

## Procedure

The general procedure involves publishing an API with Google Apps Script to automatically post to your Bluesky account. When you post a tweet from your Twitter account, IFTTT sends the tweet via Webhook to that API, which then sends the data to the Bluesky API. Once Bluesky receives the data, it posts the tweet content to your owned Bluesky account. I'll detail the steps one by one below.

### Obtain App Password
Go to [Bluesky settings](https://bsky.app/settings) and click on App Passwords. Click [Add App Password], give it a name, and then click [Create App Password] to generate the app password.

![app pass](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/twiToBluesky/apppass2.webp)

Store the generated app password in a safe place like a notepad.

### Write the API Processing in Google Apps Script

* Access the [Google Apps Script homepage](https://script.google.com/)
* Click [New Project]
* Change "Untitled project" to a recognizable name like "twitterToBluesky"
* Change "Code.gs" to a recognizable name like "main.gs"
* From the left menu, click the + button under Files and select Script
* A new script will be generated; type "local" and press Enter
* Write the code as follows

In local.gs, set the configuration variables:

```js
const HOST = "bsky.social";
const EMAIL = "Email address for login";
const APP_PASS = "Paste your App password here";
const SECRET = "HOGE"; // Enter any string for authentication on the IFTTT side
```


In main.gs, write the code to receive posts from IFTTT and post the tweet content to Bluesky:

```js
function doPost(e) {
  const data = parseJsonData(e);
  if (!isValidRequest(data.secret)) {
      return JSON.stringify({ error: "Invalid secret." });
  }
  const loadedData = createSession();
  const params = createPostParams(loadedData, data);
  const result = postRecord(params);
  console.info("Success!");
  return JSON.parse(result.getContentText());
}

function parseJsonData(e) {
    const jsonString = e.postData.getDataAsString();
    return JSON.parse(jsonString);
}

function isValidRequest(secret) {
    return SECRET === secret;
}

function removeURL(str) {
    return str.replace(/(https?:\/\/[^\s]+)/g, '');
}

function truncateString(str) {
    if (str.length > 75) {
        return str.substring(0, 75) + '...';
    }
    return str;
}

function getEndpoint(path) {
    const baseUrl = `https://${HOST}`
    if (!path.startsWith("/")) {
        path = `/${path}`;
    }
    return `${baseUrl}/xrpc${path}`
}

function createSession() {
    const url = getEndpoint("/com.atproto.server.createSession");
    const payload = {
        identifier: EMAIL,
        password: APP_PASS,
    };
    const options = {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      payload: JSON.stringify(payload),
    };
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
}

function createPostParams(loadedData, data) {
    const originalTweet = data.tweet;
    const rmUrlTweet = removeURL(originalTweet);
    const userName = data.userName;
    const uri = data.uri;
    const embed = {
      $type: "app.bsky.embed.external",
      external: {
        uri: uri,
        title: `Tweet by @${userName}`,
        description: truncateString(rmUrlTweet)
      }
    }
    return {
        method: "post",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Authorization":`Bearer ${loadedData.accessJwt}`
        },
        payload: JSON.stringify({
            repo: loadedData.did,
            collection: "app.bsky.feed.post",
            record: {
                text: rmUrlTweet,
                createdAt: new Date().toISOString(),
                langs: ["ja", "en"],
                $type: "app.bsky.feed.post",
                embed: embed
            }
        }),
    };
}

function postRecord(params) {
    const url = getEndpoint("/com.atproto.repo.createRecord");
    return UrlFetchApp.fetch(url, params);
}
```

## Publish the API

Click [Deploy] in the top right of the screen and select [New deployment].

![publish](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/gas.webp)

* Select "Web app" from the type options
* Write a recognizable description like "iftttToMisskey"
* For "Execute as," select "Me"
* For "Who has access," select "Anyone"
* Click [Deploy]

![deploy](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/deploy.webp)

Once deployment is complete, click the copy icon next to the web app URL. You'll use this copied URL in IFTTT.

## IFTTT Settings

In IFTTT, set up to detect tweets from your own account and send data to the deployed API.

### Detection Settings
* Access IFTTT and click [Add]
* In Search Service, enter "Twitter"
* From the search results, click Twitter
* Click [New tweet by you]
* Fill in the form:
  * Select your Twitter account for Twitter account detection
    * If not connected, follow the prompts to log in and authenticate
  * Uncheck Include normally
    * Checking it will also post Retweets and replies to Bluesky
    * Click [Create trigger]

### Send Data to the API
![make a webhook](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/fin.webp)

* Click [Add] in Then That
* In Search Service, enter "Webhooks"
* From the search results, click Webhooks
* Click [Make a web request]
* Paste the URL you copied from Google Apps Script into URL
* Change Method to POST
* Set Content Type to application/json
* Set Body to "{'tweet': '{{text}}', 'secret': 'Paste the SECRET value from local.gs here'}"
* Click [Create action]
* Click [Continue]
* In Applet Title, enter a recognizable name like "When @rmc_km makes a new tweet, note it to @<k.bsky.app>"

Click [Finish]

## Verification

Once you've completed the steps above, the setup is done. Now, post a tweet from the configured Twitter account, and if the content appears as a post on your Bluesky account, it's successful. However, on Bluesky, embeds and decorations are required, and URLs or images will appear as plain text, resulting in a simple appearance. To improve this, you could add processing like scraping to fetch necessary data and include embeds in the payload via HTTP POST.

Bluesky sample: <https://bsky.app/profile/k.rmc-8.com/post/3k2keq2kus72w>

## Summary

This article explained how to send tweets to Google Apps Script using IFTTT and automatically post them to Bluesky. With IFTTT Pro, you can reuse settings for multiple Twitter accounts and post to Bluesky, allowing parallel use even if users haven't migrated. Even if your followers haven't moved to Bluesky, this enables easy parallel operation and may create opportunities for new interactions alongside existing ones. However, since it's automated, you should consider filtering unnecessary posts and ensuring Retweets or Replies aren't reposted. By using it effectively, you can monitor Twitter trends while creating a smooth migration environment. We hope you find this useful.