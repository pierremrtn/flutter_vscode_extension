import 'dart:math';

import 'package:confetti/confetti.dart';
import 'package:flutter/material.dart';
import 'package:web/web.dart' as web;
import 'dart:js_interop';
import 'dart:js_interop_unsafe';

@JS()
external void vscodePostMessage(JSAny param);

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String message = "No message received";

  final confettiController =
      ConfettiController(duration: const Duration(seconds: 1));

  late final listener = ((JSObject event) {
    confettiController.play();
    if (event.has("data") == false) {
      setState(() {
        message = "message doesn't have data";
      });
    }

    final data = event["data"];

    if (data.isA<JSString>()) {
      setState(() {
        message = (data as JSString).toDart;
      });
    }
  }).toJS;

  @override
  void initState() {
    super.initState();
    web.window.addEventListener("message", listener);
  }

  @override
  void dispose() {
    web.window.removeEventListener("message", listener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: ElevatedButton(
        onPressed: () {
          vscodePostMessage("This is a message from Flutter".toJS);
        },
        child: const Text("Send message to vscode"),
      ),
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Padding(
        padding: const EdgeInsets.all(0),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                const Text(
                  'Received Message:',
                ),
                Text(
                  message,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ],
            ),
            Align(
              alignment: Alignment.bottomLeft,
              child: ConfettiWidget(
                confettiController: confettiController,
                // displayTarget: true,
                blastDirection:
                    0 - (pi / 2) + (pi / 14), // radial value - RIGHT
                maxBlastForce: 80,
                minBlastForce: 30,
                emissionFrequency: 1,

                minimumSize: const Size(10, 10),

                maximumSize: const Size(30, 30),
                particleDrag: .05,
                numberOfParticles: 5,
                gravity: 0.1,
              ),
            ),
            Align(
              alignment: Alignment.bottomRight,
              child: ConfettiWidget(
                confettiController: confettiController,
                // displayTarget: true,
                blastDirection:
                    0 - (pi / 2) - (pi / 14), // radial value - RIGHT
                maxBlastForce: 80,
                minBlastForce: 30,
                emissionFrequency: 1,

                minimumSize: const Size(10, 10),

                maximumSize: const Size(30, 30),
                particleDrag: .05,
                numberOfParticles: 5,

                gravity: 0.1,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
