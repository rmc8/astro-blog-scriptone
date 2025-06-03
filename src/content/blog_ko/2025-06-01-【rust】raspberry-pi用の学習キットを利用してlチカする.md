---
title: 【Rust】Raspberry Pi용 학습 키트를 이용해 L치카하기
description: Freenove ultimate starter kit for raspberry pi를 이용해 Rust 언어로 LED 제어(L치카)를 해봅니다.
slug: rust_blinking_led_raspberry_pi_kit
date: 2025-06-01T03:04:01.679Z
preview: https://b.rmc-8.com/img/2025/06/01/1fbe657aa246865432be2e1d53002531.jpg
draft: false
tags:
    - L치카
    - Raspberry Pi
    - Rust
categories:
    - Programming
fmContentType: blog
---

## 개요

[Freenove ultimate starter kit for raspberry pi](https://amzn.to/3SuDUX7)를 사용해 Raspberry Pi의 전자 공작과 임베디드 프로그래밍을 해봅니다. 이번에는 첫 회이므로 LED를 빛나게 하는 제어(L치카)를 Rust로 해보겠습니다.

## 대상 독자의 수준

임베디드를 위한 Rust나 회로 설계에 대해 저 자신도 초보자 수준이므로 그 수준에 맞춰 진행하겠습니다. 브레드보드의 존재는 알고 있었지만 사용법은 몰랐고, L치카를 통해 배웠기 때문에 Rust의 기본 문법을 이해하고 그 외에는 모르는 수준이라면 비슷한 입장에서 L치카의 흐름을 배울 수 있을 것입니다. 다만, Raspberry Pi는 Linux 계열의 OS(Raspberry Pi OS(64bit) 등)를 사용하며 처리 속도나 용량의 제한이 있으므로 SSH 연결이나 CLI 조작, 그리고 영어에 익숙한 것이 바람직합니다. CLI나 영어에 익숙하지 않더라도 CLI는 문자 기반으로 조작하는 것이므로 생성 AI에 복사 및 붙여넣기로 정보를 전달해 자연어로 명령어를 생성하거나 진행 중인 작업에 대한 설명을 받아 이해할 수 있도록 지원을 받을 수 있을 것입니다.

## 사용할 물품

* Raspberry Pi 3~5(GPIO가 있는 것)
* [Freenove ultimate starter kit for raspberry pi](https://amzn.to/3SuDUX7)
  * 브레드보드, 저항, LED 등이 이 키트에 포함됩니다
* Rust를 설치한 클라이언트 머신
  * Raspberry Pi에서 개발 및 컴파일을 하면 시간이 오래 걸릴 가능성이 있으므로 다른 머신에서 개발 및 크로스 컴파일을 하면 용량이나 개발 효율 면에서 유리할 것입니다

## 브레드보드 사용법

브레드보드 사용법은 [산하야토의 자료](https://shop.sunhayato.co.jp/blogs/problem-solving/breadboard)를 참고해 주세요.

브레드보드는 Excel과 비슷하며 숫자와 알파벳으로 행과 열이 구성되어 있습니다.

|  -  |  +  |     |  a  |  b  | c   | d   |
| :-: | :-: | :-: | :-: | :-: | --- | --- |
|     |     |  1  |     |     |     |     |
|     |     |  2  |     |     |     |     |
|     |     |  3  |     |     |     |     |
|     |     |  4  |     |     |     |     |

1행은 a1, b1, c1, d1로 되어 있지만 한 행에서 배선이 되어 있어 도통되어 있습니다. 2행도 마찬가지로 a2, b2, c2, d2가 도통되어 있으며 모든 행이 같은 방식으로 도통된 상태입니다. 보드에는 구멍이 뚫려 있지만 여기에 핀이나 부품의 리드를 꽂기만 하면 납땜 없이 연결할 수 있습니다. 같은 행 내에서는 도통되어 있으므로 행을 넘어서 리드 등을 꽂음으로써 회로를 만들 수 있습니다. 행의 중앙에 홈이 있으며 좌우 대칭 구조로 되어 있지만 이 홈 부분에서 도통이 끊겨 있으므로 이 점에 주의가 필요합니다.

이번 L치카에서는 (1) GPIO의 17번 핀을 제어해 전기를 공급하고, (2) 저항으로 전류를 조정하며, (3) LED를 올바른 방향으로 꽂고, (4) LED와 GND를 연결하는 4단계로 회로를 만듭니다.

## 회로 만들기

![회로](https://b.rmc-8.com/img/2025/06/01/b1d2b212b3ea6735667c7cf9ed05d54b.jpg)

서두의 이미지처럼 GPIO와 브레드보드를 연결하기 위한 기판이나 케이블이 있으므로 먼저 브레드보드와 GPIO를 연결해 주세요. 없는 경우에는 별도로 조달하는 것이 좋지만 전자 공작 등에 익숙하지 않다면 순순히 키트를 구입하는 것이 좋을 것입니다.

다음으로 17번 핀의 위치를 찾아 같은 행 내에 점퍼 케이블을 꽂습니다. 다른 행에 점퍼 케이블을 꽂고, 그 행 내에 220Ω 저항을 꽂습니다. 저항의 반대쪽도 마찬가지로 브레드보드에 꽂고, 같은 행 내에 LED의 긴 다리를 꽂습니다. 짧은 다리는 저항이나 17번 핀에 사용된 행을 피해 꽂고, 같은 행 내에 점퍼 케이블을 꽂습니다. 꽂은 점퍼 케이블의 다른 쪽을 GND 핀이 있는 행에 꽂으면 회로가 완성됩니다. 사진에서는 LED가 점등되어 있지만 **회로만으로는 LED가 빛나지 않습니다**.

## 코드 작성

Cargo로 프로젝트를 만들고 크레이트를 도입해 코드를 작성합니다.

```bash
cargo add rppal
```

이 글에서는 rppal 버전 `0.22.1`을 사용합니다. 프로젝트 내에 `.cargo/config.toml`을 만들고 다음 내용을 추가합니다.

```toml
[target.aarch64-unknown-linux-gnu]
linker = "/opt/homebrew/bin/aarch64-linux-gnu-gcc"
```

링커는 별도로 설치해야 하며 OS에 따라 경로 등이 다르므로 주의해 주세요. Windows(WSL), Mac, Linux용 `aarch64-linux-gnu-gcc` 설치 방법은 [Perplexity](https://www.perplexity.ai/search/aarch64-linux-gnu-gccnoinsutor-XVTQpLzNQPGAZqpFPEpekA)에서 출력된 내용을 참고해 주세요.

다음으로 프로젝트 내의 `src/main.rs`에 코드를 작성합니다.

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

17번 핀을 사용하므로 LED_PIN 상수에 17을 설정합니다. `Gpio::new()?;`로 초기화를 수행해 GPIO 기능에 접근할 수 있도록 합니다. 그리고 초기화된 Gpio의 get 메서드에 핀 번호를 전달하고, into_output()의 반환 값을 얻으면 ON/OFF 전환이 가능한 형식으로 객체를 받을 수 있습니다. 후속 처리에서 전원 ON/OFF를 위해 상태가 변경되므로 변수 선언 시 `let mut`으로 가변적으로 값을 변경할 수 있도록 해야 합니다.

마지막으로 무한 루프를 정의하고, pin.write 내에서 Level::High를 전달하면 점등하고, Level::Low를 전달하면 소등합니다. sleep(Duration::from_secs(1))으로 1초간의 슬립을 정의하여, 점등과 소등이 1초씩 무한히 반복되는 구조입니다.

## 컴파일 및 Raspberry Pi로 전송

프로젝트 루트에서 `cargo build --release --target aarch64-unknown-linux-gnu`를 실행하면 Raspberry Pi(64bit)용으로 크로스 컴파일을 할 수 있습니다. 컴파일 후 `ls target/aarch64-unknown-linux-gnu/release/Blink`를 실행해 경로가 반환되면 컴파일 성공입니다.

```bash
$ ls target/aarch64-unknown-linux-gnu/release/Blink
target/aarch64-unknown-linux-gnu/release/Blink
```

컴파일이 성공하면 생성된 실행 파일을 Raspberry Pi로 전송합니다. 여기서는 macOS에서 Raspberry Pi의 데스크톱으로 Blink라는 이름으로 복사하는 예를 보여줍니다. Raspberry Pi의 IP 주소를 `your_pi_ip_address`, 사용자 이름을 `pi`로 가정합니다(사용자 환경 및 설정에 맞게 수정해 주세요).

macOS 터미널에서 프로젝트 루트 디렉토리에서 다음 scp 명령어를 실행합니다.

```bash
scp target/aarch64-unknown-linux-gnu/release/Blink pi@your_pi_ip_address:~/Desktop/Blink
```

명령어를 실행하면 설정에 따라 비밀번호를 요구할 수 있습니다. 그 경우에는 설정한 비밀번호를 입력해 주세요.

## L치카 실행

실행 파일을 Raspberry Pi로 전송한 후, SSH로 Raspberry Pi에 연결해 실행합니다.

```bash
ssh pi@your_pi_ip_address
```

로그인이 완료되면 파일 전송 대상인 Desktop으로 이동합니다.

```bash
cd ~/Desktop
```

Blink를 실행할 수 있도록 권한을 부여합니다.

```bash
chmod +x Blink
```

Blink를 실행합니다. GPIO를 직접 조작하려면 root 권한이 필요할 수 있습니다. 먼저, `./Blink`를 실행해 L치카가 가능한지 확인해 주세요. 잘 되지 않는 경우에는 다음과 같이 sudo를 붙여 실행해 보세요.

```bash
sudo ./Blink
```

성공하면 이 글에서 할 모든 작업이 완료됩니다.

## 요약

LED가 깜빡이는 것뿐이지만 다음과 같은 중요한 기초가 담겨 있습니다.

* Rust 언어로 Raspberry Pi용 프로그램을 만들기
* GPIO 제어를 프로그램으로 하기
* 브레드보드의 원리와 사용법 이해하기
* 회로 구성 방법 이해하기
* 실제로 회로 구성하기
* 임베디드 프로그램과 회로의 동작을 검증하고 완전 작동 상태 확인하기

이것들을 할 수 있게 되면 더 복잡한 회로나 제어 학습, 부품 사용법 학습을 서적뿐만 아니라 경험으로 배울 수 있어 효율이 높아집니다. [Freenove ultimate starter kit for raspberry pi](https://amzn.to/3SuDUX7)는 Python이나 Java, C 언어, Scratch용으로 코드와 문서가 제공되지만, 앞으로도 Rust로 구현을 시도하면서 회로와 임베디드에 대해 계속 학습할 예정입니다.
