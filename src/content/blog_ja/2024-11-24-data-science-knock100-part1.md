---
title: "データサイエンス100本ノックをPandas・Polars・SQLで解く(#1-#10)"
slug: "data-science-knock100-part1"
description: "Python(Polars/Pandas)とSQLでデータサイエンス100本ノックの問１から問１０まで解答します。"
date: 2024-11-24T09:02:29.266Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['データサイエンス', 'Python']
categories: ['Programming']
---

 データサイエンス100本ノックをPython(Pandas/Polars)とSQLで解きます。

## データサイエンス100本ノック

この教材はデータサイエンス協会が[GitHub](https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess?tab=readme-ov-file)上で公開しているものです。データサイエンス向けに架空のデータを加工しながらプログラミング言語を用いた統計の手法やSklearnなどによる機械学習の手法を学べます。

### なぜ解くのか

個人的な動機になりますので読み飛ばしてもらっても大丈夫です。ただ、どのように活用したいのか・なぜ解くのかが不明瞭な場合には参考程度にお読みくださいましたらと思います。  

2024年11中旬のうちにはとくにデータサイエンスのデの字もなく、実のところデータサイエンスを学ぶ気がありませんでした。その中でもやろうと思った理由が2つあります。1つ目としては時間に余裕ができたことです。サイトの更新もWebアプリの部分以外はせずに好き放題にプログラミングをして過ごしていました。その結果としてついにやりたいことややるべきことが溢れかえってしまい、優先度をつけて仕分けした結果、ページを更新する時間とデータサイエンスを学ぶ時間を確保できるようになりました。ただ、これだけでは理由が弱く2つ目となります。お仕事でプログラミングをしながら業務の管理・改善をしていたところテックを駆使して問題を解決するスキルとともに調整力や管理力など評価され、成り行きでPM系職種になってしまいました。PMとなるとロードマップを作り物事を動かす計画をたて、方針を伝え向かうべき方向に動機づけを行い目標を計画的に達成しアウトプットやアウトカムを出さなければなりません。過程として関係者に動いてもらったり、成果の評価をしてもらったり、改善の活動をしたりするためには数値化が極めて大事です。なんらかの背景を持つ数字によりストーリーが作られ、説得を行うことができ、その影響や改善の状況を数値の推移を用いて説明できるようになります。プログラミングにより数値の収集や作成もできますが、その数値に対してより解像度を高めて理解し説明するためにデータサイエンスによるデータの加工や集計の技術は欠かせません。私はビジネスの状況について数値を用いて、具体的に・効果的に説明を行うための手段としてデータサイエンスを学ぶべきだと考え、問題を解くことにしました。

### 環境構築

Dockerのインストールが必要となりますが、Windows/Mac/LinuxのどのOSでも100本ノックにチャレンジできます。Dockerをインストールしてログインした後に、以下のコマンドを実行してください。

```shell
git clone https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess
cd 100knocks-preprocess
docker-compose up -d --build
```

コマンドの実行が完了し構築が終わりましたら以下のURLにアクセスすると、JupyterNotebookが表示され、内部にあるノートから問題にチャレンジできます。

```
http://localhost:8888
```

### Polarsへの対応

Python用のノートブックも環境内に含まれていますが、そのままではPandasでないと回答できない状態となります。Pythonのノートブックをコピー＆ペーストし、コピーしたものを以下のように書き換えてください。

```python
import os
!pip install polars
import polars as pl
import numpy as np
from dateutil.relativedelta import relativedelta
import math
from sqlalchemy import create_engine
from sklearn import preprocessing
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.model_selection import TimeSeriesSplit
from imblearn.under_sampling import RandomUnderSampler

if 'PG_PORT' in os.environ:

    host = 'db'
    port = os.environ['PG_PORT']
    database = os.environ['PG_DATABASE']
    user = os.environ['PG_USER']
    password = os.environ['PG_PASSWORD']
    
    conn = create_engine(f"postgresql://{user}:{password}@{host}:{port}/{database}")

    df_customer = pl.read_database(query='select * from customer', connection=conn)
    df_category = pl.read_database(query='select * from category', connection=conn)
    df_product = pl.read_database(query='select * from product', connection=conn)
    df_receipt = pl.read_database(query='select * from receipt', connection=conn)
    df_store = pl.read_database(query='select * from store', connection=conn)
    # infer_schema_length を増やして型の推論の精度を上げる
    df_geocode = pl.read_database(query='select * from geocode', connection=conn, infer_schema_length=100_000) 

else:
    if not os.path.exists('../data/'):
        !git clone https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess
        os.chdir('100knocks-preprocess/docker/work/answer')

    dtype = {
        'customer_id': pl.Utf8,
        'gender_cd': pl.Utf8,
        'postal_cd': pl.Utf8,
        'application_store_cd': pl.Utf8,
        'status_cd': pl.Utf8,
        'category_major_cd': pl.Utf8,
        'category_medium_cd': pl.Utf8,
        'category_small_cd': pl.Utf8,
        'product_cd': pl.Utf8,
        'store_cd': pl.Utf8,
        'prefecture_cd': pl.Utf8,
        'tel_no': pl.Utf8,
        'postal_cd': pl.Utf8,
        'street': pl.Utf8
    }
    
    df_customer = pl.read_csv("../data/customer.csv", dtypes=dtype)
    df_category = pl.read_csv("../data/category.csv", dtypes=dtype)
    df_product = pl.read_csv("../data/product.csv", dtypes=dtype)
    df_receipt = pl.read_csv("../data/receipt.csv", dtypes=dtype)
    df_store = pl.read_csv("../data/store.csv", dtypes=dtype)
    df_geocode = pl.read_csv("../data/geocode.csv", dtypes=dtype)
```

