---
title: flutter_riverpod_practice
description: Flutterの状態管理ライブラリflutter_riverpodの入門ガイド。簡単なビンゴゲームアプリを例ににしてriverpodの基本概念、実装方法、テスト手法を解説。コード生成を活用した効率的な状態管理の実現方法や、大規模開発におけるriverpodの利点を紹介。
date: 2024-07-17T06:21:25.128Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/riverpod.webp
draft: false
tags: ['riverpod', 'Flutter']
categories: ['Programming']
---

# 【Flutter】簡単なビンゴゲームでflutter_riverpodに入門する

Flutterでの状態管理を行うライブラリのflutter_riverpodに入門します。簡単なビンゴゲームのアプリを使い解説を行います。

## 状態管理とは

状態管理とはUIで扱うデータ（状態）を管理するための仕組み全般を指します。Flutterやwebフレームワークを扱うときに機能ごとにファイル分割がされておりコードの再利用がしやすい状態となっています。その一方でコードを複数の箇所に分散して管理する都合で、UIで扱うデータを一元管理しにくい状態となり、状態管理の仕組みがないと複雑なコードを書き複数のファイルにまたがるデータの状態をバケツリレーのように渡し共有してデータの保持をしなければなりません。実際にそのようなコードを書くと実装や保守が大変となり開発者体験も非常に悪く非効率な開発となってしまいます。こうした問題に対応し、外部の一箇所でデータの状態を保持しまた必要とするモジュールへとその状態を共有できるような仕組みが状態管理のイメージとなります。

## Flutterにおける状態管理

Flutterでは状態管理のライブラリが複数提供されており手段が多く存在しますが、そのなかでも最もポピュラーで柔軟性が高い状態管理のライブラリがriverpodです。rieverpodを使うことにより値やクロージャーを含む関数の状態、特定のクラスをインスタンス化したものを簡単にグローバルに共有しウィジェットが本来持っていた状態をriverpodに移行させたり、長いライフタイムでデータを保持させたりできます。またriverpodはコード生成による仕組みも対応しており複雑なコードを書かずとも簡単にかつテストのしやすさも保ちながら状態管理を実現できます。情報も多く一見で難易度が高そうに見えますが、コード生成の仕組みを使うことにより世間いっぱんで思わ（解説さ）れているよりも実のところ簡単で、大規模な開発にも対応しやすいので非常におすすめなパッケージです。簡単なコードでriverpodの扱い方を確認していきます。

## riverpodの種類

riverpodには３種類あります。

1. riverpod: Dartのみで使う場合に使用する
2. flutter_riverpod: Flutterと組み合わせて使う場合にflutter_riverpodを選びます。通常はこちらを選ぶことが大半です。
3. hooks_riverpod: Flutterに加えてflutter_hooksを使うときにhooks_riverpodを選びます。

Dart言語を使ってどのようなコードを書くかにより選ぶべきものが分かれますが、Dartのみであれば(1)、Flutterを使うときは(2),flutter_hooksを使うときは(3)を選ぶと覚えておけばOKです。

## 解説

libフォルダー内は以下のリンクよりご確認いただけます。

* <https://github.com/rmc8/riverpod_practice_bingo/tree/main/lib>

構成としては以下の通りです。

* `./lib/main.dart`: main関数を含むファイル
* `./lib/bingo.dart`: Bingoカードを表示するためのウィジェット
* `./lib/state/bingo_generator.dart`: Bingoカードのサイズや使用する数値を保持するためのクラス（riverpodによる状態管理付き）

### pubspec.yaml

```yaml
name: riverpod_practice_bingo
description: "riverpod practice"
publish_to: 'none' # Remove this line if you wish to publish to pub.dev
version: 1.0.0+1
environment:
  sdk: '>=3.3.1 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.3.6
  riverpod_annotation: ^2.1.1
dev_dependencies:
  build_runner: ^2.4.4
  riverpod_generator: ^2.2.3
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
flutter:
  uses-material-design: true
```

dependenciesには flutter_riverpodを含めます。また、コード生成の利用にあたって追加で riverpod_annotation やdev_dependenciesとして build_runner や riverpod_generator も追加で必要です。

### bingo_generator.dart

```dart
import 'dart:math';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'bingo_generator.g.dart';

@riverpod
class BingoGenerator extends _$BingoGenerator {
  int_size = 3;
  late List<int> _numbers;

  @override
  List<int> build() {
    _generateNumbers();
    return_numbers;
  }

  int get size => _size;

  void setSize(int newSize) {
    if (newSize >= 3 && newSize <= 9 && newSize % 2 != 0) {
      _size = newSize;
      _generateNumbers();
      state = _numbers;
    }
  }

  void generateNewCard() {
    _generateNumbers();
    state =_numbers;
  }

  void _generateNumbers() {
    final random = Random();
    final totalCells =_size * _size;

    // 1から99までの数字を使用（標準的なビンゴの範囲）
    final availableNumbers = List.generate(99, (index) => index + 1);
    availableNumbers.shuffle(random);

    // 必要な数だけ取り出す（中央のワイルドカード分を除く）
    _numbers = availableNumbers.take(totalCells - 1).toList();

    // 中央にワイルドカードを配置
    final centerIndex = _numbers.length ~/ 2;
    final temp = _numbers[centerIndex];
    _numbers[centerIndex] = -1;
    _numbers[_numbers.length - 1] = temp;
  }
}
```

