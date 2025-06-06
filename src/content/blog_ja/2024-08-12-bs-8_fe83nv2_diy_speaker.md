---
title: "BS-8とFostex FE83NV2を使ってスピーカーを自作する"
slug: "bs-8_fe83nv2_diy_speaker"
description: "BS-8エンクロージャーとFostex FE83NV2ユニットを使用したDIYスピーカーの製作過程と音質レビュー。自作の背景、組み立て方法、使用パーツ、音質特性を詳しく解説。中音域の魅力や様々な音楽ジャンルでの相性、コストパフォーマンスにも言及。手軽に楽しめるオーディオシステムを求める方に参考になるかもしれません。"
date: 2024-08-12T13:33:34.036Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/bs-8-eycatch.webp"
draft: false
tags: ['スピーカー', 'DIY', 'Topping', 'FiiO']
categories: ['Audio']
---

FOSTEXのFE83NV2とBS-8エンクロージャーを使ってスピーカーの自作をしました。

## 自作の背景

お仕事場の狭いお部屋にサブシステムを作っています。USB DACとヘッドホンアンプが一体となっているFiiO K7やToppingのパワーアンプのPA5 iiを組み合わせてコンパクトな環境で、Denon D9200でお手軽にヘッドホンを楽しんでいます。一方でスピーカーが環境に合うサイズ感のものがない状況でお手軽でお手頃なスピーカーを求めていました。候補としてDALIのSPEKTOR1を考えましたが外装の質感がしっくりこず、かといってDALIのMENUETシリーズなど高価な価格帯も求めていませんでした。また、システムが手軽な環境であるために鳴らしやすい方がよく1ユニットのスピーカーがより望ましいと考えていました。

残念ながらそんな欲張り仕様のスピーカーが市販品で納得のいく値段では存在しなかったのでやむを得ず自作することを考えました。エンクロージャーをどうするか考え調べていた時に、長岡鉄男氏が設計したBS-8が非常に有名で手軽なサイズであることを知りました。構造もシンプルで自作されている方も多くいらっしゃり、検索をしていく中でBASEでエンクロージャーを出品されているお店を見つけました。サイズはH：176mm W：130mm D：141mmとDALI MENUETより小型で１ユニットであり、集成材による木材の自然な質感が気に入りました。そのため、[KONOCO](https://store.konoco-f.com)よりエンクロージャーを購入して、BS-8と相性が良いとされているFostexの8cmのフルレンジユニットを取り付けることにしました。

* ユニット：[FE83NV2](https://amzn.to/3YIbwVM)

![parts](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/bs-8/bs-8-parts.webp)

箱は組み立て済みのものを注文しておりユニットと合わせて2万円程度でスピーカーを作っています。

## 組み立て

箱は完成した状態で届きます。バッフル板開口径はφ73mmで、内部ケーブルをBELDEN8470に変えるのみのカスタマイズをしています。裏板素材も集成材に変えるか迷ったのですが背面を日常的に見ることはなく、機能性を優先すべきだと考えMDFのままにしました。組み立てといってもスピーカーユニットに内部線材を直接はんだ付けするのみでした。はんだはSN-100Cを使っています。

![soldering](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/bs-8/bs-8-soldering.webp)

SN100Cは高音のレンジも広く低音も深くタイトルに出る少し派手目な音質のハンダです。フルレンジユニットで上下共にレンジが広いわけではないこと、中音域が滑らかで厚いことをレビューで事前に確認していたので、出音は聞いていなかったのですがSN100Cを選びました。千住金属のスパークルハンダシリーズでも無難に仕上がりそうです。手元にハンダがなく無難に扱えるものが欲しい場合にはこちらもアリだと思います。  
  
はんだ付けした後、ユニットに付属しているネジをしめたら簡単にスピーカーは組み上がります。

![up](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/bs-8/bs-8-up.webp)

## レビュー

環境は以下の通りです。

| 機材 | 名前 |
|------|------|
| プレイヤー | iPad mini + Amazon music (AirPlayを使用) |
| トランスポーター | Raspberry Pi3 + moode Audio |
| DAC | FiiO K7 |
| RCA | Belden 88760 |
| アンプ | Topping PA5 II |
| ケーブル | Zu Audio Mission |
| スピーカー | 自作スピーカー |
| 壁コンセント | FURUTECH GTX-D NCF(R) |

前回とほぼ同様ですが、スピーカーが自作品に変わりました。また、USB-DACのUSBについてiDefender+とiPowerを使って外部給電に変えています。外部給電で質の高い電源に変えるだけでUSB-DACの解像度を高められることが多いのでオススメです（モバイルバッテリーで給電も充電が必要ですが音質やパフォーマンスは良いです）。

![review](https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/article/bs-8/bs-8-comp.webp)

特筆すべきは中音域の滑らかさと厚みです。シルキーで凹むこともなくボーカルの距離感が近く聞いていて楽しい感じがします。距離感が近くても淀んでいる印象もなく、クラシックやジャズであれば優雅に柔らかく楽器の音が響きます。フルレンジだからこそ音の繋がりが自然で厚い音を楽しむことができます。そして、1ユニットなので手頃なアンプで簡単に鳴らしやすいのでお金をかけずとも手軽に鳴らせる点デメリットがあります。低音はサイズも小さいので重低音がどこどこ出るわけではないですがかといってまったく出ないわけでもありません。フロントバスレフから自然と低音が響いており重量はないもののスカスカになっているわけでもないので聞き流す用途ではとても良いと思います。バランスもいいです。高音もややレンジが狭いので打ち込み系やメタル、キラキラした音楽などには不足感がありそうですが、聞いていて疲れることはありません。レンジが上下共に狭さがありますが中音域が厚く、１ユニットで手軽に鳴らせるのでジャズやクラシックとはとても相性が良いです。R&Bもゆったり聞き流せますが少し低音のリズム感が物足りないかもしれません。アニソンやメタルには高音が物足りないと思いますが、中音で攻める聞き方や聞き流す用途では使えるので、サブシステムとしては上出来だと思います。

## まとめ

完璧な音が出るわけではないですが、中音の厚みや滑らかさ・音のグルーブ感には光るものがあります。どんな曲でも聞き流す用途に向き、ピュアオーディオととは異なる趣で音の響きを楽しめます。  
  
音を鳴らしていない時は非常にコンパクトでインテリアとして馴染み、日中は音楽を聞き流し、夜はゆったりした音楽と共に眠りつくなど手軽な使い方ができ、日常に手軽に音楽を取り入れられる良さがあります。  
  
環境全体で10万円ほどなのでオーディオをちょっと楽しんでみたい方の参考にもなるかもしれません。

