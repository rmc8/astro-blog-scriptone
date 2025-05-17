---
title: "Compute Engine의 무료 티어에 n8n을 셀프 호스팅하기"
slug: "n8n_self_host_compute_engine"
description: "Compute Engine의 무료 티어를 활용하여 n8n을 셀프 호스팅합니다. Docker Compose를 사용한 간단한 단계로 n8n을 구축하고, 생성 AI를 포함한 다양한 자동화를 실현할 수 있는 환경을 마련합니다."
date: 2025-04-23T23:26:26.384Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/n8n.webp"
draft: false
tags: ['n8n', 'LLM']
categories: ['Programming']
---

## n8n을 도입한 계기

n8n은 오픈 소스 소프트웨어로, IFTTT처럼 워크플로를 자동화할 수 있는 도구입니다. 워크플로 관점에서 IFTTT와 경쟁하고 있어서 일부 엔지니어들 사이에서 알려져 있었지만, 생성 AI와의 연동이나 MCP 클라이언트/서버 기능이 추가되어 AI를 활용한 자동화 도구로서 매우 강력한 선택지입니다.

저는 이미 MacBook에서 Dify를 실행하여 생성 AI를 사용한 처리 자동화를 하고 있지만, API를 사용한 자동화나 트리거 기반 처리의 시작이 불편하다는 점을 Dify에 대해 느꼈습니다. 또한, 지금까지 IFTTT를 사용했지만 유료 플랜의 가격 인상과 제한 때문에 무료 사용자 상태가 되었기 때문에, 이러한 빈틈을 메울 도구를 원하고 있었습니다.