BingoGeneratorクラスを主体にこちらのファイルは構成されています。flutter_riverpodを利用するにはおおまかに以下の手順が必要となります。

1. import 'package:riverpod_annotation/riverpod_annotation.dart';でパッケージをimportする
1. part '{module_name}.g.dart';をimport文の後に追加する
1. 状態管理を適用したいクラス名の前に @riverpod キーワード を追加する
1. _${ClassName}を継承する
1. dart pub run build_runner build --delete-conflicting-outputs コマンドでコード生成をする

通常のクラスなどの作成に加えて上記の5つの手順を追加することでriverpodによる状態管理の定義ができます。コード生成した後、ウィジェットからBingoGeneratorのインスタンスを読み出すことができます。

Bingoeneratorクラス自体は初期値として3x3のカードを作り、数値のリストを保持する仕組みです。setSizeを介してカードのサイズを変更しつつ新しい数値を作ります。。また、generateNewCardではカードのサイズを維持しつつカードを新しく作れるメソッドです。

generateNumbersではカードの番号をカードのサイズに合わせて重複なくランダムに作ります。ランダムな数列を作った後ワイルドカードの位置に数値 -1 を埋め込みウィジェットからif文でワイルドカードを検知する仕組みとなっています。

### bingo.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_practice_bingo/state/bingo_generator.dart';

const double BingoContentsSize = 18.0;

class BingoCard extends ConsumerWidget {
  const BingoCard({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bingoNumbers = ref.watch(bingoGeneratorProvider);
    final bingoGenerator = ref.read(bingoGeneratorProvider.notifier);

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          _buildSizeSelector(bingoGenerator),
          _buildBingoGrid(bingoNumbers, bingoGenerator.size),
          const SizedBox(height: 32.0),
          _buildNewCardButton(bingoGenerator),
        ],
      ),
    );
  }

  Widget _buildSizeSelector(BingoGenerator bingoGenerator) {
    return DropdownButton<int>(
      value: bingoGenerator.size,
      items: [3, 5, 7, 9].map(_buildDropdownMenuItem).toList(),
      onChanged: (int? newValue) {
        if (newValue != null) bingoGenerator.setSize(newValue);
      },
    );
  }

  DropdownMenuItem<int> _buildDropdownMenuItem(int value) {
    return DropdownMenuItem<int>(
      value: value,
      child: Text('カードサイズ: $value'),
    );
  }

  Widget _buildBingoGrid(List<int> bingoNumbers, int size) {
    return Container(
      margin: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.black),
      ),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: size,
        ),
        itemCount: bingoNumbers.length,
        itemBuilder: (context, index) =>_buildGridItem(bingoNumbers, index),
      ),
    );
  }

  Widget _buildGridItem(List<int> bingoNumbers, int index) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey),
      ),
      child: Center(
        child: bingoNumbers[index] == -1
            ? const Icon(Icons.star, color: Colors.yellow, size: BingoContentsSize)
            : Text(
          bingoNumbers[index].toString(),
          style: const TextStyle(fontSize: BingoContentsSize),
        ),
      ),
    );
  }

  Widget _buildNewCardButton(BingoGenerator bingoGenerator) {
    return ElevatedButton(
      onPressed: bingoGenerator.generateNewCard,
      child: const Text('新しいカードを作成'),
    );
  }
}
```

主に以下の3つで構成されています。

1. カードサイズを変更するドロップダウンメニュー
1. ビンゴカード
1. カードの再生成ボタン

また、riverpodを使う場合にはStatefullWidgetやStatelessWidgetの代わりにConsumerWidgetを使います。ConsumerWidgetを使うことで、buildメソッドに WidgetRef ref を追加でき、refを介してriverpodで管理しているインスタンスなどにアクセスできます。

#### refのメソッド

refにはwatchとreadの２種類のメソッドが使われています。

**ref.watch**: プロバイダーの状態を監視して変更が検知できる状態になっています。ビンゴカードにおいてはカード用の数値の列の状態を監視しており、変更を検知するとその状態をWidgetへと反映されます。
**ref.read**: プロバイダーの現在の値を一度読み取るだけで、その後の変更を監視しません。そのためパフォーマンスの最適化が可能です。また、 .notifierを使うとプロバイダーの状態そのものではなく、状態を管理しているオブジェクトを取得できるので、状態を変更するためのメソッドを呼び出せるようになります。カードのサイズの変更や新しいカードの作成などのためにref.readを介してオブジェクトを取得しており、その結果についてはref.watch側で監視をしています。

### main.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_practice_bingo/bingo.dart';

void main() {
  runApp(
    ProviderScope(
      child: const BingoApp(),
    ),
  );
}

class BingoApp extends StatelessWidget {
  const BingoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(
          title: const Center(
            child: Text("Bingo Game"),
          ),
        ),
        body: Container(
          alignment: Alignment.center,
          child: BingoCard(),
        ),
      ),
    );
  }
}
```

