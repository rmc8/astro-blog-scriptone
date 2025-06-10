---
title: 【Rust】Making LEDs Breathe with Raspberry Pi and Rust
description: "We'll build a simple LED lighting circuit with Raspberry Pi and control it with Rust to make the LED light up in a breathing pattern."
slug: "raspberry_pi_rust_breathing_led"
date: 2025-06-10T11:22:25.063Z
updatedDate: 2025-06-10T11:22:25.062Z
preview: "https://b.rmc-8.com/img/2025/06/10/944eda2ccf3167af821e613abc784d11.jpg"
draft: false
tags:
    - LED Blinking
    - Raspberry Pi
    - Rust
categories:
    - Programming
fmContentType: blog
---

## Overview

We'll build a simple LED blinking circuit and use Rust to control the LED in a complex manner, creating a smooth breathing effect where the LED fades in and out.

## Components

The components are as follows:

* LED x1
* 220Ω resistor x2
* Jumper wires x2

## Circuit

The configuration is a simple setup that just connects an LED and resistor to create a circuit. For details, please check the `4.1.3. Circuit` section on [this linked page](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/Analog%20%26%20PWM.html).

## Code

Please add `rppal` and `ctrlc` using cargo beforehand. Write the following in main.rs and cross-compile for Raspberry Pi.

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

This mechanism varies the brightness between 0.00 and 1.00. The initial value is 0.0. It increments by 0.01 until the brightness reaches 1.00, then it starts decrementing the brightness by 0.01. When it reaches 0, it switches back to incrementing. By repeating this process, the LED blinks smoothly like breathing.

## Operation

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">シンプルな回路でRust側で遊んだ <a href="https://t.co/zb7gMyNoqU">pic.twitter.com/zb7gMyNoqU</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1932067904910135364?ref_src=twsrc%5Etfw">June 9, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Summary

While the circuit itself is very simple, by being creative with Rust code, we can add complex functionality despite having a simple circuit. This is one effective example of combining software and hardware. Because the circuit is simple, the effects of the software are easy to understand, making it an interesting subject for learning control. It might be fun to experiment with different blinking patterns.
