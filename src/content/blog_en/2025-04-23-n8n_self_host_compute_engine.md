---
title: "Self-Hosting n8n on Compute Engine's Free Tier"
slug: "n8n_self_host_compute_engine"
description: "Utilize Compute Engine's free tier to self-host n8n. This easy process using Docker Compose allows you to set up n8n and create an environment for various automations, including generative AI."
date: 2025-04-23T23:26:26.384Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/n8n.webp"
draft: false
tags: ['n8n', 'LLM']
categories: ['Programming']
---

## Reasons for Introducing n8n

n8n is an open-source software that automates workflows similar to IFTTT. It competes with IFTTT from a workflow perspective, so it was already known among some engineers, but with the addition of features like integration with generative AI and MCP client/server functionality, it has become a very powerful option as an AI-based automation tool.

Personally, I have been running Dify on my MacBook to automate processes using generative AI, but I felt limitations with Dify, such as difficulties in API-based automation or starting processes on a trigger basis. Additionally, I had been using IFTTT, but due to price increases and restrictions on the paid plan, I became a free user, and I was looking for a tool to fill these gaps.

In this context, I learned about [n8n 100 Knocks](https://zenn.dev/qinritukou/books/n8n_100_knocks) from a Zenn book, which was my first introduction to n8n. After researching, I found that n8n could address the issues I mentioned, so I decided to self-host it on an existing Google Cloud Platform instance that was only running a Bluesky Bot and not being used as a web server. I chose to utilize its free tier for this purpose.

## Introduction Procedure

For the Compute Engine instance, I think about 1GB of memory is sufficient. So, I am using the `e2-micro` machine type. The OS is Debian. You will connect to the instance via SSH from a browser or terminal and run commands. Since n8n can be easily self-hosted using Docker, I will make use of that.

### Install Docker

First, update the existing packages.

```shell
sudo apt update
sudo apt upgrade -y
```

Next, install the necessary packages for Docker installation.

```shell
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
```

Add the official Docker GPG key.

```shell
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

Add the Docker repository and update the package list.

```shell
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

Install Docker Engine.

```shell
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

Verify that Docker is installed and running.

```shell
sudo systemctl status docker
```

If it shows `active(running)`, it is successful. Finally, add the current user to the docker group so you can run docker commands without sudo.

```shell
sudo usermod -aG docker $USER
newgrp docker
```

### Introducing n8n and Others

Use Docker Compose to introduce n8n and others.

```shell
sudo apt install docker-compose-plugin
mkdir n8n-compose
cd n8n-compose
```

Next, create a `docker-compose.yml` file.

```shell
sudo nano docker-compose.yml
```

Write the following text into the file and save it.

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

Then, create the `Caddyfile`.

```shell
sudo nano Caddyfile
```

Write the following text into it.

```text
# ===================================
# Caddyfile configuration for example.com
# ===================================

# In the following line, accurately specify the domain name set in N8N_HOST in docker-compose.yml.
# Caddy will listen for requests to this domain name.
# By default, Caddy uses Let's Encrypt to automatically enable HTTPS (on port 443) and redirect HTTP (on port 80) to HTTPS.
example.com {

  # The reverse_proxy directive forwards received requests to another server.
  # Here, it forwards to port 5678 of the n8n service (container) in the same Docker Compose network.
  # In docker-compose, the service name (n8n) can be used as an internal hostname.
  reverse_proxy n8n:5678

  # ===================================
  # Optional settings (recommended)
  # ===================================

  # Output access logs to stdout (can be checked with docker compose logs caddy).
  # Setting to debug level will output detailed logs.
  log {
    output stdout
    # level INFO # Default is INFO. For more details, use DEBUG
  }
  header {
    Strict-Transport-Security max-age=31536000; # Enforce HTTPS for 1 year in the browser
    X-Frame-Options DENY;
    X-Content-Type-Options nosniff;
    X-XSS-Protection "1; mode=block";
  }

  # Enable gzip compression (optional) - This can reduce the transfer size of text-based content and improve performance.
  # encode gzip
}
```

Once the two files are ready, running `docker compose up -d` will allow you to self-host.

### Network Settings

After `docker compose up -d`, it may take a little time for the page to become accessible. During that time, configure the firewall to allow access via HTTP and HTTPS, and open ports 80 and 443. Also, as needed, use the instance's external IP to create a DNS A record and set up the domain. Once you can access the self-hosted n8n via the specified domain, the setup is complete.

### Updating n8n

To update n8n to the latest version, pull the latest image and run `docker compose up -d`.

```shell
docker compose pull
docker compose up -d
```

## Future Plans

With Dify, you can embed Python code for external integration, but it is difficult to execute trigger-based processes, and there are limitations on API usage. Additionally, since MCP, which is currently hot, can be used as both a server and a client, it enables fully automated processes integrated with various triggers, external tools, and processes written in Python or JavaScript. So, I want to gradually build automations that make it easy to obtain domestic and international information in Japanese or simplify daily life, while learning how to use n8n. As of today, n8n 100 Knocks has only 5 entries, so I plan to watch it slowly and consider purchasing it when I need new knowledge.
