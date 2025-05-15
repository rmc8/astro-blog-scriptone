---
title: "[Flutter] Introduction to flutter_riverpod with a Simple Bingo Game"
slug: flutter_riverpod_practice
description: An introductory guide to Flutter's state management library flutter_riverpod. Using a simple Bingo game app as an example, it explains the basic concepts of riverpod, implementation methods, and testing techniques. It also introduces efficient state management using code generation and the advantages of riverpod in large-scale development.
date: 2024-07-17T06:21:25.128Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/riverpod.webp
draft: false
tags: ['riverpod', 'Flutter']
categories: ['Programming']
---

# [Flutter] Introduction to flutter_riverpod with a Simple Bingo Game

This introduces flutter_riverpod, a library for state management in Flutter. We will explain it using a simple Bingo game app.

## What is State Management?

State management refers to the overall mechanism for managing data (states) handled in the UI. In Flutter or web frameworks, files are divided by functionality, making code reuse easier. However, because code is distributed across multiple locations for management, it becomes difficult to centrally manage data used in the UI. Without a state management mechanism, you end up writing complex code and passing data like a bucket brigade across multiple files to maintain and share it. Writing such code makes implementation and maintenance difficult, resulting in a poor developer experience and inefficient development. To address these issues, state management is a mechanism that allows data states to be held in a single external location and shared with necessary modules.

## State Management in Flutter

In Flutter, multiple state management libraries are provided, offering many options. Among them, riverpod is the most popular and flexible state management library. By using riverpod, you can easily share values, functions including closures, or instances of specific classes globally, migrate states that widgets originally held to riverpod, or maintain data with a long lifetime. Additionally, riverpod supports code generation, allowing you to implement state management easily without writing complex code, while maintaining testability. There is a lot of information available, and it may seem difficult at first glance, but by using code generation, it is actually simpler than it appears and suitable for large-scale development, making it a highly recommended package. We will verify how to handle riverpod with simple code.

## Types of riverpod

There are three types of riverpod:

1. riverpod: Used when working only with Dart.
2. flutter_riverpod: Selected when combining with Flutter. This is usually the one to choose.
3. hooks_riverpod: Selected when using Flutter along with flutter_hooks.

Depending on the code you write in Dart, choose accordingly: (1) for Dart only, (2) for Flutter, and (3) for flutter_hooks.

## Explanation

You can check the contents inside the lib folder from the following link:

* <https://github.com/rmc8/riverpod_practice_bingo/tree/main/lib>

The structure is as follows:

* `./lib/main.dart`: File containing the main function.
* `./lib/bingo.dart`: Widget for displaying the Bingo card.
* `./lib/state/bingo_generator.dart`: Class for holding the size of the Bingo card and the numbers used (with riverpod state management).

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

Include flutter_riverpod in dependencies. For using code generation, you also need to add riverpod_annotation, as well as build_runner and riverpod_generator in dev_dependencies.

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

    // Use numbers from 1 to 99 (standard Bingo range)
    final availableNumbers = List.generate(99, (index) => index + 1);
    availableNumbers.shuffle(random);

    // Take the required number (excluding the central wildcard)
    _numbers = availableNumbers.take(totalCells - 1).toList();

    // Place the wildcard in the center
    final centerIndex = _numbers.length ~/ 2;
    final temp = _numbers[centerIndex];
    _numbers[centerIndex] = -1;
    _numbers[_numbers.length - 1] = temp;
  }
}
```

This file is mainly composed of the BingoGenerator class. To use flutter_riverpod, the following steps are roughly necessary:

1. Import 'package:riverpod_annotation/riverpod_annotation.dart';
2. Add part '{module_name}.g.dart'; after the import statement.
3. Add the @riverpod keyword before the class name you want to apply state management to.
4. Inherit from _$ {ClassName}.
5. Run the command: dart pub run build_runner build --delete-conflicting-outputs for code generation.

By adding these five steps to the normal class creation, you can define state management with riverpod. After code generation, you can read the BingoGenerator instance from the widget.

The BingoGenerator class itself creates a 3x3 card as the initial value and holds a list of numbers. It changes the card size via setSize and creates new numbers. Additionally, generateNewCard creates a new card while maintaining the card size.

generateNumbers randomly generates numbers for the card without duplicates, based on the card size. After creating a random sequence, it embeds -1 for the wildcard position, allowing detection via an if statement in the widget.

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
      child: Text('Card size: $value'),
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
      child: const Text('Create new card'),
    );
  }
}
```

It is mainly composed of the following three parts:

1. Dropdown menu to change the card size.
2. Bingo card.
3. Button to regenerate the card.