riverpodを扱う際にrunApp内にProviderScopeを追加して、riverpodによる状態管理を適用したいウィジェットを包みます。これを加えることで、ConsumerWidgetが使えるようになりriverpodによる状態管理をさまざまなウィジェットから使えるようになります。

## テスト

riverpodを使ったクラスのテストは非常に容易です。

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_practice_bingo/state/bingo_generator.dart';

void main() {
  group('BingoGenerator', () {
    test('初期状態のサイズが3であることを確認', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      expect(bingoGenerator.size, 3);
    });

    test('サイズが正しく設定されることを確認', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      bingoGenerator.setSize(5);
      expect(bingoGenerator.size, 5);
    });

    test('無効なサイズが設定されないことを確認', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      bingoGenerator.setSize(4); // 無効なサイズ
      expect(bingoGenerator.size, 3); // 変更されない
    });

    test('新しいカードが生成されることを確認', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      final initialNumbers = container.read(bingoGeneratorProvider);
      bingoGenerator.generateNewCard();
      final newNumbers = container.read(bingoGeneratorProvider);
      expect(initialNumbers, isNot(newNumbers)); // 新しい数字が生成されている
    });

    test('中央の数字が-1であることを確認', () {
      final container = ProviderContainer();
      final bingoNumbers = container.read(bingoGeneratorProvider);
      final centerIndex = bingoNumbers.length ~/ 2;
      expect(bingoNumbers[centerIndex], -1);
    });
  });

  test('生成されたカードの番号に重複がないことを確認', () {
    final container = ProviderContainer();
    final bingoGenerator = container.read(bingoGeneratorProvider.notifier);

    // サイズを9に設定
    bingoGenerator.setSize(9);

    // 30回カードを生成してチェック
    for (int i = 0; i < 30; i++) {
      bingoGenerator.generateNewCard();
      final numbers = container.read(bingoGeneratorProvider);

      // 重複チェック
      final uniqueNumbers = numbers.toSet();
      expect(uniqueNumbers.length, numbers.length,
          reason: '重複する番号があります。生成されたカード: $numbers');

      // 範囲チェック
      expect(
          numbers.where((n) => n >= 0 && n <= 100).length, numbers.length - 1,
          reason: '範囲外の番号があります。生成されたカード: $numbers');

      // ワイルドカードチェック
      expect(numbers.where((n) => n == -1).length, 1,
          reason: 'ワイルドカードの数が正しくありません。生成されたカード: $numbers');

      // 中央のセルがワイルドカードであることを確認
      final centerIndex = numbers.length ~/ 2;
      expect(numbers[centerIndex], -1,
          reason: '中央のセルがワイルドカードではありません。生成されたカード: $numbers');
    }
  });
}
```

コンテナを作り、refの時と同様にコンテナからreadを呼び出すことでメソッドにアクセスできるようになります。コンテナを作る手順がありますが通常のクラスのようにテストを記述し実行できるため保守性に優れています。

## 感想

簡単なコード例ではriverpodの利点がわかりづらいかと思いました。なぜならば、複数のウィジェットでその状態を共有させたり長い期間状態を保持させたりする状態が見えないためです。その点でいまいち状態管理の利点やわざわざコードを書く意味が見えづらいのかと思います。そうしたわかりづらさはあるのですがその一方でコードを書き動作することを確認するステップは非常に大事だと思います。規模が大きくなるにつれて状態管理の仕組みを使うメリットがわかるようになると思いますが、小さいコードで動作確認をすると実はそう複雑なことをしていないこともわかります。

また、テストコードも書きましたがriverpodによるコードのメンテナンスはシンプルで変更に強いアプリを作ることが可能です。こうした点からも大規模な開発に向いていると思います。

コード生成を使わない場合には状態管理のためのProviderを候補の中から適切に選ぶ必要がありますが、コード生成を使えば5つのステップを追加するだけで何も考えることなく状態管理の適用ができ、ConsumerWidgetからグローバルに共有されたインスタンスに容易にアクセスできてクラス内の状態も長く保持できます。大規模なアプリほどこうした仕組みを書く手間が増し、管理も億劫となるためわかりづらさがありそうな一方で実は非常に重要な仕組みなのだと思いました。

## まとめ

フレームワークによるファイル分割で複雑になりがちな状態管理をFlutterにおいてはriverpodを使うことでシンプルにできることが確認できました。一見複雑にみえわかりづらい状態管理ですが、コード生成を使い小さいコードで通常のStatefullWidgetなどとの違いを確認することで動作するまではまず確認できたかと思います。まず動作が確認でき、テストができるということを小さく確認できるだけでも非常に有用で、大きなアプリを作ったときによりその利便性が見えてくるようになります。まず入門の段階ではコードやアプリが動く状態であることを確認できたらとても嬉しいです。

