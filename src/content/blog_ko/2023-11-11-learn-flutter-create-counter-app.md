---
title: Flutter 입문 - 카운터 앱 만들기
slug: learn-flutter-create-counter-app
description: 처음으로 Flutter로 앱을 만드는 분들을 위한 입문 기사입니다. Flutter로 카운터 앱을 만들면서 코드를 이해해 가겠습니다.
date: 2023-11-11T00:27:39.212Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

# Flutter 입문 - 카운터 앱 만들기

Flutter는 iOS, Android, Windows, Mac, Web을 위한 앱을 하나의 코드로 만들 수 있는 프레임워크입니다. 외관의 표시를 정의하는 것도 적은 코드 양으로 정의할 수 있으며, 색상, 도형, 아이콘 설정, 행이나 열의 구조, 텍스트 표시 등을 쉽게 할 수 있습니다.

자체적인 렌더링 엔진으로 인해 모든 환경에서 동일한 고품질의 표시를 실현할 수 있으며, 코드 변경이 즉시 외관에 반영되는 Hot Reload가 있어서 UI를 구축하는 재미가 Flutter에 있습니다. 또한 [pub.dev](https://pub.dev/)에 재사용 가능한 코드가 많이 게시되어 있으며, UI를 구축하기 위한 다양한 위젯의 선택지가 있어서 적은 코드 양으로 고품질의 앱을 구축할 수 있습니다.

이 Flutter를 사용하여 먼저 소개로 카운터 앱을 만들고, 설명하겠습니다.

## 카운터 앱

<iframe style="width:100%;height:600px" src="https://dartpad.dev/embed-flutter.html?id=20b0320b53be297d67712e666671e361"></iframe>

## 설명

### 앱의 실행

```dart
import 'package:flutter/material.dart';

void main() => runApp(App());
```

`import 'package:flutter/material.dart';`는 Dart에서 Flutter를 다루기 위해 필요한 코드를 호출할 수 있도록 하는 선언입니다. Flutter로 코드를 작성할 때마다 이 코드를 작성합니다.

`void main() => runApp(App());`는 Flutter로 만든 앱을 실행하기 위한 코드입니다. main 함수를 시작점으로 Dart로 작성한 코드가 실행되며, runApp으로 자신만의 앱을 실행할 수 있습니다. `=>`를 사용한 코드 작성은 함수 내의 코드가 1행일 때 쓸 수 있는 축약된 작성법이며, 아래와 같이도 작성할 수 있습니다.

```dart
void main() {
  runApp(App());
}
```

작성법은 어느 쪽이든 괜찮지만, 함수 내의 처리가 1행만 있을 때는 `=>`를 사용한 작성법으로 3행이 아닌 1행으로 처리를 간결하게 표현할 수 있습니다.

### 앱의 정의

```dart
class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const appName = '카운터 앱'; // 앱 이름
    return const MaterialApp(
      title: appName, // 앱의 타이틀
      debugShowCheckedModeBanner: false, // 오른쪽 상단의 빨간 debug 배너를 숨김
      home: CounterApp(title: appName), // 앱의 콘텐츠(홈페이지)
    );
  }
}
```

App 클래스에서는 실행할 앱의 정의를 하고 있습니다. 먼저, Flutter 앱의 시작점은 [MaterialApp](https://api.flutter.dev/flutter/material/MaterialApp-class.html)입니다.

MaterialApp은 Google이 제안하는 [Material Design](https://m3.material.io/)이라고 불리는 앱의 외관과 설계 기법을 적용하여 앱을 만드는 기능을 가지고 있습니다. 또한, 앱의 전체 설정을 여기에 포함할 수 있으며, 개별 콘텐츠에서 그 설정을 호출할 수도 있습니다. 바꿔 말하면, MaterialApp은 Material Design에 의한 앱을 만드는 컨테이너이며, 앱 전체의 설정을 유지하면서 실제로 앱으로 표시되는 콘텐츠를 등록하는 곳이 됩니다.

그리고, 이 MaterialApp으로 정의된 앱을 build 메서드를 사용하여 화면에 표시할 수 있습니다. App 클래스 자체에는 카운터의 숫자처럼 변화하는 값이 존재하지 않습니다. 따라서 상태를 가지지 않기 때문에, StatelessWidget을 상속하여 위젯을 표시하고 있습니다.

### 콘텐츠의 컨테이너 정의

```dart
class CounterApp extends StatefulWidget {
  final String title;

  const CounterApp({
    Key? key,
    required this.title,
  }) : super(key: key);

  @override
  State<CounterApp> createState() => _CounterAppState();
}
```

다음으로 콘텐츠를 정의합니다. 여기서 카운터 앱의 컨테이너를 만듭니다. CounterApp은 title을 외부에서 받아와, CounterApp 내에서 불변의 값으로 유지합니다. const가 아닌 이유는 외부에서 값을 받기 때문에 가변적이지만 그 이후 값이 변하지 않는 것을 의미합니다. Key에 대해서는 동적인 콘텐츠 생성에 사용되는 것이지만, 여기서는 선택적인 인수입니다. 입문 단계에서는 일단 key에 대해서는 건너뛰어도 문제없습니다.

StatefulWidget으로 콘텐츠를 만들어 표시하기 위해서는 createState 메서드를 사용하여, CounterApp을 관리하기 위한 State 클래스를 준비해야 합니다. 코드를 읽는 것만으로는 처리 내용을 상상하기 어렵지만, StatefulWidget에 의한 화면 묘사를 위한 필수적인 구문이라고 생각해 주세요.

StatefulWidget은 StatelessWidget과 달리 화면의 상태에 변화가 동반될 수 있습니다. createState로 State를 만든 후, 그 클래스 내에서 유지하고 있는 값(카운터 앱이라면 카운트 수)을 변화시키고, 그 변화된 상태를 화면에 반영할 수 있습니다. 또한 StatefulWidget에서 유지하고 있는 값을 State 클래스에 전달하여 화면을 묘사하는 처리를 할 수도 있습니다. StatelessWidget 자체에는 어떤 변화하는 값도 가지지 않고 화면을 업데이트하는 처리를 가지고 있지 않습니다. App 클래스 자체에서는 상태를 가지지 않고 단순히 위젯을 표시하고 있기 때문에, StatelessWidget이 됩니다.

### 콘텐츠의 생성

```dart
class _CounterAppState extends State<CounterApp> {
  int _counter = 0; // 카운터의 초기값을 설정하여 카운트 수를 상태로 유지

  void _incrementCounter() {
    setState(() {
      _counter++; // _counter의 값을 1 증가
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueGrey.shade200, // 화면 상단의 Title 배경색을 설정
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center, // children의 요소를 중앙에 표시
          children: [
            const Text(
              '버튼을 탭한 횟수를 표시합니다',
            ), // Text를 표시
            Text(
              '$_counter회째',
              style: const TextStyle(fontSize: 36.0), // 텍스트의 크기 등 텍스트 설정
            ), // 크기 36.0으로 Text를 표시
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: '카운터의 값을 1 증가',
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

_CounterAppState에서는 CounterApp으로 만든 State<CounterApp> 클래스를 상속하여 앱의 콘텐츠를 정의하고 있습니다. MaterialApp의 콘텐츠는 Scaffold를 사용하여 정의합니다. [Scaffold](https://api.flutter.dev/flutter/material/Scaffold-class.html)에서는 앱의 타이틀이나 콘텐츠를 정의하거나, 타이틀바 내에서 액션을 발생시킬 수 있는 버튼을 정의하거나, 콘텐츠 표시와 관련된 다양한 처리를 지원합니다.

appBar는 화면 상단의 Title 부분에 해당합니다. AppBar를 사용하면 Title의 디자인을 쉽게 할 수 있습니다. AppBar 대신 Text를 사용하여 간단하게 텍스트만 삽입할 수도 있습니다.

body에서는 페이지 중앙의 콘텐츠를 정의합니다. Center로 콘텐츠를 중앙 정렬하면서, Column을 사용하여 여러 콘텐츠를 리스트를 사용하여 일괄 정의할 수 있습니다.

floatingActionButton에서는 화면 오른쪽 하단에 떠 있는 버튼을 정의하고 있습니다. onPressed로 버튼을 눌렀을 때 실행할 처리를 설정할 수 있으며, child 내에 버튼의 아이콘을 정의하고 있습니다. onPressed의 _incrementCounter에서는 카운터의 값을 증가시키는 처리를 하고 있습니다. _CounterAppState에는 멤버로서 _counter가 있지만, setState를 사용하여 멤버의 값을 변경할 수 있으며, 이 변경에 따라 화면의 표시를 업데이트하는 처리를 StatefulWidget에 의해 실현하고 있습니다.

### 코드의 분할

```dart
class _CounterAppState extends State<CounterApp> {
  int _counter = 0; // 카운터의 초기값을 설정하여 카운트 수를 상태로 유지

  void _incrementCounter() {
    setState(() {
      _counter++; // _counter의 값을 1 증가
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueGrey.shade200,
        title: Text(widget.title),
      ),
      body: _buildCounterContents(),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: '카운터의 값을 1 증가',
        child: const Icon(Icons.add),
      ),
    );
  }
  
  Widget _buildCounterContents() {
    return Center(
        child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text(
            '버튼을 탭한 횟수를 표시합니다',
          ),
          Text(
            '$_counter회째',
            style: const TextStyle(fontSize: 36.0), // 텍스트의 크기 등 텍스트 설정
          ),
        ],
      ),
    );
  }
}
```

Flutter로 build 메서드의 처리를 작성하면, 코드에 중복이 발생하거나 인덴트가 깊어지거나 길어져 코드가 읽기 어려워질 수도 있습니다. 그런 경우에는 위의 _buildCounterContents처럼 별도의 메서드로 처리를 분할하여 위젯으로 호출하는 작성법도 가능합니다. 이처럼 작성하면 코드의 재사용이 용이해지거나, 코드를 짧게 인덴트를 얕게 하여 읽기 쉽게 할 수 있습니다.

## Flutter의 학습 방법

Dart 언어는 외부의 데이터베이스나 API 등과 연동시켜 Flutter로 고품질의 화면 묘사를 할 수 있습니다. 매우 쉽게 이러한 처리를 할 수 있는 반면, 할 수 있는 것이 다양하기 때문에 모든 것을 배우려고 하면 매우 시간이 걸립니다.

따라서 먼저 카운터 앱을 업그레이드시키거나, 캘린더를 만들어 보거나 하는 작은 것부터 시작하거나, 작은 것에 분해할 수 있는 조금 큰 앱을 만들어 보는 등 어떤 목표의 결과물을 설정하는 것이 좋을 수 있습니다.

또한, Flutter는 일본어よりも 영어 콘텐츠가 풍부하며, 공식 문서만으로도 Flutter 자체를 쉽게 배울 수 있습니다. 영어를 읽을 수 없더라도 DeepL, Google Translate, ChatGPT로 번역하거나, 번역된 문서를 읽는 것도 효과적입니다.

먼저 목표의 결과물을 만들면서 Flutter로 할 수 있는 것을 배우고, 다른 예시나 다른 목표의 결과물을 설정하는 것도 좋을 수 있습니다.

## 요약

Flutter에서의 카운터 앱의 만들기와 설명을 했습니다. 코드로 화면이나 처리를 구축하는 프레임워크지만 매우 간결하고, 하고 있는 것도 읽기 쉽고, 다양한 OS에 하나의 코드로 대응할 수 있습니다. 게다가 외관이 잘 갖춰진 앱을 적은 코드 양으로 만들 수 있어서, 일본에서는 절대 메이저가 아니지만 쓰는 것이 재미있는 프레임워크(언어)이라고 생각됩니다. 스마트폰을 위한 앱 제작이나, 다양한 환경을 위한 앱 제작, UI 디자인 등에 관심이 있는 분들은ぜひ Flutter도 학습 후보의 하나로 고려해 보는 것도 좋을 수 있습니다.