그 과정에서 Zenn의 책에서 [n8n 100본 노크](https://zenn.dev/qinritukou/books/n8n_100_knocks)를 알게 되었고, 그로 인해 n8n의 존재를 처음 알게 되었습니다. n8n이 위의 빈틈을 메울 도구로 유용하다는 것을 확인했기 때문에, Google Cloud Platform에서 Bluesky의 Bot만 실행 중인 인스턴스가 있어서 웹 서버로 사용하지 않고 있는 그 인스턴스의 무료 티어를 그대로 활용하여 n8n을 셀프 호스팅하기로 했습니다.

## 도입 절차

Compute Engine의 인스턴스는 메모리가 1GB 정도면 충분하다고 생각합니다. 그래서 저는 `e2-micro`를 사용하고 있습니다. OS는 Debian입니다. 브라우저나 터미널에서 SSH로 인스턴스에 연결하여 명령어를 실행합니다. n8n의 경우 Docker를 사용하면 쉽게 셀프 호스팅할 수 있어서 감사하게도 활용하겠습니다.

### Docker를 설치하기

기존 패키지를 업데이트합니다.

```shell
sudo apt update
sudo apt upgrade -y
```

다음으로 Docker를 설치하기 위한 필요한 패키지를 설치합니다.

```shell
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
```

Docker의 공식 GPG 키를 추가합니다.

```shell
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Docker의 리포지토리를 추가하고 패키지 리스트를 업데이트합니다.

```shell
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

Docker Engine을 설치합니다.

```shell
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

Docker가 설치되어 실행 중인지 확인합니다.

```shell
sudo systemctl status docker
```

`active(running)`이라고 표시되면 성공입니다. 마지막으로 현재 사용자를 docker 그룹에 추가하여 sudo 없이 docker 명령어를 실행할 수 있게 합니다.

```shell
sudo usermod -aG docker $USER
newgrp docker
```

### n8n 등의 도입

Docker Compose를 사용하여 n8n 등을 도입합니다.

```shell
sudo apt install docker-compose-plugin
mkdir n8n-compose
cd n8n-compose
```

다음으로 `docker-compose.yml` 파일을 만듭니다.

```shell
sudo nano docker-compose.yml
```

파일에 다음 텍스트를 작성하여 저장하세요.

```yml
volumes:
  n8n_data:
  caddy_data:

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    volumes:
      - n8n_data:/home/node/.n8n
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=UserName
      - N8N_BASIC_AUTH_PASSWORD=Password
      - TZ=Asia/Tokyo
      - N8N_HOST=example.com
    restart: always

  caddy:
    image: caddy:latest
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - caddy_data:/data
      - ./Caddyfile:/etc/caddy/Caddyfile
    restart: always
```

이어 `Caddyfile`을 만듭니다.

```shell
sudo nano Caddyfile
```

다음 텍스트를 작성하세요.

```text
# ===================================
# example.com 의 Caddyfile 설정
# ===================================

# 아래 행에 docker-compose.yml에서 N8N_HOST에 지정한 도메인 이름을 정확히 기술합니다.
# Caddy는 이 도메인 이름에 대한 요청을 대기합니다.
# Caddy는 기본적으로 Let's Encrypt를 사용하여 자동으로 HTTPS(포트 443)를 설정하고,
# HTTP(포트 80) 액세스를 HTTPS로 리디렉션합니다.
example.com {

  # reverse_proxy 디렉티브는 받은 요청을 다른 서버로 전달합니다.
  # 여기서는 동일한 Docker Compose 네트워크 내의 n8n 서비스(컨테이너)의 포트 5678로 전달합니다.
  # docker-compose의 기본 설정에서는 서비스 이름(n8n)이 내부 호스트 이름으로 사용됩니다.
  reverse_proxy n8n:5678

  # ===================================
  # 옵션 설정(추천)
  # ===================================

  # 액세스 로그를 표준 출력(docker compose logs caddy로 확인 가능)으로 출력합니다.
  # debug 레벨로 하면 자세한 로그가 출력됩니다.
  log {
    output stdout
    # level INFO # 기본은 INFO. 자세히 보고 싶으면 DEBUG
  }
  header {
    Strict-Transport-Security max-age=31536000; # 브라우저에 1년 동안 HTTPS를 강제
    X-Frame-Options DENY;
    X-Content-Type-Options nosniff;
    X-XSS-Protection "1; mode=block";
  }

  # gzip 압축을 활성화합니다(선택) - 텍스트 기반 콘텐츠 전송량을 줄이고, 성능을 향상시킬 수 있습니다.
  # encode gzip
}
```

두 파일이 준비되면 `docker-compose up -d`를 실행하여 셀프 호스팅할 수 있습니다.

### 네트워크 설정

`docker-compose up -d` 후 페이지에 접근할 수 있게 될 때까지 시간이 조금 걸립니다. 그 동안 방화벽에서 HTTP, HTTPS 액세스를 허용하고, 포트 80, 443을 열어주세요. 필요에 따라 인스턴스의 외부 IP를 사용하여 DNS의 A 레코드를 만들고 도메인 설정을 해주세요. 지정된 도메인에서 셀프 호스팅한 n8n에 접근할 수 있게 되면 설정은 완료됩니다.

### n8n의 업데이트

최신 이미지를 pull하고 `docker compose up -d`를 실행하면 n8n을 최신 버전으로 업데이트할 수 있습니다.

```shell
docker compose pull
docker compose up -d
```

## 앞으로 하고 싶은 것

Dify에서는 Python 코드를 내장하여 외부와의 연동이 가능하지만, 트리거 기반 처리의 실행이 어렵고 API 사용에도 제한이 있습니다. 또한, 최근 핫한 MCP에 대해 서버로서나 클라이언트로서 활용할 수 있어서 다양한 트리거, 외부 도구, Python이나 JavaScript로 작성한 처리와 연동된 완전 자동 처리를 실현할 수 있습니다. 그래서 국내외 정보를 한국어로 쉽게 얻을 수 있게 하거나, 일상생활을 편리하게 만드는 자동화를 조금씩 구성하면서 n8n의 사용법을 공부하고 싶습니다. n8n 100본 노크도 현재 5본 상태이니 천천히 지켜보며 새로운 지식을 얻고 싶을 때 구매를 고려하고 있습니다.