---
title: "【Flutter】간단한 빙고 게임으로 flutter_riverpod에 입문하기"
slug: "flutter_riverpod_practice"
description: "Flutter의 상태 관리 라이브러리 flutter_riverpod의 입문 가이드. 간단한 빙고 게임 앱을 예로 하여 riverpod의 기본 개념, 구현 방법, 테스트 기법을 설명합니다. 코드 생성을 활용한 효율적인 상태 관리 실현 방법과 대규모 개발에서의 riverpod의 장점을 소개합니다."
date: 2024-07-17T06:21:25.128Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/riverpod.webp"
draft: false
tags: ['riverpod', 'Flutter']
categories: ['Programming']
---

Flutter에서의 상태 관리를 위한 라이브러리인 flutter_riverpod에 입문합니다. 간단한 빙고 게임 앱을 사용하여 설명합니다.

## 상태 관리란

상태 관리란 UI에서 다루는 데이터(상태)를 관리하기 위한 메커니즘 전체를 가리킵니다. Flutter나 웹 프레임워크를 다룰 때 기능별로 파일을 분할하여 코드의 재사용이 용이한 상태가 됩니다. 그와 동시에 코드를 여러 위치에 분산하여 관리하기 때문에 UI에서 다루는 데이터를 일원화하기 어려운 상태가 되며, 상태 관리 메커니즘이 없으면 복잡한 코드를 작성하고 여러 파일에 걸쳐 데이터를 버킷 릴레이처럼 전달하여 공유하며 데이터를 유지해야 합니다. 실제로 그런 코드를 작성하면 구현과 유지보수가 어려워지며 개발자 경험도 매우 나빠지고 비효율적인 개발이 됩니다. 이러한 문제를 해결하기 위해 외부의 한 곳에서 데이터의 상태를 유지하고 필요로 하는 모듈에 그 상태를 공유할 수 있는 메커니즘이 상태 관리의 이미지입니다.

## Flutter에서의 상태 관리

Flutter에서는 상태 관리 라이브러리가 여러 개 제공되어 수단이 많습니다만, 그 중에서도 가장 인기 있고 유연성이 높은 상태 관리 라이브러리가 riverpod입니다. riverpod를 사용하면 값이나 클로저를 포함한 함수의 상태, 특정 클래스를 인스턴스화한 것을 쉽게 글로벌하게 공유하여 위젯이 원래 가지고 있던 상태를 riverpod로 이전시키거나 긴 라이프타임으로 데이터를 유지할 수 있습니다. 또한 riverpod는 코드 생성 메커니즘도 지원하여 복잡한 코드를 작성하지 않고도 간단하게 테스트의 용이성을 유지하면서 상태 관리를 실현할 수 있습니다. 정보도 많고 일견 난이도가 높아 보이지만, 코드 생성 메커니즘을 사용하면 세상이 생각하는 것보다 실제로 쉽고 대규모 개발에도 대응하기 쉽기 때문에 매우 추천하는 패키지입니다. 간단한 코드로 riverpod의 사용법을 확인해 보겠습니다.

## riverpod의 종류

riverpod에는 3종류가 있습니다.

1. riverpod: Dart만 사용하는 경우에 사용합니다.
2. flutter_riverpod: Flutter와 함께 사용하는 경우에 flutter_riverpod를 선택합니다. 보통은 이쪽을 선택하는 경우가 대부분입니다.
3. hooks_riverpod: Flutter에 추가로 flutter_hooks를 사용할 때 hooks_riverpod를 선택합니다.

Dart 언어를 사용하여 어떤 코드를 작성할지에 따라 선택해야 할 것이 나뉘지만, Dart만이라면 (1), Flutter를 사용할 때는 (2), flutter_hooks를 사용할 때는 (3)을 선택하면 OK입니다.

## 설명

lib 폴더 내는 다음 링크에서 확인할 수 있습니다.

* <https://github.com/rmc8/riverpod_practice_bingo/tree/main/lib>

구성은 다음과 같습니다.

* `./lib/main.dart`: main 함수를 포함한 파일
* `./lib/bingo.dart`: Bingo 카드를 표시하기 위한 위젯
* `./lib/state/bingo_generator.dart`: Bingo 카드의 크기나 사용할 숫자를 유지하기 위한 클래스(riverpod에 의한 상태 관리 포함)

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

dependencies에는 flutter_riverpod를 포함합니다. 또한, 코드 생성을 이용하기 위해 추가로 riverpod_annotation이나 dev_dependencies로서 build_runner와 riverpod_generator도 추가로 필요합니다.

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

