---
title: 【IFTTT】Twitter에서 Misskey으로 자동 게시하기
slug: twitter-to-misskey
description: IFTTT의 유료 플랜을 활용하여 Twitter에서 Misskey으로 Tweet 내용을 그대로 노트하는 방법을 설명합니다.
date: 2023-07-10T13:32:56.828Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/twiToMisskeyEyecatch.webp
draft: false
tags: ['GoogleAppsScript', 'Misskey', 'Twitter', 'IFTTT']
categories: ['Programming']
---

# 【IFTTT】Twitter에서 Misskey으로 자동 게시하기

Twitter의 API 제한 사건으로 인해 Misskey를 사용하기 시작했습니다. Misskey는 개인 개발 및 개인 운영이지만, Tread보다 더 친근한 분위기로, 의외로 프로그래밍 관련이 재미있는 플랫폼이라는 점을 깨닫고 좋아합니다. 그러나 제 주변에서 Misskey로 이동한 사람이 없어서 거의 혼자 노트를 작성하고 있습니다. 그게 조금 외로운 느낌이 들기도 해서, Twitter에서 느슨하게 게시하면서 Misskey에도 관련 있는 범위에서 Tweet 내용을 그대로 Note하여 병행 운영하기로 했습니다. 무차별적으로 자동 게시하면 Misskey에 맥락 없는 상태로 게시될 수 있으므로, 그 대책을 하면서 병행 사용을 목표로 합니다. 복사-붙여넣기 등으로 대응할 수 있지만, 이 글에는 JavaScript를 통한 프로그래밍이 포함됩니다.

## 준비

* IFTTT Pro+(유료 플랜입니다)
* Google 아카운트
* X(Twitter) 아카운트
* 임의의 서버의 Misskey 아카운트

## 손순

대략적인 손순으로는 Google Apps Script로 Misskey에 자동 게시하기 위한 API를 공개합니다. 그 API에 대해, 자신이 소유한 Twitter 아카운트에서 트윗이 게시되면 IFTTT를 통해 API에 Webhook으로 Tweet을 전송하여, IFTTT에서 Misskey API에 데이터를 전송합니다. Misskey를 운영하는 서버에서 데이터가 수신되면, 자신이 소유한 Misskey 아카운트에서 Tweet 내용이 Note됩니다. 자세한 손순을 하나씩 다음에 설명합니다.

### Google Apps Script로 API 처리 작성하기

먼저 간단히 손순을 설명합니다.

* [Google Apps Script 홈페이지](https://script.google.com)에 액세스합니다
* ［새 프로젝트］를 클릭합니다
* 「무제의 프로젝트」에서 「twitterToMisskey」 등 알아보기 쉬운 이름으로 변경합니다
* 「코드.gs」를 「main.gs」 등 알아보기 쉬운 이름으로 변경합니다
* 왼쪽 메뉴의 파일에서 ＋버튼을 눌러, 스크립트를 누릅니다
* 새로운 스크립트가 생성되면 「local」과 입력하고 Enter를 누릅니다
* 아래의 문장에 따라 코드를 작성해주세요

main.gs에는 IFTTT에서 Twitter의 게시 등을 수신하여, Misskey에 Tweet 내용을 Note하는 코드를 작성합니다.

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
  // hashtags에 기재된 word가 tweet 안에 존재하면 Misskey로의 Note를 하지 않는 처리를 추가합니다
  const hashtags = ["#프로세카협력", "#프로세카모집"];
  for (let i = 0; i < hashtags.length; i++) {
    if (tweet.includes(hashtags[i])) {
      return true;
    }
  }
  return false;
}

