---
title: twitter-to-bluesky
description: IFTTTとGoogle Apps Scriptを使いTwitterからBlueskyに投稿をする方法を記載します。複数のSNSを並行して活用しながら移行をしたり交流をしたりなどの活用ができます。
date: 2023-07-15T12:17:45.842Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/twiToBsky.webp
draft: false
tags: ['Bluesky', 'Twitter', 'IFTTT', 'GoogleAppsScript']
categories: ['Programming']
---

# 【IFTTT】TwitterからBlueskyへ自動投稿する

[前回の記事](/twitter-to-misskey)で紹介したMisskeyに続いて、[Blueskyのアカウント](https://bsky.app/profile/k.rmc-8.com)も取得したので使い始めました。Misskeyよりも日本人ユーザーは少ないですが、日本人同士でゆるくつながりあっており、開発者の方も割と多くリアクションをいただけるため意外と楽しい場所です。いうならば初期の日本語対応以前から震災前のようなTwitterの雰囲気があり割と気に入っています。とはいえ、Twitterでないと交流できない方もいてあっさり移行というわけにはいかなかったので、Twitter・Misskey・Blueskyと並行して使いながらTLも楽しめるようにTwitterからBlueskyへと投稿する処理をIFTTTとGoogle Apps Scriptを使って書きました。コピペなどでの対応が可能ですが前回と同様にJavaScriptによるプログラミングが本記事に含まれます。

## 準備
* IFTTT Pro（有料プランです）
* Googleアカウント
* X(Twitter)のアカウント

## 手順

大まかな手順としましてはGoogle Apps ScriptでBlueskyのアカウントに自動投稿するためのAPIを公開します。そのAPIに対して自身が所有するTwitterからツイートが投稿されたらIFTTTを介してAPIにWebhookでTweetを送信して、IFTTTからBlueskyのAPIにデータを送信します。Bluesky側でデータを受け取ると自身が所有するBlueskyのアカウントでTweetの内容がPostされます。詳細の手順を1つずつこの後書いていきます。

### App passwordを取得する
[Blueskyの設定](https://bsky.app/settings)からApp Passwordsをクリックしてください。［Add App Password］をクリックしてアプリパスワードに名前を付けます。その後、［Create App Password］をクリックするとアプリパスワードが発行されます。

![app pass](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/twiToBluesky/apppass2.webp)

発行されたアプリパスワードをメモ帳などわかる場所に保管しておいてください。

### Google Apps ScriptでAPIの処理を書く

* [Google Apps Scriptのホームページ](https://script.google.com/)にアクセスします
* ［新しいプロジェクト］をクリックします
* 「無題のプロジェクト」から「twitterToBluesky」などわかる名前に変更します
* 「コード.gs」を「main.gs」などわかる名前に変更します
* 左側のメニュのファイルから＋ボタンを押して、スクリプトを押します
* 新しいスクリプトが生成されるので「local」と打ってEnterを押します
* 下記の文章に沿ってコードを記述してください

local.gsに設定用の変数を書きます。

```js
const HOST = "bsky.social";
const EMAIL = "login用のEmailアドレス";
const APP_PASS = "App passwordをここに貼り付ける"
const SECRET = "HOGE"; // IFTTT側で本人確認をするために任意の文字を入力してください
```


main.gsにはIFTTTからTwitterの投稿などを受け取って、BlueskyにTweetの内容をPostするコードを書きます。

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

## APIを公開する

画面の右上の「デプロイ」をクリックして「新しいデプロイ」をクリックします。

![publish](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/gas.webp)

* 種類の選択から「ウェブアプリ」を選びます
* 新しい説明文に「iftttToMisskey」などわかる説明を書きます
* 次のユーザーとして実行は「自分」を選択します
* アクセスできるユーザーは「全員」にします
* ［デプロイ］をクリックします

![deploy](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/deploy.webp)

デプロイが完了したらウェブアプリのURLの下にあるコピーをクリックしてください。コピーしたURLはIFTTTで使います。

## IFTTTの設定

IFTTTで自身が所有するアカウントのツイートを検知したらデプロイしたAPIにデータを送信する処理を組みます。

### 検知の設定
* IFTTTにアクセスして［Add］をクリックしてください
* Search Serviceに「Twitter」と入力してください
* 検索結果からTwitterをクリックしてください
* ［New tweet by you］をクリックしてください
* フォームに値を入力してください
  * Twitter accountに検知したTwitterアカウントを選択してください
    * IFTTTとの連携が済んでいない場合には指示に沿ってログインと認証をしてください
  * Includeは通常チェックを外してください
    * チェックをするとRetweetやリプライもBluskyに投稿されます
    * ［Create trigger］をクリックしてください

### APIにデータを送信する
![make a webhook](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/misskey/fin.webp)

* Then That内の[Add]をクリックしてください
* Search Serviceに「Webhooks」と入力してください
* 検索結果からWebhooksをクリックしてください
* ［Make a web request］をクリックしてください
* URLにGoogle Apps ScriptでコピーしたURLをペーストしてください
* MethodはPOSTに変更してください
* Content Typeをapplication/jsonにしてください
* Bodyに「{"tweet": "{{text}}", "secret": "local.gsのSECRETの値を貼り付ける"}」を設定してください
* ［Create action］をクリックしてください
* ［Continue］をクリックしてください
* Applet Titleに「When @rmc_km makes a new tweet, note it to @<k.bsky.app>」などわかる名前を入力してください

［Finish］をクリックしてください

## 動作確認

ここまでの手順を終えましたら設定完了です。あとは設定したTwitterアカウントからTweetをして、自身が所有するBlueskyのアカウントでTweetの内容がPostされたら成功です。ただしBlueskyではembedなど装飾の処理が必要でURLや画像も文字のまま表示されるなど質素な外観となります。そのため、スクレイピングを駆使して必要なデータを取得しながらembedなどの装飾をPayloadに組んで、HTTP-POSTで投稿するなどの追加の処理を行うとなおよいです。

Bluesky側のサンプル：<https://bsky.app/profile/k.rmc-8.com/post/3k2keq2kus72w>

## まとめ

IFTTTを使ってGoogle Apps Scriptにツイートを送り、Blueskyに自動でPostする方法を記載しました。IFTTT ProであればTwitterのアカウントが複数でも設定を使いまわしてPostに投稿ができ、Postにユーザーが移行していない状態でもTwitterと並行して活用できます。TwitterからフォロワーさんがPostなどに移行しない状況にあっても、簡単に並行運用ができまた移行先で既存の付き合いに加えて新しい付き合いの機会が生まれるかと思います。ただ、自動投稿であるため不要な投稿をフィルターしたり、RetweetやReplyが転載されないようにするなどの配慮も必要ですが、うまく使いこなすことによってTwitterの動向に気を配りながらも移行しやすい環境を作れるかと思います。ぜひ、ご活用くださいましたら幸いです。