内容としては、Polarsを追加でインストールし、PandasからPolarsのDataFrameへ切り替えをし、Polarsの型推論への対応を行う処理をしています。このコードを使うことでPythonのPandas以外にもPolarsで解けるようにもなります。

### ご注意

Pandas, Polars, SQLで100本ノックを10問ずつ解いて行きますが、SQLではSklearnのような機械学習の処理を扱えません。公式ドキュメントで「言語によっては向かない設問もある」との記載もありますので、回答が不可能な設問の場合にはスキップするものとします。現状ではSQLについて解答が10問のみしかありませんが、10問目以降も解答可能な問題は可能な限り解いて行きます。PolarsはRust言語ではなくPython版で解くものとして、Pandasと同様にすべての問題に解答していくものとします。

## 問題

問題を解き始める前に必ず1つ目のコードのセルを実行してください。実行しない場合、変数が未定義となりデータ処理の問題を解いてもエラーが出てきますので、忘れずに実行いただきますようお願いいたします。

### 問１

> P-001: レシート明細データ（df_receipt）から全項目の先頭10件を表示し、どのようなデータを保有しているか目視で確認せよ。

```python
# Pandas
df_receipt.head(10)
```

```python
# Polars
df_receipt.head(10)
```

```sql
%%sql
SELECT * FROM receipt LIMIT 10
```

---

### 問２

> P-002: レシート明細データ（df_receipt）から売上年月日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上金額（amount）の順に列を指定し、10件表示せよ。

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.head(10)
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.head(10)
```

```sql
%%sql
SELECT sales_ymd, customer_id, product_cd, amount FROM receipt LIMIT 10
```

---

### 問３

> P-003: レシート明細データ（df_receipt）から売上年月日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上金額（amount）の順に列を指定し、10件表示せよ。ただし、sales_ymdをsales_dateに項目名を変更して抽出すること。

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df = df.rename(columns={"sales_ymd": "sales_date"})
df.head(10)
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df = df.rename({"sales_ymd": "sales_date"})
df.head(10)
```

```sql
%%sql
SELECT sales_ymd as sales_date, customer_id, product_cd, amount FROM receipt LIMIT 10
```

---

### 問４

> P-004: レシート明細データ（df_receipt）から売上日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上金額（amount）の順に列を指定し、以下の条件を満たすデータを抽出せよ。
>
> - 顧客ID（customer_id）が"CS018205000001"

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df[df["customer_id"]=="CS018205000001"]
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.filter(pl.col("customer_id") == "CS018205000001")
```

```sql
%%sql
SELECT sales_ymd, customer_id, product_cd, amount FROM receipt WHERE customer_id = 'CS018205000001'
```

---

### 問５

> P-005: レシート明細データ（df_receipt）から売上日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上金額（amount）の順に列を指定し、以下の全ての条件を満たすデータを抽出せよ。
>
> - 顧客ID（customer_id）が"CS018205000001"
> - 売上金額（amount）が1,000以上

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df[(df["customer_id"]=="CS018205000001") & (df["amount"] >= 1000)]
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.filter((pl.col("customer_id") == "CS018205000001") & (pl.col("amount") >= 1000))
```

```sql
%%sql
SELECT
  sales_ymd, customer_id, product_cd, amount
FROM
  receipt
WHERE
  customer_id = 'CS018205000001'
  AND amount >= 1000
```

---

### 問６

> P-006: レシート明細データ（df_receipt）から売上日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上数量（quantity）、売上金額（amount）の順に列を指定し、以下の全ての条件を満たすデータを抽出せよ。
>
> - 顧客ID（customer_id）が"CS018205000001"
> - 売上金額（amount）が1,000以上または売上数量（quantity）が5以上

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "quantity", "amount"]]
df.query('customer_id=="CS018205000001" & (amount>=1000 | quantity >= 5)')
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "quantity", "amount"]]
df.filter(
    (pl.col("customer_id") == "CS018205000001")
    & ((pl.col("amount") >= 1000) | (pl.col("quantity") >= 5))
)
```

```sql
%%sql
SELECT
  sales_ymd, customer_id, product_cd, quantity, amount