function postToMisskey(noteText) {
  // 공식 서버 이외의 경우에는 속한 서버의 호스트명으로 변경해주세요
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

다음으로 Misskey의 API에 액세스하기 위한 토큰을 획득합니다. Misskey에 액세스하여 설정 > API를 클릭해주세요. 계속해서 「액세스 토큰 발급」을 클릭해주세요.

액세스 토큰 발급이 표시되면 권한에서 「노트를 생성-삭제하기」를 ON으로 하고 오른쪽 상단의 체크마크를 클릭해주세요. 그 후, 표시된 토큰을 복사하여 Google Apps Script로 돌아와 주세요.

다음으로 local.gs에 복사한 토큰을 붙여넣습니다.

```
const MISSKEY_TOKEN = "복사한 토큰을 여기에 붙여넣습니다";
const SECRET = "임의의 문자열"; // IFTTT에서도 같은 문자열을 설정하여 비밀번호 대용으로 사용합니다
```

### API 공개하기

화면의 오른쪽 상단 「배포」를 클릭하여 「새로운 배포」를 클릭합니다.

* 종류 선택에서 「웹 앱」을 선택합니다
* 새로운 설명문에 「iftttToMisskey」 등 알아보기 쉬운 설명을 작성합니다
* 다음 사용자로서 실행은 「자신」을 선택합니다
* 액세스할 수 있는 사용자는 「전원」으로 합니다
* ［배포］를 클릭합니다

배포가 완료되면 웹 앱의 URL 아래에 있는 복사를 클릭해주세요. 복사한 URL은 IFTTT에서 사용합니다.

## IFTTT의 설정

IFTTT로 자신이 소유한 아카운트의 트윗을 감지하면 배포한 API에 데이터를 전송하는 처리를 추가합니다.

### 감지 설정

* IFTTT에 액세스하여 ［Add］를 클릭해주세요
* Search Service에 「Twitter」와 입력해주세요
* 검색 결과에서 Twitter를 클릭해주세요
* ［New tweet by you］를 클릭해주세요
* 폼에 값을 입력해주세요
  * Twitter account에 감지한 Twitter 아카운트를 선택해주세요
    * IFTTT와의 연동이 완료되지 않은 경우에는 지시에 따라 로그인과 인증을 해주세요
  * Include는 보통 체크를 해제해주세요
    * 체크하면 Retweet나 리플라이도 Misskey에 게시됩니다
* ［Create trigger］를 클릭해주세요

### API에 데이터를 전송하기

* Then That 내의 [Add]를 클릭해주세요
* Search Service에 「Webhooks」와 입력해주세요
* 검색 결과에서 Webhooks를 클릭해주세요
* ［Make a web request］를 클릭해주세요
* URL에 Google Apps Script에서 복사한 URL을 붙여넣어 주세요
* Method는 POST로 변경해주세요
* Content Type을 application/json으로 해주세요
* Body에 「{"tweet": "{{text}}", "secret": "local.gs의 SECRET 값을 붙여넣기"}」를 설정해주세요
* ［Create action］를 클릭해주세요

### 레시피 저장하기

* ［Continue］를 클릭해주세요
* Applet Title에 「When @rmc_km makes a new tweet, note it to @<rmc8@misskey.io>」 등 알아보기 쉬운 이름을 입력해주세요
* ［Finish］를 클릭해주세요

### 요약

* <https://misskey.io/notes/9h0f5igbtl>

여기까지의 손순을 마치셨습니다. 설정이 완료되었습니다. 이제 설정한 Twitter 아카운트에서 Tweet을 하면, 자신이 소유한 Misskey 아카운트에서 Tweet 내용이 노트되면 성공입니다. IFTTT를 사용하여 Google Apps Script에 트윗을 보내고, Misskey에 자동으로 노트하는 방법을 설명했습니다. IFTTT Pro라면 Twitter 아카운트가 여러 개라도 설정을 재사용하여 Misskey에 게시할 수 있고, Misskey로 이동한 사용자가 없는 상태에서도 Twitter와 병행 활용할 수 있습니다. Twitter에서 팔로워가 Misskey 등으로 이동하지 않는 상황에서도, 쉽게 병행 운영할 수 있고, 이동 후 기존의 관계에 추가하여 새로운 관계의 기회가 생길 수 있습니다. 다만, 자동 게시이기 때문에 불필요한 게시를 필터링하거나, Retweet이나 Reply가 전재되지 않도록 하는 등의 배려가 필요하지만, 잘 활용하면 Twitter의 동향을 주의하면서도 이동하기 쉬운 환경을 만들 수 있을 것입니다.ぜひ、ご活用くださいましたら幸いです。