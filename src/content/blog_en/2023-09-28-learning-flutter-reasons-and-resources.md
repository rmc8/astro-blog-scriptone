---
title: Reasons for Starting to Learn Flutter and Learning Resources
slug: learning-flutter-reasons-and-resources
description: This shows the episodes and reasons that prompted me to start learning Flutter, and learning resources.
date: 2023-09-28T23:06:21.913Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

# Reasons for Starting to Learn Flutter and Learning Resources

## Introduction

I started learning Flutter from September 2023, when I wrote this article. While browsing Bluesky, a short-form posting SNS similar to X (Twitter), I came across a post about the Skyclad app for Bluesky being released as open-source software (OSS). Below is a post from X, but a similar post is on Bluesky.

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Bluesky's iOS/Android client "Skyclad" has released its source code as OSS!!<br><br>It's because maintenance is tough, and I want to borrow everyone's wisdom to make a better app!!<br><br>I also think it can serve as a reference for creating a Bluesky client with Flutter🙇‍♂️<a href="https://t.co/9K3HgBiFtY">https://t.co/9K3HgBiFtY</a></p>&mdash; いぐぞー ✈️ 旅するプログラマー (@igz0) <a href="https://twitter.com/igz0/status/1697876815849930889?ref_src=twsrc%5Etfw">September 2, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

It was mentioned that Skyclad is made with Flutter, but at that time, I had only vaguely heard the name Flutter, and I didn't know much about the Dart language or how to handle Flutter. When I looked into the repository, I saw installation files for iOS and Android, as well as folders for linux, macos, web, and windows, and I was surprised and interested that one language and framework could support such diverse platforms (cross-platform).

Myself, I mainly use Python or SQL, occasionally VBA, and for hobbies, JavaScript + Svelte. Among these, JavaScript and Electron can handle cross-platform, but when I actually looked at the repository, it was possible to cover from desktop to mobile, and the code logic and widgets were separated and structured for management. Even at first glance, it seemed easy to read what kind of widgets the appearance was. Generally, reading code is more difficult than writing it once you know how, but in this case, with a new language and framework, I felt a small charm that I could somewhat understand.

Since the code exists as OSS and Bluesky is developing and very comfortable, I felt it was a good opportunity to take a step forward from the trigger to learn Flutter. Also, with the skills I have, developing desktop apps or smartphone apps like C#, Swift, or Kotlin is not very suitable. With Flutter, I can easily create apps that also support Web, in addition to these, and it seems suitable for making something a bit cross-platform. Therefore, while learning Dart and Flutter, I decided to make a rough Bluesky client app.

## Learning Resources

There are several books published on Flutter, but for learning Flutter, the official documentation and its Japanese translation are recommended. The official documentation published by Google is in English, but the text itself is easy to read, detailed yet concise, and comprehensive. There is also a Japanese translation of that documentation available on GitHub, so you can learn in Japanese. Even if the translation is not up to date, Google's documentation is written using technical writing techniques, making it not only easy to read but also easy to translate, so it's effective to learn by translating with DeepL or ChatGPT.
In contrast to the official documentation, there are few books published, and there isn't one excellent content for everyone. There are books that describe ideas for learning Firebase and extending apps with Flutter, but as a base for learning Dart or Flutter, the official documentation is the most authoritative source. For what's missing, it's recommended to search within the official documentation or on the web, or use generative AI like ChatGPT or Bard to verify, as it's handy in terms of cost and ease of learning.

* [Flutter Doc](https://docs.flutter.dev/) - Official Flutter documentation. Information is concise, comprehensive, and easy to read.
* [Flutter Doc JP](https://flutter.ctrnost.com/) - Japanese translation of the official documentation. Similarly easy to read and ideal for first-time learning.
* [Dart Documentation](https://dart.dev/guides) - Official Dart language documentation.
* [pub.dev - bluesky.dart](https://pub.dev/packages/bluesky) - Module that supports Bluesky processing for Dart and Flutter.

## Future Plans

Since the development of the Bluesky client app is steadily progressing, I will gradually output the knowledge gained on this site. I will write about the Dart language syntax, Flutter widget concepts, backend processing using Bluesky API, and how to link it with UI, from basics to advanced steps. Since the official documentation is excellent for the basics, I will mainly focus on steps to shape ideas based on that basics and share knowledge.