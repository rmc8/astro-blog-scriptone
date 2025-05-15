---
title: 【IFTTT】Twitter에서 Bluesky로 자동 게시하기
slug: twitter-to-bluesky
description: IFTTT와 Google Apps Script을 사용하여 Twitter에서 Bluesky에 게시하는 방법을 설명합니다. 여러 SNS를 병행하여 활용하면서 이전하거나 교류할 수 있습니다.
date: 2023-07-15T12:17:45.842Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/twiToBsky.webp
draft: false
tags: ['Bluesky', 'Twitter', 'IFTTT', 'GoogleAppsScript']
categories: ['Programming']
---

# 【IFTTT】Twitter에서 Bluesky로 자동 게시하기

[전回の 기사](/twitter-to-misskey)에서 소개한 Misskey에 이어, [Bluesky의 계정](https://bsky.app/profile/k.rmc-8.com)을 얻었기 때문에 사용을 시작했습니다. Misskey보다 일본인 사용자가 적지만, 일본인들 사이에서 느슨하게 연결되어 있으며, 개발자들도 꽤 많아서 반응을 얻을 수 있어서 의외로 재미있는 곳입니다. 말하자면 초기의 일본어 지원 이전부터 지진 전의 Twitter 같은 분위기가 있어서 꽤 마음에 듭니다. 그럼에도 불구하고 Twitter에서만 교류할 수 있는 사람들도 있어서 간단히 이전할 수는 없었기 때문에, Twitter, Misskey, Bluesky를 병행하여 사용하면서 TL도 즐길 수 있도록 Twitter에서 Bluesky로 게시 처리를 IFTTT와 Google Apps Script을 사용하여 작성했습니다. 복사-붙여넣기 등으로 대응이 가능하지만, 전회와 마찬가지로 JavaScript에 의한 프로그래밍이 본 기사에 포함됩니다.

## 준비
* IFTTT Pro（유료 플랜입니다）
* Google 아카운트
* X(Twitter)의 아카운트

## 절차

대략적인 절차로 Google Apps Script에서 Bluesky의 아카운트에 자동 게시를 위한 API를 공개합니다. 그 API에 대해 자신이 소유한 Twitter에서 트윗이 게시되면 IFTTT를 통해 API에 Webhook으로 Tweet을 전송하여, IFTTT에서 Bluesky의 API에 데이터를 전송합니다. Bluesky 측에서 데이터를 수신하면 자신이 소유한 Bluesky의 아카운트에서 Tweet의 내용이 게시됩니다. 세부적인 절차를 하나씩 다음에 작성하겠습니다.

### App password를 얻기
[Bluesky의 설정](https://bsky.app/settings)에서 App Passwords를 클릭해주세요. ［Add App Password］를 클릭하여 앱 패스워드에 이름을 붙입니다. 그 후, ［Create App Password］를 클릭하면 앱 패스워드가 발급됩니다.

![app pass](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/twiToBluesky/apppass2.webp)

발급된 앱 패스워드를 메모장 등에 보관해주세요.

### Google Apps Script에서 API 처리를 작성하기

* [Google Apps Script의 홈페이지](https://script.google.com/)에 액세스합니다
* ［새 프로젝트］를 클릭합니다
* 「무제의 프로젝트」에서 「twitterToBluesky」 등으로 이름을 변경합니다
* 「코드.gs」를 「main.gs」 등으로 이름을 변경합니다
* 왼쪽 메뉴의 파일에서 ＋ 버튼을 눌러, 스크립트를 누릅니다
* 새로운 스크립트가 생성되면 「local」과 입력하여 Enter를 누릅니다
* 아래의 문장에 따라 코드를 작성해주세요

local.gs에 설정용 변수를 작성합니다。

```js
const HOST = "bsky.social";
const EMAIL = "login용의 Email 주소";
const APP_PASS = "App password를 여기 붙여넣기"
const SECRET = "HOGE"; // IFTTT 측에서 본인 확인을 하기 위해 임의의 문자를 입력해주세요
```


main.gs에는 IFTTT에서 Twitter의 게시 등을 수신하여, Bluesky에 Tweet의 내용을 게시하는 코드를 작성합니다。

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

## API를 공개하기

화면의 오른쪽 상단의 「배포」를 클릭하여 「새로운 배포」를 클릭합니다。

![publish](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/gas.webp)

* 종류의 선택에서 「웹 앱」을 선택합니다
* 새로운 설명문에 「iftttToMisskey」 등으로 설명을 작성합니다
* 다음 사용자로서 실행은 「자신」을 선택합니다
* 액세스할 수 있는 사용자는 「전원」으로 합니다
* ［배포］를 클릭합니다

![deploy](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/deploy.webp)

배포가 완료되면 웹 앱의 URL 아래에 있는 복사를 클릭해주세요. 복사한 URL은 IFTTT에서 사용합니다。

## IFTTT의 설정

IFTTT에서 자신이 소유한 아카운트의 트윗을 감지하면 배포한 API에 데이터를 전송하는 처리를 구성합니다。

### 감지의 설정
* IFTTT에 액세스하여 ［Add］를 클릭해주세요
* Search Service에 「Twitter」와 입력해주세요
* 검색 결과에서 Twitter를 클릭해주세요
* ［New tweet by you］를 클릭해주세요
* 폼에 값을 입력해주세요
  * Twitter account에 감지한 Twitter 아카운트를 선택해주세요
    * IFTTT와의 연동이 완료되지 않은 경우에는 지시에 따라 로그인과 인증을 해주세요
  * Include는 보통 체크를 해제해주세요
    * 체크를 하면 Retweet이나 리플라이도 Blusky에 게시됩니다
    * ［Create trigger］를 클릭해주세요

### API에 데이터를 전송하기
![make a webhook](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/fin.webp)

* Then That 내의 [Add]를 클릭해주세요
* Search Service에 「Webhooks」와 입력해주세요
* 검색 결과에서 Webhooks를 클릭해주세요
* ［Make a web request］를 클릭해주세요
* URL에 Google Apps Script에서 복사한 URL을 붙여넣어주세요
* Method는 POST로 변경해주세요
* Content Type을 application/json으로 해주세요
* Body에 「{"tweet": "{{text}}", "secret": "local.gs의 SECRET의 값을 붙여넣기"}」를 설정해주세요
* ［Create action］를 클릭해주세요
* ［Continue］를 클릭해주세요
* Applet Title에 「When @rmc_km makes a new tweet, note it to @<k.bsky.app>」 등으로 이름을 입력해주세요

［Finish］를 클릭해주세요

## 동작 확인

여기까지의 절차를 마쳤습니다. 그 후 설정한 Twitter 아카운트에서 Tweet을 하면, 자신이 소유한 Bluesky의 아카운트에서 Tweet의 내용이 게시되면 성공입니다. 다만 Bluesky에서는 embed 등 장식 처리가 필요하고 URL이나 이미지도 텍스트 그대로 표시되는 등 소박한 외관이 됩니다. 따라서, 스크래핑을 활용하여 필요한 데이터를 얻으면서 embed 등의 장식을 Payload에 구성하여 HTTP-POST로 게시하는 등의 추가 처리를 하면 더욱 좋습니다.

Bluesky 측의 샘플：<https://bsky.app/profile/k.rmc-8.com/post/3k2keq2kus72w>

## 요약

IFTTT를 사용하여 Google Apps Script에 트윗을 보내고, Bluesky에 자동으로 게시하는 방법을 설명했습니다. IFTTT Pro라면 Twitter의 아카운트가 여러 개라도 설정을 재사용하여 게시할 수 있고, 사용자가 게시로 이전하지 않은 상태에서도 Twitter와 병행하여 활용할 수 있습니다. Twitter에서 팔로워가 게시 등으로 이전하지 않는 상황에서도 쉽게 병행 운용이 가능하고, 이전처에서 기존의 관계에 추가하여 새로운 관계의 기회가 생길 수 있습니다. 다만, 자동 게시이기 때문에 불필요한 게시를 필터링하거나 Retweet이나 Reply가 전재되지 않도록 하는 등의 배려가 필요하지만, 잘 활용하면 Twitter의 동향을 주의하면서도 이전하기 쉬운 환경을 만들 수 있을 것입니다.ぜひ、ご活用くださいましたら幸いです。