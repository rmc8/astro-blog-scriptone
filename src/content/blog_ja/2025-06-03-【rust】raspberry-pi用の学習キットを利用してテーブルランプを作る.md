---
title: 【Rust】Raspberry Pi用の学習キットを利用してテーブルランプを作る
description: ""
slug: raspberry_pi_rust_table_lamp_kit
date: 2025-06-03T03:40:33.958Z
updatedDate: 2025-06-03T03:40:33.958Z
preview: https://b.rmc-8.com/img/2025/06/03/0594d26f87fdb7e13f76b5fc02e09d4e.jpg
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

Lチカの回路にボタンを追加して点灯させる動作をRustで記述します。前回と同様に[Freenove](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html)の題材を使用します。キットは[amazon](https://amzn.to/450LoZr)で購入できますが汎用的な部品なので任意の方法で調達をお願いいたします。

## 回路

使用する部品は下記の通りです。

* 220Ωの抵抗x1
* 10kΩの抵抗x2
* タクトスイッチx1
* LED

[リンク先](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html)の`2.1.3. Circuit`に配線および回路図がありますので図表に沿って回路を構築してください。

## コード

cargoで`rppal`と`ctrlc`を追加してコードを記述します。

### ButtonSwitch

無限ループを使ってGPIO18に電源が供給されいるかされていないかでGPI18のレベルがHIGHであるかLOWであるかを判別します。ボタンを押すとHIGHとLOWが切り替わり、それに併せてLEDピンをHIGH/LOWを制御する仕組みとなっています。

```rs
use rppal::gpio::{Gpio, Level};
use std::error::Error;

const LED_PIN: u8 = 17;
const BTN_PIN: u8 = 18;

fn main() -> Result<(), Box<dyn Error>> {
    println!("Program is starting...");
    let gpio = Gpio::new()?;
    let mut led_pin = gpio.get(LED_PIN)?.into_output();
    let btn_pin = gpio.get(BTN_PIN)?.into_input();
    // Ctrl+Cが押されたら終了
    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();
    ctrlc::set_handler(move || {
        r.store(false, Ordering::SeqCst);
    })?;
    loop {
        if btn_pin.is_low() {
            // led_pin.set_high();
            led_pin.write(Level::High);
            println!("Button is pressed, led turned on >>>");
        } else {
            // led_pin.set_low();
            led_pin.write(Level::Low);
            println!("Button is released, led turned off <<<");
        }
    }
}
```

### TableLamp

ButtonSwitchではスイッチを押している間にのみ電源がつく仕様でしたが、TableLampではボタンを押すごとにON/OFFを切り替えるコードとなっています。`btn_pin.poll_interrupt(true, Some(Duration::from_millis(1)))?`でボタンが押されたかどうかを判別します。ボタンが押された場合にLEDのピンがLOWの状態であるか確認して、電源のON/OFFを制御します

```rs
use rppal::gpio::{Gpio, Level, Trigger};
use std::error::Error;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

const LED_PIN: u8 = 17;
const BTN_PIN: u8 = 18;

fn main() -> Result<(), Box<dyn Error>> {
    println!("Program is starting...");
    let gpio = Gpio::new()?;
    let mut led_pin = gpio.get(LED_PIN)?.into_output();
    let mut btn_pin = gpio.get(BTN_PIN)?.into_input();
    led_pin.set_low();
    // ボタンの割り込み設定
    btn_pin.set_interrupt(Trigger::FallingEdge, None);
    // Ctrl+Cが押されたら終了
    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();
    ctrlc::set_handler(move || {
        r.store(false, Ordering::SeqCst);
    })?;
    println!("Waiting for button press...");
    while running.load(Ordering::SeqCst) {
        if let Some(_) = btn_pin.poll_interrupt(true, Some(Duration::from_millis(1)))? {
            // LEDの状態をトグル
            if led_pin.is_set_low() {
                led_pin.set_high();
                println!("Led turned on >>>");
            } else {
                led_pin.set_low();
                println!("Led turned off <<<");
            }
        }
    }
    println!("Program is finished.");
    btn_pin.clear_interrupt();
    led_pin.set_low();
    Ok(())
}

```

## 動作の様子

ButtonSwitchのみですが動作の様子をX(twitter)にアップロードしております。

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">昨日の続き<br>ボタンのオンオフを検知して関数を実行する仕組みもあるようだけどライブラリ側にこってり書かれていそうでライブラリを呼び出す側からは仕組みが見えづらい雰囲気 <a href="https://t.co/90yU0ydIXF">pic.twitter.com/90yU0ydIXF</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1929022443189891122?ref_src=twsrc%5Etfw">June 1, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## まとめ

Lチカの回路にボタンによる電源の制御を加えました。GPIO18とスイッチを使うことで回路の状態を変えることができ、プログラムで状態をリアルタイムに読み取れることがわかったかと思います。また、プログラムの書き方により押している間のみ動作させたり、押すごとに動作を変えたりなどもでき、作りたい機能に合わせてプログラムを修正するだけで同じ回路でも動作が変わる点が大事なポイントだと思います。同じ回路であってもプログラムで動作のさせ方を変えられる点で調整がしやすいので、簡単な回路を組みつつソフトウェアの調整をいろいろ変えると学びが深まるのではないかと考えました。次回はLEDライトバーを使ったもう少し複雑なLEDの制御を実装します。
