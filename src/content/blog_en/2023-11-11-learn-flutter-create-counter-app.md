---
title: "Introduction to Flutter - Creating a Counter App"
slug: "learn-flutter-create-counter-app"
description: "This is an introductory article for those new to Flutter app development. We will deepen your understanding of the code by creating a counter app in Flutter."
date: 2023-11-11T00:27:39.212Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/FlutterEyecatch.webp"
draft: false
tags: ['Flutter', 'Dart']
categories: ['Programming']
---

Flutter is a framework that allows you to build apps for iOS, Android, Windows, Mac, and Web with a single codebase. It enables you to define the UI with a minimal amount of code, including settings for colors, shapes, icons, row and column structures, and text display.

Thanks to its own rendering engine, Flutter achieves consistent high-quality display across all environments. It also features hot reload, which immediately reflects code changes in the UI, making the process of building interfaces enjoyable. Additionally, [pub.dev](https://pub.dev/) offers a wealth of reusable code packages, providing a variety of widgets for UI construction, allowing you to build high-quality apps with less code.

In this article, we will start with an introduction to Flutter by creating a counter app and providing explanations.

## Counter App

<iframe style="width:100%;height:600px" src="https://dartpad.dev/embed-flutter.html?id=20b0320b53be297d67712e666671e361"></iframe>

## Explanation

### Running the App

```dart
import 'package:flutter/material.dart';

void main() => runApp(App());
```

`import 'package:flutter/material.dart';` is a declaration that allows you to access the necessary code for working with Flutter in Dart. You will include this code every time you write Flutter code.

`void main() => runApp(App());` is the code to execute the app you've built with Flutter. The main function serves as the entry point for Dart code execution, and runApp runs your custom app. The `=>` syntax is a shorthand way to write a function when it contains only one line of code, and it can also be written as follows:

```dart
void main() {
  runApp(App());
}
```

Either style is fine, but if the function has only one line, using `=>` makes the code more concise and expresses the process in a single line.

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

The App class defines the app to be executed. First, the starting point of a Flutter app is [MaterialApp](https://api.flutter.dev/flutter/material/MaterialApp-class.html).

MaterialApp incorporates Google's [Material Design](https://m3.material.io/), which provides features for building apps with specific aesthetics and design principles. It also allows you to include overall app settings, which can be accessed from individual content. In other words, MaterialApp is a container for creating apps based on Material Design, holding app-wide settings while registering the actual content to be displayed.

By using the build method, you can display the app defined in MaterialApp on the screen. The App class itself does not have any changing values, like a counter number, so it inherits from StatelessWidget to display widgets.

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

Next, we define the content. Here, we create the container for the counter app. CounterApp receives a title from outside and holds it as an immutable value. The reason it's not const is that it receives a value from outside, which is variable at that point but doesn't change afterward. Key is used for creating dynamic content but is an optional parameter here. For beginners, you can skip details about Key for now.

To create and display content with StatefulWidget, you need to use the createState method to prepare a State class that manages CounterApp. While it may be hard to visualize from the code alone, think of it as essential syntax for rendering screens with StatefulWidget.

StatefulWidget differs from StatelessWidget in that it can involve changes in screen state. After creating the State with createState, you can change values held in that class (such as the count in a counter app) and reflect those changes on the screen. You can also pass values held in StatefulWidget to the State class to handle screen rendering. StatelessWidget itself does not hold any changing values or processes to update the screen. Since the App class has no state and simply displays widgets, it uses StatelessWidget.

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
        backgroundColor: Colors.blueGrey.shade200, // Set the background color for the top title bar
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
              style: const TextStyle(fontSize: 36.0), // Set text styles like size
            ), // Display Text with size 36.0
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment the counter value by 1',
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

In _CounterAppState, we inherit from State<CounterApp> to define the app's content. The content of MaterialApp is defined using [Scaffold](https://api.flutter.dev/flutter/material/Scaffold-class.html). Scaffold handles various processes related to the app, such as defining the title, content, and buttons in the title bar for actions.

appBar corresponds to the top title section of the screen. Using AppBar makes it easy to design the title. Alternatively, you could use Text for a simple text-only insertion.

body defines the central content of the page. Center aligns the content to the center, and Column allows you to define multiple contents in a list.

floatingActionButton defines a button that floats in the bottom right of the screen. onPressed sets the action to execute when the button is pressed, and child defines the button's icon. In onPressed, _incrementCounter increments the counter value. _CounterAppState has a member _counter, and by using setState, you can change the member's value and update the screen display accordingly with StatefulWidget.

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
        tooltip: 'Increment the counter value by 1',
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
            style: const TextStyle(fontSize: 36.0), // Set text styles like size
          ),
        ],
      ),
    );
  }
}
```

When writing the build method in Flutter, the code might become redundant, deeply indented, or lengthy, making it hard to read. In such cases, you can extract processes into separate methods like the above _buildCounterContents and call them as widgets. This approach makes code reusable and helps keep it shorter and easier to read with shallower indentation.

## How to Learn Flutter

The Dart language allows you to integrate with external databases or APIs and create high-quality screen rendering with Flutter. While it's very straightforward, the wide range of capabilities can make learning everything time-consuming.

Therefore, it's a good idea to start small, such as enhancing the counter app or creating a calendar, or break down a slightly larger app into smaller parts and set a goal for the output. Additionally, Flutter has more English content than Japanese, and you can easily learn it from the official documentation alone. Even if you're not comfortable with English, you can use tools like DeepL, Google Translate, or ChatGPT for translation, or read translated documents.

You might first create a goal output while learning what Flutter can do, and then look at other examples or set new goals.

## Summary

We have explained how to create a counter app in Flutter. It's a framework for building screens and processes with code, and it's concise, easy to understand, and works across various OSes with a single codebase. Moreover, you can create well-designed apps with a small amount of code, making it an interesting framework (and language) that's not yet mainstream in Japan. If you're interested in app development for smartphones, apps for multiple environments, or UI design, consider Flutter as one of your learning options.