BingoGenerator 클래스를 중심으로 이 파일은 구성되어 있습니다. flutter_riverpod를 이용하려면 대략적으로 다음의 단계를 필요로 합니다.

1. import 'package:riverpod_annotation/riverpod_annotation.dart';로 패키지를 import합니다.
1. part '{module_name}.g.dart';를 import 문 뒤에 추가합니다.
1. 상태 관리를 적용하고 싶은 클래스 이름 앞에 @riverpod 키워드를 추가합니다.
1. _${ClassName}을 상속합니다.
1. dart pub run build_runner build --delete-conflicting-outputs 명령으로 코드 생성을 합니다.

보통의 클래스 등의 생성에 추가하여 위의 5개의 단계를 추가하면 riverpod에 의한 상태 관리의 정의가 됩니다. 코드 생성 후, 위젯에서 BingoGenerator의 인스턴스를 읽을 수 있습니다.

BingoGenerator 클래스 자체는 초기값으로 3x3의 카드를 만들고, 숫자의 리스트를 유지하는 메커니즘입니다. setSize를 통해 카드의 크기를 변경하면서 새로운 숫자를 만듭니다. 또한, generateNewCard에서는 카드의 크기를 유지하면서 카드를 새로 만들 수 있는 메서드입니다.

generateNumbers에서는 카드의 번호를 카드의 크기에 맞게 중복 없이 랜덤하게 만듭니다. 랜덤한 수열을 만든 후 와일드카드의 위치에 숫자 -1을 삽입하여 위젯에서 if 문으로 와일드카드를 감지하는 메커니즘입니다.

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

주로 다음의 3가지로 구성되어 있습니다.

1. 카드 크기를 변경하는 드롭다운 메뉴
1. 빙고 카드
1. 카드의 재생성 버튼

또한, riverpod를 사용할 때는 StatefulWidget이나 StatelessWidget 대신 ConsumerWidget를 사용합니다. ConsumerWidget를 사용하면 build 메서드에 WidgetRef ref를 추가할 수 있고, ref를 통해 riverpod로 관리하는 인스턴스 등에 접근할 수 있습니다.

#### ref의 메서드

ref에는 watch와 read의 2종류의 메서드가 사용되고 있습니다.

**ref.watch**: 프로바이더의 상태를 감시하여 변경이 감지되는 상태가 됩니다. 빙고 카드에서는 카드용 숫자 열의 상태를 감시하고 있으며, 변경을 감지하면 그 상태를 위젯에 반영됩니다.
**ref.read**: 프로바이더의 현재 값을 한 번 읽어들이는 것으로, 그 후의 변경을 감시하지 않습니다. 따라서 성능 최적화가 가능합니다. 또한, .notifier를 사용하면 프로바이더의 상태 그 자체가 아니라 상태를 관리하는 객체를 얻을 수 있으므로 상태를 변경하기 위한 메서드를 호출할 수 있습니다. 카드의 크기 변경이나 새로운 카드의 생성 등을 위해 ref.read를 통해 객체를 얻고 있으며, 그 결과에 대해서는 ref.watch 측에서 감시를 하고 있습니다.

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

riverpod를 다룰 때 runApp 안에 ProviderScope를 추가하여 riverpod에 의한 상태 관리를 적용하고 싶은 위젯을 감쌀 수 있습니다. 이를 추가하면 ConsumerWidget가 사용 가능해지며 riverpod에 의한 상태 관리를 다양한 위젯에서 사용할 수 있습니다.

## 테스트

riverpod를 사용한 클래스의 테스트는 매우 쉽습니다.

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_practice_bingo/state/bingo_generator.dart';

