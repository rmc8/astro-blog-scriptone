---
title: 【Rust】Raspberry Pi用の学習キットを利用してLチカする
description: Freenove ultimate starter kit for raspberry piを利用してRust言語でLED制御（Lチカ）をします。
slug: rust_blinking_led_raspberry_pi_kit
date: 2025-06-01T03:04:01.679Z
preview: https://b.rmc-8.com/img/2025/06/01/1fbe657aa246865432be2e1d53002531.jpg
draft: false
tags:
  - Lチカ
  - Raspberry Pi
  - Rust
categories:
  - Programming
fmContentType: blog
updatedDate: 2025-06-03T03:05:16.305Z
---

## 概要

[Freenove ultimate starter kit for raspberry pi](https://amzn.to/3SuDUX7)を使ってRaspberry Piの電子工作と組み込みプログラミングをします。今回は初回ですのでLEDを光らせる制御（Lチカ）をRustでやってみます。

## 対象の読者のレベル感

組み込みのためのRustや回路設計については私自身がまっさらですのでそのレベル感で進んでいきます。ブレッドボードの存在は知っていましたが使い方は知らずLチカを通じて学んだのでRustの基本文法を理解していてそのほかはわからないというレベル感であれば同じような立ち位置でLチカの流れを学べるかと思います。ただ、Raspberry PiがLinux系統のOS（Raspberry Pi OS(64bit)など）であり処理速度や容量の制限もありますのでSSH接続やCLIの操作、そして英語に馴染んでいる方が望ましいです。CLIや英語が不慣れでもCLIは文字ベースで操作するものなので、生成AIにコピーアンドペーストで情報をわたして、自然言語によってコマンドを生成したり、やっていることの解説をしてわかるようにしてもらったりなどのサポートは得られると思います。

## 使用するもの

* Raspberry Pi 3~5（GPIOがあるもの）
* [Freenove ultimate starter kit for raspberry pi](https://amzn.to/3SuDUX7)
  * ブレッドボードや抵抗、LEDなどがこのキットに含まれます
* Rustをインストールしたクライアントマシン
  * Raspberry Piで開発・コンパイルをすると時間がかかる可能性があるので別のマシンで開発・クロスコンパイルをすると容量や開発効率の観点で有利かと思います

## ブレッドボードの使い方

ブレッドボードの使い方がは[サンハヤトの資料](https://shop.sunhayato.co.jp/blogs/problem-solving/breadboard)をぜひご覧ください。

ブレッドボードはExcelと似ていて数値とアルファベットで行と列が構成されています。

|  -  |  +  |     |  a  |  b  | c   | d   |
| :-: | :-: | :-: | :-: | :-: | --- | --- |
|     |     |  1  |     |     |     |     |
|     |     |  2  |     |     |     |     |
|     |     |  3  |     |     |     |     |
|     |     |  4  |     |     |     |     |

1行目はa1, b1, c1, d1とありますが一行目で配線がされており導通しています。2行目も同様にa2, b2, c2, d2と導通しておりすべての行で同じように導通された状態です。ボードには孔が開いていますがここにピンや部品のリードを刺すだけで、半田付けすることなく接続できます。同じ行内では導通しているので行を飛び越えてリード等をさすことにより回路を作ることができます。行の中央に溝があり、左右対称の構成になっていますがこの溝の箇所で導通が途切れているのでその点は注意が必要です。

今回のLチカでは（1）GPIOの17番のピンを制御し電気を供給する、(2)抵抗で電流を調整する、(3)LEDを正しい向きで刺す、(4)LEDとGNDを接続するの4ステップで回路を作ります。

## 回路をつくる

![回路](https://b.rmc-8.com/img/2025/06/01/b1d2b212b3ea6735667c7cf9ed05d54b.jpg)

冒頭の画像のようにGPIOとブレッドボードを接続するための基板やケーブルがありますのでまずブレッドボードとGPIOを接続してください。ない場合には別途調達した方が良いと思いますが電子工作等に不慣れであれば素直にキットを買った方が良いかと思います。

次に17番ピンの箇所をさがして同じ行内にジャンパーケーブルを指します。別の行にジャンパーケーブルを刺し、その行内で220Ωの抵抗をさします。抵抗の反対側も同様にブレッドボードに差し込み、同じ行内でLEDの足の長い方を差します。足の短い方を抵抗や17番ピンで使用している行を避けて差し込み、同じ行内にジャンパーケーブルを差し込みます。差し込んだジャンパーケーブルのもう片側をGNDピンがある行に差し込むと回路は完成です。写真ではLEDが点灯していますが**回路を作ったのみではLEDは光りません**。

## コードを書く

Cargoでプロジェクトをつくりクレートを導入してコードを書きます。

```bash
cargo add rppal
```

この記事ではrppalのバージョン`0.22.1`を使用しています。プロジェクト内に`.cargo/config.toml`をつくり下記を追記します。

```toml
[target.aarch64-unknown-linux-gnu]
linker = "/opt/homebrew/bin/aarch64-linux-gnu-gcc"
```

linkerは別途インストールする必要がありOSによってパスなど異なりますのでご注意ください。Windows(WSL), Mac, Linux向けの`aarch64-linux-gnu-gcc`のインストール方法については[Perplexity](https://www.perplexity.ai/search/aarch64-linux-gnu-gccnoinsutor-XVTQpLzNQPGAZqpFPEpekA)で出力したものがありますのでご参考にお願いいたします。

次にプロジェクト内の`src/main.rs`にコードを記述します。

```rs
use rppal::gpio::{Gpio, Level};
use std::error::Error;
use std::thread::sleep;
use std::time::Duration;

const LED_PIN: u8 = 17;

fn main() -> Result<(), Box<dyn Error>> {
    println!("Program is starting...");
    let gpio = Gpio::new()?;

    let mut pin = gpio.get(LED_PIN)?.into_output();

    println!("LED will blink every 1 second.");

    loop {
        pin.write(Level::High);
        println!("LED turned on >>>");
        sleep(Duration::from_secs(1));
        pin.write(Level::Low);
        println!("LED turned off <<<");
        sleep(Duration::from_secs(1));
    }
}
```

17番ピンを使用するのでLED_PIN定数に17を設定します。`Gpio::new()?;`で初期化を行いGPIOの機能にアクセスできるようにします。そして初期化したGpioのgetメソッドにピン番号を渡して、into_output()の返り値を取得すると、ON/OFFの切り替えをできる形式でオブジェクトを受け取れます。後続の処理で電源のON/OFFのために状態が変わるため、変数の宣言の際に`let mut`として可変に値を変えられるようにする必要があります。

最後に無限ループを定義して、pin.write内でLevel::Highを渡すと点灯し、Level::Lowを渡すと消灯します。sleep(Duration::from_secs(1))で1秒間のスリープを定義しており、点灯と消灯が1秒ずつ無限に行われる仕組みです。

## コンパイルおよびRaspberry Piへの転送

プロジェクトのrootで`cargo build --release --target aarch64-unknown-linux-gnu`を実行するとRaspberry Pi(64bit)向けにクロスコンパイルができます。コンパイル後に`ls target/aarch64-unknown-linux-gnu/release/Blink`を実行してパスが返ってきたらコンパイル成功です。

```bash
$ ls target/aarch64-unknown-linux-gnu/release/Blink
target/aarch64-unknown-linux-gnu/release/Blink
```

コンパイルが成功したら、生成された実行ファイルをRaspberry Piに転送します。ここでは、macOSからRaspberry PiのデスクトップにBlinkという名前でコピーする例を示します。Raspberry PiのIPアドレスを`your_pi_ip_address`、ユーザー名を`pi`と仮定します（お手元の環境や設定に合わせて書き換えをお願いいたします）。

macOSのターミナルで、プロジェクトのrootディレクトリから以下のscpコマンドを実行します。

```bash
scp target/aarch64-unknown-linux-gnu/release/Blink pi@your_pi_ip_address:~/Desktop/Blink
```

コマンドを実行すると設定によりパスワードが求められる場合があります。その場合には設定したパスワードをご入力ください。

## Lチカの実行

実行ファイルをRaspberry Piに転送したあと、SSHでRaspberry Piに接続して実行をします。

```bash
ssh pi@your_pi_ip_address
```

ログインが完了したらファイルの転送先であるDesktopに移動します。

```bash
cd ~/Desktop
```

Blinkを実行できるように権限の付与をします。

```bash
chmod +x Blink
```

Blinkの実行をします。GPIOを直接操作するのにあたってroot権限が必要となる場合があります。まず、`./Blink`を実行してLチカができるかをご確認ください。上手く行かない場合には下記のようにsudoを付与して実行をしてみてください。

```bash
sudo ./Blink
```

成功したら本記事でやることはすべて完了となります。

## まとめ

LEDがチカチカするだけではありますが下記のように大事な基礎はつまっています。

* Rust言語でRaspberry Pi向けのプログラムをつくる
* GPIOの制御をプログラムでする
* ブレッドボードの仕組みと使い方を理解する
* 回路の組み方を理解する
* 実際に回路を組む
* 組み込みプログラムと回路の動きを検証し完動の状態を確認する

これらができることによりより複雑な回路や制御の学習、部品の扱い方の学習を書籍だけではなく体験として学ぶことができ効率があがります。[Freenove ultimate starter kit for raspberry pi](https://amzn.to/3SuDUX7)はPythonやJava、C言語、scratch向けにコードやドキュメントが提供されていますが、この後もRustでの実装を試みて行きつつ回路や組み込みについて学習を続けたいと思います。
