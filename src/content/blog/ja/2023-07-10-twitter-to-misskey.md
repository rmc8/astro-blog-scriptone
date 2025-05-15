---
title: twitter-to-misskey
description: IFTTTの有料プランを活用してTwitterからMisskeyにTweetの内容をそのままノートする方法を記載しております。
date: 2023-07-10T13:32:56.828Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/twiToMisskeyEyecatch.webp
draft: false
tags: ['GoogleAppsScript', 'Misskey', 'Twitter', 'IFTTT']
categories: ['Programming']
---

# 【IFTTT】TwitterからMisskeyへ自動投稿する

TwitterのAPI制限の事件からMisskeyを使い始めました。Misskeyは個人開発・個人運営であるもののTreadよりも馴染みやすい雰囲気で、意外とプログラミング周りが楽しいプラットフォームであることも気づき気に入っています。しかしながら、自分の周りでMisskeyに移行した方がいない状態でほぼ一人の状態でノートしています。それも寂しいような気もするので、Twitterでゆるく投稿しながらMisskeyにも脈絡のある範囲でTweet内容をそのままNoteして、並行して運用していくことにしました。無差別に自動投稿すると脈絡のない状態でMisskeyに投稿することになってしまうのでその対策をしながら並行して使っていくことを目指します。コピペなどでの対応は可能ですが本記事にはJavaScriptによるプログラミングが含まれます。

## 準備

* IFTTT Pro+(有料プランです）
* Googleアカウント
* X(Twitter)アカウント
* 任意のサーバーのMisskeyのアカウント

## 手順

大まかな手順としましてはGoogle Apps ScriptでMisskeyに自動投稿するためのAPIを公開します。そのAPIに対して、自身が所有するTwitterアカウントからツイートが投稿されたらIFTTTを介してAPIにWebhookでTweetを送信して、IFTTTからMisskeyAPIにデータを送信します。Misskeyを運用するサーバーでデータが受け取られると自身が所有するMisskeyのアカウントでTweetの内容がNoteされます。詳細の手順を1つずつこの後書いていきます。

### Google Apps ScriptでAPIの処理を書く

まず簡単に手順を記述します。

* [Google Apps Scriptのホームページ](https://script.google.com)にアクセスします
* ［新しいプロジェクト］をクリックします
* 「無題のプロジェクト」から「twitterToMisskey」などわかる名前に変更します
* 「コード.gs」を「main.gs」などわかる名前に変更します
* 左側のメニュのファイルから＋ボタンを押して、スクリプトを押します
* 新しいスクリプトが生成されるので「local」と打ってEnterを押します
* 下記の文章に沿ってコードを記述してください

main.gsにはIFTTTからTwitterの投稿などを受け取って、MisskeyにTweetの内容をNoteするコードを書きます。

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
  // hashtagsに記載されたwordがtweet内に存在していたらMisskeyへのNoteをしない処理を組みます
  const hashtags = ["#プロセカ協力", "#プロセカ募集"];
  for (let i = 0; i < hashtags.length; i++) {
    if (tweet.includes(hashtags[i])) {
      return true;
    }
  }
  return false;
}

function postToMisskey(noteText) {
  // 公式サーバー以外の場合には所属しているサーバーのホスト名に書き換えてください
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

つぎにMisskeyのAPIにアクセスするためのトークンを取得します。Misskeyにアクセスして設定＞APIをクリックしてください。続いて「アクセストークンの発行」をクリックしてください。

アクセストークンの発行が表示されたら権限から「ノートを作成・削除する」をONにして右上のチェックマークをクリックしてください。その後、表示されたトークンをコピーしてGoogle Apps Scriptに戻ってきてください。

次にlocal.gsにコピーしたトークンを貼り付けます。

```
const MISSKEY_TOKEN = "コピーしたトークンをここに貼り付けます";
const SECRET = "任意の文字列"; // IFTTTでも同じ文字列を設定してパスワード代わりに使います
```

### APIを公開する

画面の右上の「デプロイ」をクリックして「新しいデプロイ」をクリックします。

* 種類の選択から「ウェブアプリ」を選びます
* 新しい説明文に「iftttToMisskey」などわかる説明を書きます
* 次のユーザーとして実行は「自分」を選択します
* アクセスできるユーザーは「全員」にします
* ［デプロイ］をクリックします

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
    * チェックをするとRetweetやリプライもMisskeyに投稿されます
* ［Create trigger］をクリックしてください

### APIにデータを送信する

* Then That内の[Add]をクリックしてください
* Search Serviceに「Webhooks」と入力してください
* 検索結果からWebhooksをクリックしてください
* ［Make a web request］をクリックしてください
* URLにGoogle Apps ScriptでコピーしたURLをペーストしてください
* MethodはPOSTに変更してください
* Content Typeをapplication/jsonにしてください
* Bodyに「{"tweet": "{{text}}", "secret": "local.gsのSECRETの値を貼り付ける"}」を設定してください
* ［Create action］をクリックしてください

### レシピを保存する

* ［Continue］をクリックしてください
* Applet Titleに「When @rmc_km makes a new tweet, note it to @<rmc8@misskey.io>」などわかる名前を入力してください
* ［Finish］をクリックしてください

### まとめ

* <https://misskey.io/notes/9h0f5igbtl>

ここまでの手順を終えましたら設定完了です。あとは設定したTwitterアカウントからTweetをして、自身が所有するMisskeyのアカウントでTweetの内容がノートされたら成功です。IFTTTを使ってGoogle Apps Scriptにツイートを送り、Misskeyに自動でノートする方法を記載しました。IFTTT ProであればTwitterのアカウントが複数でも設定を使いまわしてMisskeyに投稿ができ、Misskeyにユーザーが移行していない状態でもTwitterと並行して活用できます。TwitterからフォロワーさんがMisskeyなどに移行しない状況にあっても、簡単に並行運用ができまた移行先で既存の付き合いに加えて新しい付き合いの機会が生まれるかと思います。ただ、自動投稿であるため不要な投稿をフィルターしたり、RetweetやReplyが転載されないようにするなどの配慮も必要ですが、うまく使いこなすことによってTwitterの動向に気を配りながらも移行しやすい環境を作れるかと思います。ぜひ、ご活用くださいましたら幸いです。

