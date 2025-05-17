---
title: "[Flutter] Introduction to flutter_riverpod with a Simple Bingo Game"
slug: "flutter_riverpod_practice"
description: "An introductory guide to the Flutter state management library flutter_riverpod. Using a simple bingo game app as an example, we explain the basic concepts of Riverpod, implementation methods, and testing techniques. We also introduce efficient state management using code generation and the advantages of Riverpod in large-scale development."
date: 2024-07-17T06:21:25.128Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/riverpod.webp"
draft: false
tags: ['riverpod', 'Flutter']
categories: ['Programming']
---

We will introduce flutter_riverpod, a library for state management in Flutter. We will explain it using a simple bingo game app.

## What is State Management?

State management refers to the overall mechanisms for managing data (states) handled in the UI. In frameworks like Flutter or web frameworks, files are divided by functionality, making code reuse easier. However, because code is distributed across multiple locations for management, it becomes difficult to centrally manage data used in the UI. Without state management mechanisms, you end up writing complex code and passing data across multiple files like a bucket brigade to maintain and share it. Writing such code makes implementation and maintenance difficult, leading to a poor developer experience and inefficient development. To address these issues, state management provides a way to keep data states in a single external location and share them with necessary modules.

## State Management in Flutter

In Flutter, multiple state management libraries are available, offering many options. Among them, Riverpod is the most popular and flexible library for state management. By using Riverpod, you can easily share values, functions including closures, or instances of specific classes globally, migrate states that widgets originally held to Riverpod, or maintain data with a long lifetime. Additionally, Riverpod supports code generation, allowing you to implement state management easily without writing complex code, while maintaining testability. There is a lot of information available, and it might seem difficult at first glance, but by using code generation, it is actually simpler than it appears and is highly recommended for large-scale development. We will verify how to handle Riverpod with simple code.

## Types of Riverpod

There are three types of Riverpod:

1. riverpod: Used when working only with Dart.
2. flutter_riverpod: Selected when combining with Flutter. This is the most common choice.
3. hooks_riverpod: Selected when using Flutter along with flutter_hooks.

Depending on the code you write in Dart, you can choose accordingly: (1) for Dart only, (2) for Flutter, and (3) for flutter_hooks.

## Explanation

You can check the contents inside the lib folder from the following link:

* <https://github.com/rmc8/riverpod_practice_bingo/tree/main/lib>

The structure is as follows:

* `./lib/main.dart`: File containing the main function.
* `./lib/bingo.dart`: Widget for displaying the Bingo card.
* `./lib/state/bingo_generator.dart`: Class for holding the size of the Bingo card and the numbers used (with Riverpod state management).

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
  int _size = 3;
  late List<int> _numbers;

  @override
  List<int> build() {
    _generateNumbers();
    return _numbers;
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
    state = _numbers;
  }

  void _generateNumbers() {
    final random = Random();
    final totalCells = _size * _size;

    // Use numbers from 1 to 99 (standard Bingo range)
    final availableNumbers = List.generate(99, (index) => index + 1);
    availableNumbers.shuffle(random);

    // Take the required number (excluding the center wildcard)
    _numbers = availableNumbers.take(totalCells - 1).toList();

    // Place the wildcard in the center
    final centerIndex = _numbers.length ~/ 2;
    final temp = _numbers[centerIndex];
    _numbers[centerIndex] = -1;  // Wildcard
    _numbers[_numbers.length - 1] = temp;  // Adjust the last element
  }
}
```

This file is mainly composed of the BingoGenerator class. To use flutter_riverpod, the following steps are roughly necessary:

1. Import 'package:riverpod_annotation/riverpod_annotation.dart';
2. Add 'part '{module_name}.g.dart';' after the import statement;
3. Add the @riverpod keyword before the class name you want to apply state management to;
4. Inherit from _$ {ClassName};
5. Run the command: dart pub run build_runner build --delete-conflicting-outputs for code generation.

By adding these five steps to the normal class creation, you can define state management with Riverpod. After code generation, you can read the BingoGenerator instance from widgets.

The BingoGenerator class itself creates a 3x3 card as the initial value and maintains a list of numbers. It allows changing the card size via setSize while generating new numbers. Additionally, generateNewCard creates a new card while maintaining the card size.

generateNumbers generates random numbers for the card based on the card size without duplicates. After creating a random sequence, it embeds -1 for the wildcard position, allowing detection via if statements in the widget.

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

  // ... (rest of the code remains the same as in the original, but translated descriptions)
}
```

It is mainly composed of the following three parts:

1. Dropdown menu to change the card size
2. Bingo card
3. Button to regenerate the card

When using Riverpod, use ConsumerWidget instead of StatefulWidget or StatelessWidget. By using ConsumerWidget, you can add WidgetRef ref to the build method, allowing access to instances managed by Riverpod via ref.

#### ref Methods

ref has two methods: watch and read.

**ref.watch**: Monitors the provider's state and detects changes. In the Bingo card, it monitors the array of numbers for the card, reflecting changes to the widget when detected.
**ref.read**: Reads the provider's current value once without monitoring subsequent changes, which is useful for performance optimization. Using .notifier allows you to get the object managing the state, not the state itself, so you can call methods to change the state. For changing the card size or creating a new card, we obtain the object via ref.read and monitor it with ref.watch.

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

When handling Riverpod, wrap the widget where you want to apply Riverpod state management with ProviderScope inside runApp. This enables the use of ConsumerWidget and allows Riverpod state management from various widgets.

## Testing

Testing classes using Riverpod is very straightforward.

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_practice_bingo/state/bingo_generator.dart';

// ... (test code as in the original)
```

By creating a container and calling read as with ref, you can access methods. Although there is a step to create the container, you can write and run tests like normal classes, making it excellent for maintainability.

## Thoughts

In this simple code example, the advantages of Riverpod might not be clear. This is because you cannot see states being shared across multiple widgets or maintained over a long period. Thus, the benefits of state management and the reason for writing the code might not be apparent. However, verifying that the code works is very important. As the scale grows, the advantages of state management mechanisms become evident, but even with small code, confirming that it works shows that it's not overly complex.

Additionally, since we wrote test code, Riverpod enables simple maintenance and the creation of change-resilient apps. This makes it suitable for large-scale development.

Without code generation, you need to select the appropriate Provider from the options for state management, but with code generation, you can apply state management by just adding five steps without thinking, easily accessing globally shared instances from ConsumerWidget and maintaining class states for a long time. For large apps, writing such mechanisms can be tedious, but they are actually very important despite the initial confusion.

## Summary

We confirmed that state management, which can become complex due to framework-based file division, can be simplified in Flutter by using Riverpod. Although state management may seem complex and hard to understand at first, by using code generation and verifying the differences from normal StatefulWidget with small code, we could first confirm that it works. Being able to verify that it runs and can be tested is extremely useful, and its convenience becomes more apparent when building larger apps. At the introductory stage, it's great if you can confirm that the code and app are working.