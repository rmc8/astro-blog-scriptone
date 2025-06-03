---
title: 【Rust】라즈베리 파이 학습 키트를 이용한 테이블 램프 만들기
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

## 개요

Lチカ 회로에 버튼을 추가하여 점등시키는 동작을 Rust로 작성합니다. 이전과 마찬가지로 [Freenove](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html)의 주제를 사용합니다. 키트는 [amazon](https://amzn.to/450LoZr)에서 구매할 수 있지만 범용 부품이므로 임의의 방법으로 조달해 주시기 바랍니다.

## 회로

사용할 부품은 다음과 같습니다.

* 220Ω 저항 x1
* 10kΩ 저항 x2
* 택트 스위치 x1
* LED

[링크](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html)의 `2.1.3. Circuit`에 배선 및 회로도가 있으니 도표에 따라 회로를 구축해 주십시오.

## 코드

cargo로 `rppal`과 `ctrlc`를 추가하여 코드를 작성합니다.

### ButtonSwitch

무한 루프를 사용하여 GPIO18에 전원이 공급되는지 여부에 따라 GPI18의 레벨이 HIGH인지 LOW인지 판별합니다. 버튼을 누르면 HIGH와 LOW가 전환되고, 이에 맞춰 LED 핀을 HIGH/LOW로 제어하는 ​​메커니즘입니다.

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
    // Ctrl+C가 눌리면 종료
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

ButtonSwitch는 스위치를 누르는 동안에만 전원이 켜지는 사양이었지만, TableLamp는 버튼을 누를 때마다 ON/OFF를 전환하는 코드입니다. `btn_pin.poll_interrupt(true, Some(Duration::from_millis(1)))?`로 버튼이 눌렸는지 여부를 판별합니다. 버튼이 눌렸을 때 LED 핀이 LOW 상태인지 확인하여 전원 ON/OFF를 제어합니다.

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
    // 버튼 인터럽트 설정
    btn_pin.set_interrupt(Trigger::FallingEdge, None);
    // Ctrl+C가 눌리면 종료
    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();
    ctrlc::set_handler(move || {
        r.store(false, Ordering::SeqCst);
    })?;
    println!("Waiting for button press...");
    while running.load(Ordering::SeqCst) {
        if let Some(_) = btn_pin.poll_interrupt(true, Some(Duration::from_millis(1)))? {
            // LED 상태 토글
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

## 동작 모습

ButtonSwitch만 있지만 동작 모습은 X(twitter)에 업로드되어 있습니다。

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">昨日の続き<br>ボタンのオンオフを検知して関数を実行する仕組みもあるようだけどライブラリ側にこってり書かれていそうでライブラリを呼び出す側からは仕組みが見えづらい雰囲気 <a href="https://t.co/90yU0ydIXF">pic.twitter.com/90yU0ydIXF</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1929022443189891122?ref_src=twsrc%5Etfw">June 1, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## 요약

Lチカ 회로에 버튼을 이용한 전원 제어를 추가했습니다. GPIO18과 스위치를 사용하여 회로 상태를 변경할 수 있으며, 프로그램으로 상태를 실시간으로 읽을 수 있다는 것을 알 수 있습니다. 또한, 프로그램 작성 방식에 따라 누르는 동안에만 작동하거나 누를 때마다 동작을 변경할 수도 있어, 만들고 싶은 기능에 맞춰 프로그램을 수정하는 것만으로도 동일한 회로에서 동작이 달라지는 점이 중요한 포인트라고 생각합니다. 동일한 회로라도 프로그램으로 동작 방식을 변경할 수 있어 조정이 용이하므로, 간단한 회로를 구성하면서 소프트웨어 조정을 다양하게 변경하면 학습이 깊어질 것이라고 생각했습니다. 다음에는 LED 라이트 바를 사용한 좀 더 복잡한 LED 제어를 구현할 예정입니다.
