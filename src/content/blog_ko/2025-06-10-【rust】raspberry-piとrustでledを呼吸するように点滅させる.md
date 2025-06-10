---
title: 【Rust】Raspberry Pi와 Rust로 LED를 숨쉬듯이 깜빡이게 하기
description: "Raspberry Pi로 간단한 LED 점등 회로를 구성하고, Rust로 LED가 숨쉬듯이 점등되도록 제어합니다."
slug: "raspberry_pi_rust_breathing_led"
date: 2025-06-10T11:22:25.063Z
updatedDate: 2025-06-10T11:22:25.062Z
preview: "<https://b.rmc-8.com/img/2025/06/10/944eda2ccf3167af821e613abc784d11.jpg>"
draft: false
tags:
    - LED 깜빡이기
    - Raspberry Pi
    - Rust
categories:
    - Programming
fmContentType: blog
---

## 개요

간단한 LED 깜빡이기 회로를 구성하면서 Rust로 LED 점등을 복잡하게 제어하여, LED가 숨쉬듯이 부드럽게 깜빡이는 처리를 구현합니다.

## 부품

부품은 다음과 같습니다.

* LED x1
* 220Ω 저항 x2
* 점퍼선 x2

## 회로

구성은 LED와 저항을 연결하여 회로를 만드는 간단한 구성입니다. 자세한 내용은 [링크 페이지](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/Analog%20%26%20PWM.html)의 `4.1.3. Circuit`를 확인해 주세요.

## 코드

cargo로 사전에 `rppal`과 `ctrlc`를 추가해 주세요. main.rs에 다음을 작성하고 Raspberry Pi용으로 크로스 컴파일해 주세요.

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

밝기를 0.00~1.00 사이에서 변동시키는 구조입니다. 초기값은 0.0입니다. 1.0이 될 때까지 0.01씩 더하고, 밝기가 1.00이 되면 이번에는 brightness를 0.01씩 뺍니다. 0이 되면 다시 더하기로 전환됩니다. 이를 반복하여 LED가 숨쉬듯이 부드럽게 깜빡입니다.

## 동작 모습

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">シンプルな回路でRust側で遊んだ <a href="https://t.co/zb7gMyNoqU">pic.twitter.com/zb7gMyNoqU</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1932067904910135364?ref_src=twsrc%5Etfw">June 9, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## 정리

회로 자체는 매우 간단하지만, Rust로 코드를 공들여 작성함으로써 간단한 회로임에도 복잡한 기능을 갖출 수 있습니다. 이것이 소프트웨어와 하드웨어를 결합하는 효과적인 예 중 하나라고 생각합니다. 회로가 간단하기 때문에 소프트웨어의 효과를 알기 쉽고 제어 학습의 소재로도 재미있으므로 다양한 패턴으로 깜빡이게 하며 놀아보는 것도 좋을 것 같습니다.