When using riverpod, use ConsumerWidget instead of StatefulWidget or StatelessWidget. By using ConsumerWidget, you can add WidgetRef ref to the build method, allowing access to instances managed by riverpod via ref.

#### ref Methods

ref has two methods: watch and read.

**ref.watch**: Monitors the provider's state and detects changes. In the Bingo card, it monitors the state of the number list for the card, and when a change is detected, it reflects that state in the Widget.
**ref.read**: Reads the provider's current value once without monitoring subsequent changes. This is useful for performance optimization. Additionally, using .notifier allows you to obtain the object managing the state, not the state itself, so you can call methods to change the state. For changing the card size or creating a new card, the object is obtained via ref.read, and the results are monitored on the ref.watch side.

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

When handling riverpod, add ProviderScope inside runApp to wrap the widgets where you want to apply riverpod state management. This enables the use of ConsumerWidget and allows riverpod state management from various widgets.

## Testing

Testing classes using riverpod is very straightforward.

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_practice_bingo/state/bingo_generator.dart';

void main() {
  group('BingoGenerator', () {
    test('Initial size is 3', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      expect(bingoGenerator.size, 3);
    });

    test('Size is set correctly', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      bingoGenerator.setSize(5);
      expect(bingoGenerator.size, 5);
    });

    test('Invalid size is not set', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      bingoGenerator.setSize(4); // Invalid size
      expect(bingoGenerator.size, 3); // No change
    });

    test('New card is generated', () {
      final container = ProviderContainer();
      final bingoGenerator = container.read(bingoGeneratorProvider.notifier);
      final initialNumbers = container.read(bingoGeneratorProvider);
      bingoGenerator.generateNewCard();
      final newNumbers = container.read(bingoGeneratorProvider);
      expect(initialNumbers, isNot(newNumbers)); // New numbers are generated
    });

    test('Center number is -1', () {
      final container = ProviderContainer();
      final bingoNumbers = container.read(bingoGeneratorProvider);
      final centerIndex = bingoNumbers.length ~/ 2;
      expect(bingoNumbers[centerIndex], -1);
    });
  });

  test('Generated card has no duplicates', () {
    final container = ProviderContainer();
    final bingoGenerator = container.read(bingoGeneratorProvider.notifier);

    // Set size to 9
    bingoGenerator.setSize(9);

    // Generate and check 30 cards
    for (int i = 0; i < 30; i++) {
      bingoGenerator.generateNewCard();
      final numbers = container.read(bingoGeneratorProvider);

      // Check for duplicates
      final uniqueNumbers = numbers.toSet();
      expect(uniqueNumbers.length, numbers.length,
          reason: 'There are duplicate numbers. Generated card: $numbers');

      // Check range
      expect(
          numbers.where((n) => n >= 0 && n <= 100).length, numbers.length - 1,
          reason: 'There are numbers out of range. Generated card: $numbers');

      // Check wildcard
      expect(numbers.where((n) => n == -1).length, 1,
          reason: 'The number of wildcards is incorrect. Generated card: $numbers');

      // Confirm the center cell is a wildcard
      final centerIndex = numbers.length ~/ 2;
      expect(numbers[centerIndex], -1,
          reason: 'The center cell is not a wildcard. Generated card: $numbers');
    }
  });
}
```

By creating a container and calling read as with ref, you can access methods. Although there is a step to create the container, you can write and run tests like normal classes, making it excellent for maintainability.

## Thoughts

I thought the advantages of riverpod might not be clear in this simple code example. This is because you cannot see states being shared across multiple widgets or maintained over a long period. In that sense, the benefits of state management and the reason for writing the code might not be immediately apparent. However, it is important to verify that the code can be written and works. As the scale grows, the advantages of using a state management mechanism become evident, but even with small code, confirming that it works shows that it is not overly complex.

Additionally, I wrote test code, and riverpod makes code maintenance simple and allows for building change-resistant apps. This also makes it suitable for large-scale development.

Without code generation, you need to select the appropriate Provider from the options for state management, but with code generation, you can apply state management by just adding five steps without thinking, easily accessing globally shared instances from ConsumerWidget and maintaining class states for a long time. For large-scale apps, writing such mechanisms can be tedious and seem unclear, but they are actually very important.

## Summary

We confirmed that state management, which can become complex due to framework-based file division, can be simplified in Flutter by using riverpod. Although state management may seem complex and unclear at first, by using code generation and verifying the differences from normal StatefulWidget with small code, we could first confirm that it works. Being able to verify that it works and can be tested is very useful, and its convenience becomes more apparent when building larger apps. At the introductory stage, it is great to confirm that the code and app are running.