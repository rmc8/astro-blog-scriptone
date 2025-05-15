---
title: learning-flutter-reasons-and-resources
description: Flutterを学びはじめるきっかけとなったエピソードや理由、学習のリソースを示します。
date: 2023-09-28T23:06:21.913Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

# Flutterを学びはじめた理由と学習のリソース

## はじめに

私は、この記事を書いた2023年9月からFlutterを学びはじめました。X(Twitter)の喧騒から離れて類似の短文投稿SNSであるBlueskyを眺めていたところ、SkycladというBluesky用のClientアプリがオープンソースソフトウェア(OSS)として公開する投稿を見かけました。以下はXのPostですがBlueskyでも同様のPostがされています。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">BlueskyのiOS/Android対応クライアント「Skyclad」についてソースコードを公開し、OSSにしました！！<br><br>メンテが厳しいことと、より良いアプリにするために皆さまのお知恵を拝借したいからです！！<br><br>またFlutterでBlueskyクライアントを作るときの参考になればと思います🙇‍♂️<a href="https://t.co/9K3HgBiFtY">https://t.co/9K3HgBiFtY</a></p>&mdash; いぐぞー ✈️ 旅するプログラマー (@igz0) <a href="https://twitter.com/igz0/status/1697876815849930889?ref_src=twsrc%5Etfw">September 2, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

SkycladはFlutterで作られているとのことですが、このときFlutter自体は名前はなんとなく聞いたことがあったものの、Flutterを扱うためのDart言語などよく知らない状態でした。リポジトリをのぞいてみると、iOSとAndroid用にインストール用のファイルが公開されている中で、linux, macos, web, windowsフォルダーなども見かけて、1つの言語とフレームワークでここまで多様なプラットフォーム(クロスプラットフォーム)に対応できるのかと驚き興味が湧きました。

私自身はPythonやSQLがメインに使う言語で、たまにVBAなど使い、趣味ではJavaScript＋Svelteで遊んでいます。この中であればJavaScriptとElectronでクロスプラットフォームの対応も可能ですが、実際にリポジトリを見てデスクトップからモバイルまでの対応が可能であり、またコードのロジックやウィジェットが分離されながら構造化して管理されている点、初見でもなんとなくどのような外観のウィジェットなのか読みやすそうな印象を持ちました。書く時には書き方やできることを覚える必要があるもののコードを読むほうが基本的に難しいことが多い印象がある中で、初見の言語とフレームワークで何となくわかる点にささやかな魅力やきっかけのようなものを感じました。

OSSとしてコードも存在しており、Blueskyも発展中でとても居心地がよく、Flutterを学ぶきっかけから一歩踏み出すよい機会のように私は感じました。また、持っているスキルセットではC#やSwift、Kotlinのようにデスクトップアプリやスマートフォン向けアプリを開発することはあまり向いていません。Flutterであればこれらに加えてWebにも対応したアプリが作りやすく、クロスプラットフォームでちょっとしたものを作ってみることに向いていそうだと私は感じました。そのため、DartやFlutterを学びながら粗削りですがBlueskyのClientアプリを作ってみることにしました。

## 学習のリソース

Flutterの書籍はいくつか出版されていますがFlutterを学ぶ場合には公式ドキュメントやその日本語訳がおすすめです。Googleが掲載している公式ドキュメントは英語でありながらも文章自体が読みやすく、詳細なのに簡潔に書かれていて漏れなく読みやすいです。また、そのドキュメントを日本語で訳しているものもGithubで公開されているので、日本語で学べる環境があります。また、翻訳が追い付いていない場合であってもGoogleのドキュメントはテクニカルライティングと呼ばれる手法を交えてドキュメントが書かれています。そのために読みやすいだけでなく翻訳をしやすい性質があるので、DeepLやChatGPTなどで翻訳しながら学ぶことも有効です。
公式ドキュメントとは対照に、書籍はまだ出版数が少ない状態で優れたコンテンツを持つ万人向けの一冊は挙げられない状態にあります。Firebaseを学んでFlutterで作りアプリを拡張させるアイデアを記した書籍も点在していますが、それ以前のベースとなるDartやFlutterを学ぶ点からすると情報源として公式のドキュメントが最有力で、そこで足りないところを公式ドキュメント内やWebで検索をしたり、ChatGPTやBardなどの生成AIを用いて検証したりなどが金銭面でも手軽に調べて学ぶ面でもおすすめです。

* [Flutter Doc](https://docs.flutter.dev/) - Flutterの公式ドキュメント。情報が簡潔にもれなく掲載されており読みやすい。
* [Flutter Doc JP](https://flutter.ctrnost.com/) - 公式ドキュメントの日本語訳。同様に読みやすく初めての学習の最適。
* [Dart Documentation](https://dart.dev/guides) - Dart言語の公式ドキュメント。
* [pub.dev - bluesky.dart](https://pub.dev/packages/bluesky) - DartおよびFlutter向けのBlueskyの処理をサポートするモジュール。

## 今後について

すでにBluesky用のClientアプリの開発が着実に進む状況にあるので、その中で得られた知見を本サイトで少しずつアウトプットしていきます。Dart言語の文法やFlutterのウィジェットの考え方、Bluesky APIを使ったバックエンドの処理とそれをＵＩと連動させる方法など基本から応用のステップアップを少しずつ書きます。基本の部分はやはり公式ドキュメントが優れているので、その基本を生かしてアイデアを形にしていくステップをメインにナレッジシェアをしていきます。