void main() {
  group('BingoGenerator', () {
    test('초기 상태의 크기가 3인 것을 확인', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      expect(bingoGenerator.size, 3);
    });

    test('크기가 올바르게 설정되는 것을 확인', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      bingoGenerator.setSize(5);
      expect(bingoGenerator.size, 5);
    });

    test('잘못된 크기가 설정되지 않는 것을 확인', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      bingoGenerator.setSize(4); // 잘못된 크기
      expect(bingoGenerator.size, 3); // 변경되지 않음
    });

    test('새로운 카드가 생성되는 것을 확인', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      final initialNumbers = container.read(bingoGeneratorProvider);
      bingoGenerator.generateNewCard();
      final newNumbers = container.read(bingoGeneratorProvider);
      expect(initialNumbers, isNot(newNumbers)); // 새로운 숫자가 생성됨
    });

    test('중앙의 숫자가 -1인 것을 확인', () {
      final container = ProviderContainer();
      final bingoNumbers = container.read(bingoGeneratorProvider);
      final centerIndex = bingoNumbers.length ~/ 2;
      expect(bingoNumbers[centerIndex], -1);
    });
  });

  test('생성된 카드의 번호에 중복이 없는 것을 확인', () {
    final container = ProviderContainer();
    final bingoGenerator = container.read(bingoGeneratorProvider.notifier);

    // 크기를 9로 설정
    bingoGenerator.setSize(9);

    // 30회 카드를 생성하여 체크
    for (int i = 0; i < 30; i++) {
      bingoGenerator.generateNewCard();
      final numbers = container.read(bingoGeneratorProvider);

      // 중복 체크
      final uniqueNumbers = numbers.toSet();
      expect(uniqueNumbers.length, numbers.length,
          reason: '중복하는 번호가 있습니다. 생성된 카드: $numbers');

      // 범위 체크
      expect(
          numbers.where((n) => n >= 0 && n <= 100).length, numbers.length - 1,
          reason: '범위 외의 번호가 있습니다. 생성된 카드: $numbers');

      // 와일드카드 체크
      expect(numbers.where((n) => n == -1).length, 1,
          reason: '와일드카드의 수가 올바르지 않습니다. 생성된 카드: $numbers');

      // 중앙의 셀이 와일드카드인 것을 확인
      final centerIndex = numbers.length ~/ 2;
      expect(numbers[centerIndex], -1,
          reason: '중앙의 셀이 와일드카드가 아닙니다. 생성된 카드: $numbers');
    }
  });
}
```

컨테이너를 만들고, ref의 경우와 마찬가지로 컨테이너에서 read를 호출하여 메서드에 접근할 수 있습니다. 컨테이너를 만드는 단계를 있지만 보통의 클래스처럼 테스트를 작성하고 실행할 수 있으므로 유지보수성이 우수합니다.

## 감상

간단한 코드 예제에서는 riverpod의 장점이 잘 보이지 않을 수 있었습니다. 왜냐하면 여러 위젯에서 그 상태를 공유하거나 긴 기간 상태를 유지하는 상태가 보이지 않기 때문입니다. 그 점에서 상태 관리의 장점이나 굳이 코드를 작성하는 의미가 잘 보이지 않을 수 있습니다. 그런 모호함은 있지만 그 반면에 코드를 작성하고 동작하는 것을 확인하는 단계는 매우 중요하다고 생각합니다. 규모가 커질수록 상태 관리 메커니즘을 사용하는 이점이 보일 텐데, 작은 코드로 동작 확인을 하면 실제로 그렇게 복잡한 것을 하지 않는다는 것도 알 수 있습니다.

또한, 테스트 코드도 작성했지만 riverpod에 의한 코드의 유지보수는 간단하고 변경에 강한 앱을 만들 수 있습니다. 이러한 점에서도 대규모 개발에 적합하다고 생각합니다.

코드 생성을 사용하지 않는 경우에는 상태 관리のための Provider를 후보 중에서 적절히 선택해야 하지만, 코드 생성을 사용하면 5개의 단계를 추가하는 것만으로 아무것도 생각하지 않고 상태 관리를 적용할 수 있고, ConsumerWidget에서 글로벌하게 공유된 인스턴스에 쉽게 접근할 수 있으며 클래스 내의 상태도 오래 유지할 수 있습니다. 대규모 앱일수록 이런 메커니즘을 작성하는 수고가 증가하고 관리도 귀찮아지기 때문에 모호함이 있을 법한 반면에 실제로 매우 중요한 메커니즘이라고 생각했습니다.

## 요약

프레임워크에 의한 파일 분할로 복잡해지기 쉬운 상태 관리를 Flutter에서는 riverpod를 사용하여 간단하게 할 수 있다는 것을 확인했습니다. 일견 복잡해 보이고 모호한 상태 관리지만, 코드 생성을 사용하고 작은 코드로 보통의 StatefulWidget 등과의 차이를 확인하여 동작하는 것을 먼저 확인할 수 있었습니다. 먼저 동작이 확인되고 테스트가 가능하다는 것을 작게 확인할 수만 있어도 매우 유용하며, 큰 앱을 만들 때 그 편리성을 더 볼 수 있게 됩니다. 먼저 입문 단계에서는 코드나 앱이 동작하는 상태를 확인할 수 있으면 매우 기쁩니다.