FROM
  receipt
WHERE
  customer_id = 'CS018205000001'
  AND (
    amount >= 1000
    OR quantity >= 5
  )
```

---

### 問７

> P-007: レシート明細データ（df_receipt）から売上日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上金額（amount）の順に列を指定し、以下の全ての条件を満たすデータを抽出せよ。
>
> - 顧客ID（customer_id）が"CS018205000001"
> - 売上金額（amount）が1,000以上2,000以下

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.query('customer_id == "CS018205000001" & 1000 <= amount <= 2000')
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.filter(
    (pl.col("customer_id") == "CS018205000001")
    & (pl.col("amount") >= 1000)
    & (pl.col("amount") <= 2000)
)
```

```sql
%%sql
SELECT
  sales_ymd, customer_id, product_cd, amount
FROM
  receipt
WHERE
  customer_id = 'CS018205000001'
  AND amount BETWEEN 1000 AND 2000
```

---

### 問８

> P-008: レシート明細データ（df_receipt）から売上日（sales_ymd）、顧客ID（customer_id）、商品コード（product_cd）、売上金額（amount）の順に列を指定し、以下の全ての条件を満たすデータを抽出せよ。
>
> - 顧客ID（customer_id）が"CS018205000001"
> - 商品コード（product_cd）が"P071401019"以外

```python
# Pandas
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.query('customer_id == "CS018205000001" & product_cd != "P071401019"')
```

```python
# Polars
df = df_receipt[["sales_ymd", "customer_id", "product_cd", "amount"]]
df.filter(
    (pl.col("customer_id") == "CS018205000001")
    & (pl.col("product_cd") != "P071401019")
)
```

```sql
%%sql
SELECT
  sales_ymd, customer_id, product_cd, amount
FROM
  receipt
WHERE
  customer_id = 'CS018205000001'
  AND product_cd <> 'P071401019'
```

---

### 問９

---
> P-009: 以下の処理において、出力結果を変えずにORをANDに書き換えよ。
>
> `df_store.query('not(prefecture_cd == "13" | floor_area > 900)')`

```python
# Pandas
df_store.query('prefecture_cd != "13" & floor_area <= 900')
```

```python
# Polars
df_store.filter(
    (pl.col("prefecture_cd") != "13")
    & (pl.col("floor_area") <= 900)
)
```

```sql
%%sql
SELECT
  *
FROM
  store
WHERE
  prefecture_cd <> '13'
  AND floor_area <= 900
```

---

### 問１０

> P-010: 店舗データ（df_store）から、店舗コード（store_cd）が"S14"で始まるものだけ全項目抽出し、10件表示せよ。

```python
# Pandas
df_store[df_store["store_cd"].str.startswith("S14")]
```

```python
# Polars
df_store.filter(pl.col("store_cd").str.starts_with("S14"))
```

```sql
%%sql
SELECT
  *
FROM
  store
WHERE
  store_cd LIKE('S14%')
```

---

## 問１０までの所感

問題の内容としてはテーブルから列を選択してシンプルにフィルターして出力といった内容なので導入としてはとても易しく感じました。そのため、2言語で3パターンの回答でも難しくは感じませんでした。PandasはSQLのようにクエリを書くことができ、SQLよりすっきりとまとまりやすいので、書き味は良いと思います。SQLのようにSELECT文やFROM句を都度書かないで済むためにすっきりしているのではないかと思います。PolarsもPandasと似た書き方ができ、それでいて非常に高速なので魅力的な選択肢です。ただしクエリをPandasのように使えないので、複数の列で複数の条件でフィルターするときにPandasよりも書くのが大変で、シンプルな処理に限って言えばSQLよりも重複が多く見通しが悪いかもしれません。また、startswithがstawts_withのようにstr型のメソッド名から表記が揺れた命名になっているので細かいところで注意がいる気がします。
SQLは都度SELECTやFORMを書かなければなりませんが文・句ごとに明示的にブロックが分かれているのでシンプルなクエリであれば非常にわかりやすいです。反復して文・句を書く構造なのでもしかすると覚えやすさの点ではSQLに利点があるかもしれません。

オフィシャルの100本ノックの解説本もありますので、不明点がある場合には書籍をご参照ください（Polarsは勝手に追加しているだけなので記載はないと思われます）。
* [データサイエンス100本ノック構造化データ加工編ガイドブック](https://amzn.to/4i5DEt2)
