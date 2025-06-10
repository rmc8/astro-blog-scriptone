---
title: 【Rust】Raspberry PiとRustでLEDを呼吸するように点滅させる
description: "Raspberry PiでシンプルなLEDの点灯の回路を組み、RustでLEDを呼吸するように点灯させる制御を行います。"
slug: "raspberry_pi_rust_breathing_led"
date: 2025-06-10T11:22:25.063Z
updatedDate: 2025-06-10T11:22:25.062Z
preview: "https://b.rmc-8.com/img/2025/06/10/944eda2ccf3167af821e613abc784d11.jpg"
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

シンプルなLチカの回路を組みつつRustでLEDの点灯を複雑に制御し、呼吸するようにLEDが滑らかに点滅する処理を組みます。

## 部品

部品は以下の通りです。

* LEDx1
* 220Ωの抵抗x2
* ジャンパー線x2

## 回路

構成としてはLEDと抵抗を繋ぎ回路を作るだけのシンプルな構成です。詳細は[リンクのページ](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/Analog%20%26%20PWM.html)の`4.1.3. Circuit`をご確認ください。

## コード

cargoで事前に`rppal`と`ctrlc`を追加してください。main.rsに以下を記述してRaspberry Pi向けにクロスコンパイルしてください。

```rs
use rppal::gpio::{Gpio, OutputPin};
use rppal::pwm::{Channel, Polarity, Pwm};
use std::error::Error;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

const LED_PIN: u8 = 18;
const PWM_FREQUENCY: f64 = 1000.0;

fn main() -> Result<(), Box<dyn Error>> {
    println!("Starting Breathing LED...");
    println!("Press Ctrl+C to quit");

    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();

    ctrlc::set_handler(move || {
        println!("\nExiting...");
        r.store(false, Ordering::SeqCst);
    })?;

    let gpio = Gpio::new()?;
    let mut led = gpio.get(LED_PIN)?.into_output();

    println!("Starting software PWM on GPIO pin {}", LED_PIN);

    let mut brightness = 0.0;
    let mut increasing = true;
    let step = 0.01;
    let delay = Duration::from_millis(10);

    while running.load(Ordering::SeqCst) {
        led.set_pwm_frequency(PWM_FREQUENCY, brightness)?;

        if increasing {
            brightness += step;
            if brightness >= 1.0 {
                brightness = 1.0;
                increasing = false;
            }
        } else {
            brightness -= step;
            if brightness <= 0.0 {
                brightness = 0.0;
                increasing = true;
            }
        }

        thread::sleep(delay);
    }

    led.clear_pwm()?;
    led.set_low();
    println!("Breathing LED stopped");

    Ok(())
}
```

明るさを0.00~1.00の間で変動させる仕組みです。初期値は0.0です。1.0になるまで0.01ずつ加算して、明るさが1.00になったら今度はbrightnessを0.01ずつ減算します。0になったらまた加算に切り替わります。これを繰り返し行うことでLEDが呼吸をするようになめらかに点滅します。

## 動作の様子

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">シンプルな回路でRust側で遊んだ <a href="https://t.co/zb7gMyNoqU">pic.twitter.com/zb7gMyNoqU</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1932067904910135364?ref_src=twsrc%5Etfw">June 9, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## まとめ

回路自体は非常にシンプルですが、Rustでコードを工夫することによりシンプルな回路でありながらも複雑な機能を持たせることができます。これがソフトウェアとハードウェアを組み合わせる効果的な例の1つであると思います。回路がシンプルだからこそソフトウェアの効果がわかりやすく制御の学習の題材としても面白みがありますので色々なパターンで点滅させて遊ぶのも良いかもしれません。
