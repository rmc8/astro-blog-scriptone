---
title: 【Rust】Raspberry Piを介してLEDバーを制御する
description: "RustでRaspberry Piの制御のコードを書きます。今回はLEDバーを制御します。"
slug: "rust_control_led_bar_via_raspberry_pi"
date: 2025-06-04T02:29:34.196Z
updatedDate: 2025-06-04T02:29:34.195Z
preview: "https://b.rmc-8.com/img/2025/06/04/7dc8e4357c5ed81c08cc3192996fcb79.jpg"
draft: false
tags:
    - Lチカ
    - Raspberry Pi
    - Rust
categories:
    - Programming
fmContentType: blog
---

## 概要

LEDバー(Bar Graph LED)を制御する処理をRustで記述します。前回と同様に[Freenove](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html)の題材を使用します。キットは[amazon](https://amzn.to/450LoZr)で購入できますが汎用的な部品なので任意の方法で調達をお願いいたします。

## 部品

複数のLEDの制御をするために抵抗やジャンパー線をたくさん使います。

- LEDバーx1
- 220Ωの抵抗x10
- ジャンパー線x11

## 回路

回路図および配線方法は[リンク先](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/LED%20Bar%20Graph.html)の`3.1.3 Circuit`をご参照ください。

## コード

cargoで事前に`rppal`と`ctrlc`を追加してください。複数のLEDを使用するため各LEDにGPIOのピンを割り当ててリスト化し、for文で順番にピンの制御を扱えるようにします。波打つようにLEDの点灯・消灯をさせるため、LED_PINSは連番となっていませんが、順番にLEDを制御するためにこの数値の並びとなっています。インデックス番号を使って先頭から順番によみだし、インデックスを逆に読み出すことで復路のLEDの制御を行う仕組みです。

```rs
use rppal::gpio::{Gpio, Level};
use std::error::Error;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;

fn main() -> Result<(), Box<dyn Error>> {
    // Init
    println!("Program is starting...");
    let gpio = Gpio::new()?;
    const LED_PINS: [u8; 10] = [17, 18, 27, 22, 23, 24, 25, 2, 3, 8];
    let mut leds: Vec<_> = Vec::with_capacity(LED_PINS.len());
    for &pin_num in LED_PINS.iter() {
        let pin = gpio.get(pin_num)?.into_output();
        leds.push(pin);
    }

    // Ctrl+Cが押されたら終了
    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();
    ctrlc::set_handler(move || {
        r.store(false, Ordering::SeqCst);
    })?;

    // Main loop
    while running.load(Ordering::SeqCst) {
        for i in 0..leds.len() {
            if !running.load(Ordering::SeqCst) {
                break;
            }
            leds[i].write(Level::Low);
            sleep(Duration::from_millis(100));
            leds[i].write(Level::High);
        }
        for i in (0..leds.len()).rev() {
            if !running.load(Ordering::SeqCst) {
                break;
            }
            leds[i].write(Level::Low);
            sleep(Duration::from_millis(100));
            leds[i].write(Level::High);
        }
    }
    // Cleanup
    for led in leds.iter_mut() {
        led.set_low();
    }
    Ok(())
}
```

## 動作の様子

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">回路はシンプル<br>Rustで書き直す！ <a href="https://t.co/FxqM03esUE">pic.twitter.com/FxqM03esUE</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1929520808118104539?ref_src=twsrc%5Etfw">June 2, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## まとめ

並列に抵抗とLEDを配置してRust側で点灯と消灯の制御を行う処理を記しました。処理中であることを表現したり何らかの状態をLEDバーを使って表現したりなど、シンプルでありながらも有用な処理かと思います。コードもシンプルですが実際に書いてみると思い通りに動かす難しさもあると思います。正確に制御を理解することは開発に対する思考の解像度を高めることに繋がり、正確な指示でVibe Codingを行うことにも繋がりますのでうまくいかない場合にはぜひ生成AIを活用しつつうまくいかない原因について分析いただくと良いかと思います。