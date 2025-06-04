---
title: Control an LED Bar via Raspberry Pi with Rust
description: "Writing code in Rust to control a Raspberry Pi. This time, controlling an LED bar."
slug: "rust_control_led_bar_via_raspberry_pi"
date: 2025-06-04T02:29:34.196Z
updatedDate: 2025-06-04T02:29:34.195Z
preview: "https://b.rmc-8.com/img/2025/06/04/7dc8e4357c5ed81c08cc3192996fcb79.jpg"
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

This article describes how to control an LED bar (Bar Graph LED) using Rust. As in the previous article, we use the [Freenove](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/ButtonAndLEDs.html) project as the subject. The kit can be purchased on [Amazon](https://amzn.to/450LoZr), but since the parts are generic, please procure them by any method you prefer.

## Components

To control multiple LEDs, many resistors and jumper wires are used.

- LED bar x1
- 220Ω resistors x10
- Jumper wires x11

## Circuit

Please refer to the [link](https://docs.freenove.com/projects/fnk0020/en/latest/fnk0020/codes/python-lang/LED%20Bar%20Graph.html) section `3.1.3 Circuit` for the circuit diagram and wiring method.

## Code

Please add `rppal` and `ctrlc` dependencies in advance using cargo. Since multiple LEDs are used, GPIO pins are assigned to each LED and listed in an array, allowing control of pins sequentially in a for loop. The LED_PINS array is not in consecutive order to create a wave-like LED on/off effect, but the numbers are arranged in this order to control the LEDs sequentially. The mechanism reads the LEDs from the start using the index number and controls the LEDs in reverse order by reading the index backward.

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

    // Exit when Ctrl+C is pressed
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

## Operation Example

<blockquote class="twitter-tweet" data-media-max-width="560"><p lang="ja" dir="ltr">The circuit is simple<br>Rewriting in Rust! <a href="https://t.co/FxqM03esUE">pic.twitter.com/FxqM03esUE</a></p>&mdash; K (@rmc_km) <a href="https://twitter.com/rmc_km/status/1929520808118104539?ref_src=twsrc%5Etfw">June 2, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Summary

This article described the process of arranging resistors and LEDs in parallel and controlling their on/off states from Rust. This is a simple yet useful process for expressing that a process is ongoing or representing some state using an LED bar. Although the code is simple, actually writing it reveals the difficulty of controlling it as intended. Understanding precise control improves the resolution of your thinking about development and leads to performing Vibe Coding with accurate instructions. If things do not work well, it is recommended to analyze the cause of failure using generative AI effectively.