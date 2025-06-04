---
title: 【Rust】Raspberry Pi를 통해 LED 바를 제어하기
description: "Rust로 Raspberry Pi 제어 코드를 작성합니다. 이번에는 LED 바를 제어합니다."
slug: "rust_control_led_bar_via_raspberry_pi"
date: 2025-06-04T02:29:34.196Z
updatedDate: 2025-06-04T02:29:34.195Z
preview: "https://b.rmc-8.com/img/2025/06/04/7dc8e4357c5ed81c08cc3192996fcb79.jpg"
draft: false
tags:
    - LED 깜빡임
    - Raspberry Pi
    - Rust
categories:
    - 프로그래밍
fmContentType: blog
---

## 개요

Rust로 LED 바(Bar Graph LED)를 제어하는 처리를 작성합니다. 이전과 마찬가지로 [Freenove](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html) 주제를 사용합니다. 키트는 [아마존](https://amzn.to/450LoZr)에서 구매할 수 있지만 범용 부품이므로 임의의 방법으로 조달해 주시기 바랍니다.

## 부품

여러 개의 LED를 제어하기 위해 저항과 점퍼선을 많이 사용합니다.

- LED 바 x1
- 220Ω 저항 x10
- 점퍼선 x11

## 회로

회로도 및 배선 방법은 [링크](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/LED%20Bar%20Graph.html)의 `3.1.3 Circuit`을 참조하십시오.

## 코드

cargo로 사전에 `rppal`과 `ctrlc`를 추가해 주세요. 여러 개의 LED를 사용하기 때문에 각 LED에 GPIO 핀을 할당하여 리스트화하고, for문으로 순서대로 핀 제어를 다룰 수 있도록 합니다. LED_PINS는 연속 번호가 아니지만, LED를 순서대로 제어하기 위해 이 숫자 배열이 되어 있습니다. 인덱스 번호를 사용해 앞에서부터 읽고, 인덱스를 역순으로 읽어 복로의 LED 제어를 수행하는 구조입니다.

```rs
use rppal::gpio::{Gpio, Level};
use std::error::Error;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread::sleep;
use std::time::Duration;

fn main() -> Result<(), Box<dyn Error>> {
    // 초기화
    println!("프로그램을 시작합니다...");
    let gpio = Gpio::new()?;
    const LED_PINS: [u8; 10] = [17, 18, 27, 22, 23, 24, 25, 2, 3, 8];
    let mut leds: Vec<_> = Vec::with_capacity(LED_PINS.len());
    for &pin_num in LED_PINS.iter() {
        let pin = gpio.get(pin_num)?.into_output();
        leds.push(pin);
    }

    // Ctrl+C가 눌리면 종료
    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();
    ctrlc::set_handler(move || {
        r.store(false, Ordering::SeqCst);
    })?;

    // 메인 루프
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
    // 정리
    for led in leds.iter_mut() {
        led.set_low();
    }
    Ok(())
}
```

## 동작 모습

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">회로는 심플<br>Rust로 다시 작성! <a href="https://t.co/FxqM03esUE">pic.twitter.com/FxqM03esUE</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1929520808118104539?ref_src=twsrc%5Etfw">June 2, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## 요약

병렬로 저항과 LED를 배치하고 Rust 쪽에서 점등과 소등 제어를 하는 처리를 작성했습니다. 처리 중임을 표현하거나 어떤 상태를 LED 바를 사용해 표현하는 등, 심플하면서도 유용한 처리라고 생각합니다. 코드도 심플하지만 실제로 작성해 보면 의도대로 동작시키는 어려움도 있을 것입니다. 정확한 제어를 이해하는 것은 개발에 대한 사고의 해상도를 높이는 데 연결되고, 정확한 지시로 Vibe Coding을 수행하는 데도 연결되므로 잘 안 될 경우에는 생성 AI를 활용해 잘 안 되는 원인에 대해 분석해 보시면 좋을 것 같습니다。