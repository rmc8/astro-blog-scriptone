---
title: "Flutter入門 - カウンターアプリをつくる"
slug: "learn-flutter-create-counter-app"
description: "初めてFlutterでアプリを作る方に向けた入門記事です。Flutterでカウンターアプリを作りながら、コードの理解を深めていきます。"
date: 2023-11-11T00:27:39.212Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp"
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

FlutterはiOSやAndroid、Windows、Mac、Web向けのアプリを1つのコードで作れるフレームワークです。外観の表示の定義も少ないコード量で定義でき、色や図形、アイコンの設定、行や列の構造や文字の表示などを簡単にできます。

独自の描画エンジンによりどの環境でも同一の高品質な表示を実現でき、コードの変更もすぐに外観に反映されるホットリロードがあるので、UIを構築する楽しさがFlutterにはあります。加えて[pub.dev](https://pub.dev/)に再利用可能なコードがたくさん掲載されており、UIを構築するための多彩なウィジェットの選択肢があるため、少ないコード量で高品質なアプリを構築できます。

このFlutterを使ってまずは導入としてカウンターアプリを作り、解説をします。

## カウンターアプリ

<iframe style="width:100%;height:600px" src="https://dartpad.dev/embed-flutter.html?id=20b0320b53be297d67712e666671e361"></iframe>

## 解説

### アプリの実行

```dart
import 'package:flutter/material.dart';

void main() => runApp(App());
```

`import 'package:flutter/material.dart';`はDartでFlutterを扱うために必要なコードを呼び出しできるようにするための宣言です。Flutterでコードを組む際には都度このコードを記述します。

`void main() => runApp(App());`はFlutterで作ったアプリを実行するためのコードです。main関数を起点にDartで書いたコードが実行され、runAppにより自身で作ったアプリを実行できます。`=>`を使ったコードの書き方は関数内のコードが１行のときにかける省略した書き方であり、以下のようにも書き換えられます。

```dart
void main() {
  runApp(App());
}
```

書き方はどちらでも大丈夫ですが、関数内の処理が1行のみの場合には`=>`を使った書き方にすると３行ではなく１行で処理を簡潔に表現できます。

### アプリの定義

```dart
class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const appName = 'カウンターアプリ'; // アプリ名
    return const MaterialApp(
      title: appName, // アプリのタイトル
      debugShowCheckedModeBanner: false, // 右上の赤いdebugバナーを非表示にさせる
      home: CounterApp(title: appName), // アプリのコンテンツ（ホームページ）
    );
  }
}
```

Appクラスでは実行するアプリの定義をしています。まず、Flutterのアプリの起点は[MaterialApp](https://api.flutter.dev/flutter/material/MaterialApp-class.html)です。

MaterialAppはGoogleが提唱する[Material Design](https://m3.material.io/)と呼ばれるアプリの外観や設計手法を取り入れてアプリを作る機能を持ちます。また、アプリの全体の設定をここに含めることができ、個別のコンテンツからその設定を呼び出すこともできます。言い換えるとMaterialAppはMaterial Designによるアプリを作るための入れ物であり、アプリ全体の設定を保持しながら、実際にアプリとして表示させるコンテンツを登録する場所となります。

そして、このMaterialAppで定義されたアプリをbuildメソッドを使うことで画面上に表示させられます。そしてAppクラス自体にはカウンターの数値のように変化する値が存在しません。そのため状態を持たないので、StatelessWidgetを継承してウィジェットを表示させています。

### コンテンツの入れ物の定義

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

次にコンテンツを定義します。ここでカウンターアプリの入れ物を作ります。CounterAppはtitleを外部から受け取り、CounterApp内に不変の値として保持します。constでない理由は外部から値を受け取るため可変であるもののそれ以降値が変わらないことを意味しています。Keyについては動的なコンテンツの作成に使われるものですがこちらは省略可能な引数となっています。入門時点では一旦keyについてはスキップいただいても問題はありません。

StatefulWidgetでコンテンツを作り表示させるためにはcreateStateメソッドを使って、CounterAppを管理するためのStateクラスを準備する必要があります。コードを読むだけでは処理内容はイメージしにくいですが、StatefulWidgetによる画面描写を行うための必須の構文と思っていただければOKです。

StatefulWidgetはStatelessWidgetと異なり画面の状態に変化が伴うことがあります。createStateでStateを作ったあと、そのクラス内で保持している値（カウンターアプリであればカウント数）を変化させ、その変化した状態を画面に反映させられます。またStatefulWidgetで保持している値をStateクラスに渡して画面を描写する処理を行うこともできます。StatelessWidget自体には何か変化する値を持ち画面を更新する処理を持ちません。Appクラス自体では状態を持たず単にウィジェットを表示させているだけであるため、StatelessWidgetとなっています。

### コンテンツの作成

```dart
class _CounterAppState extends State<CounterApp> {
  int_counter = 0; // カウンターの初期値を設定してカウント数を状態として保持する

  void _incrementCounter() {
    setState(() {
      _counter++; // _counterの値を1増やす
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueGrey.shade200, // 画面上部のTitleの背景色を設定する
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center, // childrenの要素を中央に表示する
          children: [
            const Text(
              'ボタンをタップした回数を表示します',
            ), // Textを表示する
            Text(
              '$_counter回目',
              style: const TextStyle(fontSize: 36.0), // 文字の大きさなど文字の設定をする
            ), // Textを大きさ36.0で表示する
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'カウンターの値を1増やす',
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

_counterAppStateではCounterAppで作ったState<CounterApp>クラスを継承してアプリのコンテンツを定義しています。MaterialAppのコンテンツはScaffoldを使って定義します。[Scaffold](https://api.flutter.dev/flutter/material/Scaffold-class.html)ではアプリのタイトルやコンテンツを定義したり、タイトルバー内でアクションを起こせるボタンを定義したり、コンテンツの表示に係る多彩な処理に対応します。

appBarは画面上部のTitleの部分にあたります。AppBarを使うことでTitleのデザインを簡単に行うことができます。AppBarの代わりにTextを使いシンプルに文字のみを挿入することもできます。

bodyではページ中央のコンテンツを定義します。Centerによりコンテンツを中央寄せしつつ、Columnを使うことで複数のコンテンツをリストを使い一括して定義できます。

floatingActionButtonでは画面右下に浮かぶように表示されているボタンを定義しています。onPressedでボタンを押した時に実行する処理を設定でき、child内にボタンのアイコンを定義しています。onPressedの_incrementCounterではカウンターの値を増やす処理をしています。_CounterAppStateにはメンバーとして_counterがありますが、setStateを使うことによりメンバーの値を変更することができ、この変更に応じて画面の表示を更新する処理をStatefulWidgetにより実現しています。

### コードの分割

```dart
class _CounterAppState extends State<CounterApp> {
  int_counter = 0; // カウンターの初期値を設定してカウント数を状態として保持する

  void _incrementCounter() {
    setState(() {
      _counter++; // _counterの値を1増やす
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
        onPressed:_incrementCounter,
        tooltip: 'カウンターの値を1増やす',
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
            'ボタンをタップした回数を表示します',
          ),
          Text(
            '$_counter回目',
            style: const TextStyle(fontSize: 36.0), // 文字の大きさなど文字の設定をする
          ),
        ],
      ),
    );
  }
}
```

Flutterによりbuildメソッドの処理を書くと、コードに重複が生じたりインデントが深くなったり長くなったりしてコードが読みづらくなることもあるかもしれません。その場合には上記の_buildCounterContentsのように別メソッドに処理を切り出して、ウィジェットとして呼び出す書き方も可能です。このように書くことでコードの再利用がしやすくなったり、コードを短くインデントを浅く読みやすくさせることに役立ちます。

## Flutterの学び方

Dart言語は外部のデータベースやAPIなどと連携させて、Flutterで高品質な画面の描写をさせることができます。とても手軽にこれらの処理をくむことができる一方で、できることが多彩にあるために全てを学ぼうとするととても手間がかかります。

そのためまずカウンターアプリをパワーアップさせる、カレンダーを作って見るなど小さなことから始めるか、小さなことに分解できるような少し大きめなアプリを作ってみるなど何か目標の成果物を設定すると良いかもしれません。

加えて、Flutterは日本語よりも英語のコンテンツが充実しており、公式ドキュメントだけでもFlutter自体を学ぶことが簡単にできます。英語を読めずともDeepL・Google Translate・ChatGPTで翻訳したり、和訳のドキュメントを読むなども有効です。

まずは目標の成果物を作りつつFlutterでできることを学び、他の事例や他の目標の成果物を設定するなども良いかもしれません。

## まとめ

Flutterでのカウンターアプリの作り方と解説をしました。コードにより画面や処理を構築するフレームワークですがとても簡潔でやっていることも読み取りやすく、いろいろなOSにひとつのコードで対応できます。その上、外観の整ったアプリを少量のコードで作れるので、日本では決してメジャーではないものの書いていて面白いフレームワーク（言語）であると思われます。スマホ向けのアプリ作りや、多彩な環境に向けたアプリの作成、UIのデザインなどにご興味のある方はぜひFlutterも学ぶ候補の1つとして検討してみるのも良いかもしれません。

