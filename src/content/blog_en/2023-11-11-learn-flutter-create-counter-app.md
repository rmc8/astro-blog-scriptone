---
title: Introduction to Flutter - Creating a Counter App
slug: learn-flutter-create-counter-app
description: This is an introductory article for those new to Flutter. We will deepen your understanding of the code by creating a counter app with Flutter.
date: 2023-11-11T00:27:39.212Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

# Introduction to Flutter - Creating a Counter App

Flutter is a framework that allows you to create apps for iOS, Android, Windows, Mac, and Web with a single codebase. You can define the appearance with a small amount of code, easily setting colors, shapes, icons, row and column structures, and text display.

Thanks to its own rendering engine, it achieves the same high-quality display across all environments, and with hot reload, changes to the code are immediately reflected in the appearance, making UI building fun with Flutter. Additionally, [pub.dev](https://pub.dev/) has a lot of reusable code, offering a variety of widgets for building UI, so you can create high-quality apps with less code.

In this article, we will start with an introduction to Flutter by creating a counter app and providing explanations.

## Counter App

<iframe style="width:100%;height:600px" src="https://dartpad.dev/embed-flutter.html?id=20b0320b53be297d67712e666671e361"></iframe>

## Explanation

### Running the App

```dart
import 'package:flutter/material.dart';

void main() => runApp(App());
```

`import 'package:flutter/material.dart';` is a declaration that allows you to call the necessary code for handling Flutter in Dart. You need to include this code every time you write Flutter code.

`void main() => runApp(App());` is the code to execute the app created with Flutter. The main function serves as the starting point for Dart code execution, and runApp runs your own app. The `=>` syntax is a shorthand way to write functions when there's only one line of code inside, and it can also be written as follows:

```dart
void main() {
  runApp(App());
}
```

Either way is fine, but if the function has only one line of processing, using `=>` allows you to express it concisely in one line instead of three.

### Defining the App

```dart
class App extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const appName = 'Counter App'; // App name
    return const MaterialApp(
      title: appName, // App title
      debugShowCheckedModeBanner: false, // Hide the red debug banner in the top right
      home: CounterApp(title: appName), // App content (home page)
    );
  }
}
```

In the App class, we define the app to be executed. The starting point of a Flutter app is [MaterialApp](https://api.flutter.dev/flutter/material/MaterialApp-class.html).

MaterialApp incorporates Google's [Material Design](https://m3.material.io/), which is a set of guidelines for app appearance and design, providing functionality to build apps based on it. It also allows you to include overall app settings here, which can be called from individual content. In other words, MaterialApp is a container for creating apps with Material Design, holding the app's overall settings while registering the content to be displayed as the actual app.

By using the build method, the app defined in MaterialApp can be displayed on the screen. The App class itself does not have values that change, like a counter number. Therefore, since it has no state, it inherits from StatelessWidget to display the widget.

### Defining the Content Container

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

Next, we define the content. Here, we create the container for the counter app. CounterApp receives a title from outside and holds it as an immutable value. The reason it's not const is that it receives a value from outside, meaning it's variable but doesn't change afterward. Key is used for creating dynamic content, but it's an optional parameter. For beginners, you can skip key for now.

To create and display content with StatefulWidget, you need to use the createState method to prepare a State class that manages CounterApp. While it's hard to visualize the processing just by reading the code, think of it as essential syntax for screen rendering with StatefulWidget.

StatefulWidget differs from StatelessWidget in that it may involve changes in screen state. After creating the State with createState, you can change the values held in that class (e.g., the count in a counter app) and reflect those changes on the screen. You can also pass values held in StatefulWidget to the State class to perform screen rendering. StatelessWidget itself does not hold any changing values or processes to update the screen. The App class has no state and simply displays widgets, so it uses StatelessWidget.

### Creating the Content

```dart
class _CounterAppState extends State<CounterApp> {
  int _counter = 0; // Set the initial value of the counter and hold the count as state

  void _incrementCounter() {
    setState(() {
      _counter++; // Increment the _counter value by 1
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.blueGrey.shade200, // Set the background color of the top title bar
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center, // Center the child elements
          children: [
            const Text(
              'This displays the number of times the button has been tapped',
            ), // Display Text
            Text(
              '$_counter times',
              style: const TextStyle(fontSize: 36.0), // Set text size and style
            ), // Display Text with size 36.0
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment the counter by 1',
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

In _CounterAppState, we inherit from State<CounterApp> class to define the app's content. The content of MaterialApp is defined using Scaffold. [Scaffold](https://api.flutter.dev/flutter/material/Scaffold-class.html) handles a variety of processes, such as defining the app's title, content, and buttons for actions in the title bar.

appBar corresponds to the top title section of the screen. Using AppBar makes it easy to design the title. Alternatively, you can use Text for a simple insertion of just text.

body defines the central content of the page. Center aligns the content to the center, and Column allows you to define multiple contents in a list.

floatingActionButton defines a button that floats in the bottom right of the screen. onPressed sets the process to execute when the button is pressed, and child defines the button's icon. In onPressed, _incrementCounter increments the counter value. _CounterAppState has a member _counter, and by using setState, you can change the member's value and update the screen display accordingly with StatefulWidget.

### Code Splitting

```dart
class _CounterAppState extends State<CounterApp> {
  int _counter = 0; // Set the initial value of the counter and hold the count as state

  void _incrementCounter() {
    setState(() {
      _counter++; // Increment the _counter value by 1
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
        tooltip: 'Increment the counter by 1',
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
            'This displays the number of times the button has been tapped',
          ),
          Text(
            '$_counter times',
            style: const TextStyle(fontSize: 36.0), // Set text size and style
          ),
        ],
      ),
    );
  }
}
```

When writing the build method in Flutter, the code might become redundant, deeply indented, or long, making it hard to read. In such cases, you can extract the processing into a separate method like _buildCounterContents above and call it as a widget. This makes the code more reusable and helps keep it shorter with shallower indentation for better readability.

## How to Learn Flutter

The Dart language can integrate with external databases or APIs to enable high-quality screen rendering with Flutter. While it's very easy to handle these processes, there are so many possibilities that learning everything can be time-consuming.

Therefore, it's a good idea to start with something small, like enhancing the counter app or creating a calendar, or breaking down a slightly larger app into smaller parts and setting a goal for the output.

Additionally, Flutter has more content available in English than in Japanese, and you can easily learn about Flutter itself just from the official documentation. Even if you can't read English, you can use tools like DeepL, Google Translate, or ChatGPT for translation, or read Japanese-translated documents.

First, create a goal output while learning what Flutter can do, and then set other examples or goals as well.

## Summary

We have explained how to create a counter app with Flutter. It's a framework that builds screens and processes with code, and it's very concise and easy to understand what it's doing, while supporting various OS with a single codebase. Moreover, you can create well-designed apps with a small amount of code, so although it's not major in Japan, I think it's an interesting framework (language) to write. If you're interested in app development for smartphones, creating apps for various environments, or UI design, Flutter is definitely worth considering as one of your learning options.