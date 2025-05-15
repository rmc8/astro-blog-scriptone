---
title: n8n_self_host_compute_engine
description: Compute Engineの無料枠を活用してn8nをセルフホストします。Docker Composeを使った手軽な手順でn8nの構築ができ生成AIも含めた多様な自動化を実現する環境が整います。
date: 2025-04-23T23:26:26.384Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/n8n.webp
draft: false
tags: ['n8n', 'LLM']
categories: ['Programming']
---

# Compute Engineの無料枠にn8nをセルフホストする

## n8nを導入したきっかけ

n8nはオープンソースのソフトウェアでありIFTTTのようにワークフローを自動化できるツールです。ワークフローの観点でIFTTTと競合しているので一部のエンジニアの間では知られていたようですが、生成AIとの連携やMCPクライアント/サーバーの機能も追加されておりAIを用いた自動化ツールとして非常に強力な選択肢です。

私自身はすでにMacBook上でDifyを動かして生成AIを使った処理の自動化をしていますが、APIを使った自動化やトリガーベースでの処理の開始などが不自由なことをDifyに対して感じておりました。また、今まではIFTTTを使っていましたが有料プランの値上げや制限などもあり無料のユーザーとなったため、これらの穴を埋めるツールを欲している状況にありました。

その中でZennの書籍で[n8n 100本ノック](https://zenn.dev/qinritukou/books/n8n_100_knocks)を知り、その中でn8nの存在をはじめて知ったのでn8nについて調べました。n8nが上記の穴を埋めるツールとして有用であることが分かったため、Google Cloud PlatformでBlueskyのBotを動かすのみでWebサーバーとして使っていないインスタンスがあったので、そのインスタンスの無料枠をそのまま活用してn8nをセルフホストすることにしました。

## 導入手順

Compute Engineのインスタンスはメモリが1GB程度あればよいかと思います。なので私は`e2-micro`を使っています。OSはDebianです。ブラウザやターミナルからSSHでインスタンスに接続してコマンドを打っていきます。n8nですがDockerを使うと簡単にセルフホストできるのでありがたく活用することとします。

### Dockerをインストールする

既存のパッケージを更新します。

```shell
sudo apt update
sudo apt upgrade -y
```

次にDockerをインストールするための必要なパッケージをインストールします。

```shell
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
```

Dockerの公式GPGキーを追加します。

```shell
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Dockerのリポジトリを追加してパッケージリストを更新します。

```shell
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

Docker Engineをインストールします。

```shell
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

Dockerがインストールされて実行されていることを確認します。

```shell
sudo systemctl status docker
```

`active(running)`と表示されていれば成功です。最後に現在のユーザーをdockerグループに追加して、sudoを使わずにdockerコマンドを実行できるようにします。

```shell
sudo usermod -aG docker $USER
newgrp docker
```

### n8nなどの導入

Docker Composeを使ってn8nなどを導入します。

```shell
sudo apt install docker-compose-plugin
mkdir n8n-compose
cd n8n-compose
```

次に``を作ります。

```shell
sudo nano
```

ファイルに以下のテキストを書いて保存してください。

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

つづいて`Caddyfile`をつくります。

```shell
sudo nano Caddyfile
```

以下のテキストを書き込んでください。

```text
# ===================================
# example.com の Caddyfile 設定
# ===================================

# 以下の行に、docker-compose.ymlでN8N_HOSTに指定したドメイン名を正確に記述します。
# Caddyはこのドメイン名へのリクエストを待ち受けます。
# CaddyはデフォルトでLet's Encryptを使って自動でHTTPS化（ポート443）し、
# HTTP（ポート80）へのアクセスをHTTPSにリダイレクトします。
example.com {

  # reverse_proxy ディレクティブは、受け取ったリクエストを別のサーバーに転送します。
  # ここでは、同じDocker Composeネットワーク内のn8nサービス（コンテナ）のポート5678に転送します。
  # docker-composeのデフォルト設定では、サービス名（n8n）が内部的なホスト名として使えます。
  reverse_proxy n8n:5678

  # ===================================
  # オプション設定（推奨）
  # ===================================

  # アクセスログを標準出力（docker compose logs caddy で確認できる）に出力します。
  # debug レベルにすると詳細なログが出ます。
  log {
    output stdout
    # level INFO # デフォルトはINFO。詳細に見たい場合は DEBUG
  }
  header {
    Strict-Transport-Security max-age=31536000; # ブラウザに1年間HTTPSを強制
    X-Frame-Options DENY;
    X-Content-Type-Options nosniff;
    X-XSS-Protection "1; mode=block";
  }

  # gzip圧縮を有効にする（任意） - これにより、テキストベースのコンテンツ転送量が減り、パフォーマンスが向上する場合があります。
  # encode gzip
}
```

2つのファイルが準備できたら`docker-compose up -d`を実行するとセルフホストできます。

### ネットワークの設定

`docker-compose up -d`のあとページにアクセスできるようになるまで少し時間がかかります。その間にファイヤーウォールでHTTP, HTTPSでのアクセスをできるようにし、ポート80,443を開放してください。また必要に応じてインスタンスの外部IPを使ってDNSのAレコードをつくりドメインの設定をしてください。指定のドメインからセルフホストしたn8nにアクセスできればセットアップは完了となります。

### n8nのアップデート

最新のイメージをpullして`docker compose up -d`を実行するとn8nを最新版にアップデートできます。

```shell
docker compose pull
docker compose up -d
```

## 今後やりたいこと

DifyではPythonのコードを埋め込み外部との連携ができますが、トリガーベースの処理の実行が難しくAPIの利用にも制限があります。また、近頃ホットなMCPについてサーバーとしてもクライアントとしても活用ができるので色々なトリガーや外部ツール、PythonやJavaScriptで記述した処理と連携させた全自動の処理が実現できます。なので国内外の情報を日本語で簡単に得られるようにしたり、日常生活を楽にするような自動化を少しずつ組みながらn8nの扱いを勉強したいと思っています。n8n100本ノックも本日時点では5本なのでゆっくり見守りつつ新たなナレッジを得たいと思った時に購入しようかと考えております。

