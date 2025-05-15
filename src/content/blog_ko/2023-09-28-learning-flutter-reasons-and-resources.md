---
title: Flutter를 배우기 시작한 이유와 학습 리소스
slug: learning-flutter-reasons-and-resources
description: Flutter를 배우기 시작한 계기와 이유, 학습 리소스를 보여줍니다.
date: 2023-09-28T23:06:21.913Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

# Flutter를 배우기 시작한 이유와 학습 리소스

## 서문

나는 2023년 9월에 이 기사를 작성하면서 Flutter를 배우기 시작했습니다. X(Twitter)의 소란에서 벗어나 유사한 짧은 글 게시 SNS인 Bluesky를 살펴보고 있었는데, Bluesky용 Client 앱인 Skyclad가 오픈 소스 소프트웨어(OSS)로 공개되었다는 게시물을 보았습니다. 아래는 X의 Post이지만 Bluesky에서도 유사한 Post이 있습니다.

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">Bluesky의 iOS/Android 대응 클라이언트 'Skyclad'에 대해 소스 코드를 공개하여 OSS로 만들었습니다!!<br><br>유지보수가 어렵고, 더 나은 앱을 만들기 위해 여러분의 지혜를 빌리고 싶습니다!!<br><br>또한 Flutter로 Bluesky 클라이언트를 만들 때 참고가 되기를 바랍니다🙇‍♂️<a href="https://t.co/9K3HgBiFtY">https://t.co/9K3HgBiFtY</a></p>&mdash; いぐぞー ✈️ 旅するプログラマー (@igz0) <a href="https://twitter.com/igz0/status/1697876815849930889?ref_src=twsrc%5Etfw">September 2, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Skyclad는 Flutter로 만들어진 것 같지만, 이 때 Flutter 자체는 이름만 들어본 상태였고, Flutter를 다루기 위한 Dart 언어 등은 잘 모르는 상태였습니다. 리포지토리를 살펴보니 iOS와 Android용 설치 파일이 공개되어 있는 가운데, linux, macos, web, windows 폴더도 보였고, 하나의 언어와 프레임워크로 이 정도로 다양한 플랫폼(크로스 플랫폼)에 대응할 수 있다는 점에 놀라며 관심이 생겼습니다.

나는 Python이나 SQL을 주로 사용하는 언어로, 가끔 VBA 등을 사용하고, 취미로 JavaScript + Svelte로 놀고 있습니다. 이 중에서 JavaScript와 Electron으로 크로스 플랫폼 대응도 가능하지만, 실제 리포지토리를 보니 데스크톱부터 모바일까지 대응이 가능하고, 코드의 로직이나 위젯이 분리되어 구조화되어 관리되는 점, 초보자라도 대략적인 외관의 위젯이 무엇인지 읽기 쉽다는 인상을 받았습니다. 코드를 작성할 때는 작성법이나 가능한 것을 익혀야 하지만, 코드를 읽는 것이 기본적으로 더 어렵다는 인상 속에서, 초보자인 언어와 프레임워크로도 대략적으로 이해할 수 있다는 점에 작은 매력과 계기를 느꼈습니다.

OSS로서 코드도 존재하고, Bluesky도 발전 중이며 매우 편안한 환경이어서, Flutter를 배우는 계기로 한 걸음 내디디는 좋은 기회라고 느꼈습니다. 또한, 내가 가진 스킬셋으로는 C#이나 Swift, Kotlin처럼 데스크톱 앱이나 스마트폰용 앱을 개발하는 데는 적합하지 않습니다. Flutter라면 이들 외에도 Web에도 대응한 앱을 쉽게 만들 수 있고, 크로스 플랫폼으로 간단한 것을 만들어 보는 데 적합하다고 느꼈습니다. 따라서, Dart나 Flutter를 배우면서 대충 다듬어 Bluesky의 Client 앱을 만들어 보기로 했습니다.

## 학습 리소스

Flutter의 책은 여러 권 출판되어 있지만, Flutter를 배우는 경우에는 공식 문서나 그 일본어 번역이 추천됩니다. Google이 게시한 공식 문서는 영어이지만, 문장 자체가 읽기 쉽고, 세부적이면서도 간결하게 작성되어 누락 없이 읽기 좋습니다. 또한, 그 문서를 일본어로 번역한 것도 Github에서 공개되어 있어서, 일본어로 배울 수 있는 환경이 있습니다. 번역이 따라가지 못하는 경우에도 Google의 문서는 기술적 쓰기(Technical Writing) 기법을 사용하여 문서가 작성되어 있어서, 읽기 쉽고 번역하기 쉬운 특성이 있습니다. 따라서 DeepL이나 ChatGPT 등으로 번역하면서 배우는 것도 효과적입니다.
공식 문서와 대조적으로, 책은 아직 출판 수가 적고, 우수한 콘텐츠를 가진 만능의 한 권을 추천할 수 없는 상태입니다. Firebase를 배우고 Flutter로 앱을 만들어 확장시키는 아이디어를 다룬 책도 있지만, 그 이전의 기반이 되는 Dart나 Flutter를 배우는 점에서 정보원으로 공식 문서가 가장 강력하고, 거기서 부족한 부분을 공식 문서 내에서나 Web으로 검색하거나, ChatGPT나 Bard 같은 생성 AI를 사용하여 검증하는 것이 금전적으로도 쉽게 조사하고 배우는 면에서도 추천됩니다.

* [Flutter Doc](https://docs.flutter.dev/) - Flutter의 공식 문서. 정보가 간결하고 누락 없이 게시되어 읽기 좋다.
* [Flutter Doc JP](https://flutter.ctrnost.com/) - 공식 문서의 일본어 번역. 마찬가지로 읽기 좋고, 처음 학습에 최적.
* [Dart Documentation](https://dart.dev/guides) - Dart 언어의 공식 문서.
* [pub.dev - bluesky.dart](https://pub.dev/packages/bluesky) - Dart 및 Flutter를 위한 Bluesky 처리를 지원하는 모듈.

## 앞으로에 대해

이미 Bluesky용 Client 앱 개발이 착실히 진행 중인 상황이므로, 그 안에서 얻은 지식을 이 사이트에서 조금씩 출력해 나가겠습니다. Dart 언어의 문법이나 Flutter의 위젯 개념, Bluesky API를 사용한 백엔드 처리와 이를 UI와 연동시키는 방법 등 기본부터 응용의 스텝업을 조금씩 작성합니다. 기본 부분은 역시 공식 문서가 우수하므로, 그 기본을 활용하여 아이디어를 형성해 가는 스텝을 메인으로 지식 공유를 해 나가겠습니다.