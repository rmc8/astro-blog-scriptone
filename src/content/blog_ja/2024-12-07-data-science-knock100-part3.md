---
title: "データサイエンス100本ノックをPandas・Polars・SQLで解く(#21-#30)"
slug: "data-science-knock100-part3"
description: "Python(Polars/Pandas)とSQLでデータサイエンス100本ノックの問２１から問３０まで解答します。基本統計量の算出がメインの課題です。"
date: 2024-12-07T03:50:22.460Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['Python', 'データサイエンス']
categories: ['Programming']
---

[前回のノック](/data-science-knock100-part2)に続いて、問21から問30までの10問をPandas/Polars/SQLでときます。

## 問題

問題を解き始める前に必ず1つ目のコードのセルを実行してください。実行しない場合、変数が未定義となりデータ処理の問題を解いてもエラーが出てきますので、忘れずに実行いただきますようお願いいたします。

### 問２１

> P-021: レシート明細データ（df_receipt）に対し、件数をカウントせよ。

```python
# Pandas
len(df_receipt)
```

```python
# Polars
len(df_receipt)
```

```sql
%%sql
SELECT COUNT(*) FROM receipt
```

---

### 問２２

> P-022: レシート明細データ（df_receipt）の顧客ID（customer_id）に対し、ユニーク件数をカウントせよ。

```python
# Pandas
len(df_receipt["customer_id"].unique())
```

```python
# Polars
len(df_receipt["customer_id"].unique())
```

```sql
%%sql
SELECT COUNT(DISTINCT customer_id) FROM receipt
```

---

### 問２３

> P-023: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに売上金額（amount）と売上数量（quantity）を合計せよ。

```python
# Pandas
df_receipt[["store_cd", "amount", "quantity"]].groupby("store_cd").sum()
```

```python
# Polars
df_receipt.group_by("store_cd").agg(
    pl.col("amount").sum(), 
    pl.col("quantity").sum()
)
```

```sql
%%sql
SELECT
  store_cd,
  SUM(amount),
  SUM(quantity)
FROM
  receipt
GROUP BY
  store_cd
```

---

### 問２４

> P-024: レシート明細データ（df_receipt）に対し、顧客ID（customer_id）ごとに最も新しい売上年月日（sales_ymd）を求め、10件表示せよ。

```python
# Pandas
df_receipt[["customer_id", "sales_ymd"]].groupby("customer_id").max().head(10)
```

```python
# Polars
df_receipt.group_by("customer_id").agg(pl.col("sales_ymd").max()).head(10)
```

```sql
%%sql
SELECT
  customer_id,
  MAX(sales_ymd)
FROM
  receipt
GROUP BY
  customer_id
LIMIT
  10
```

---

### 問２５

> P-025: レシート明細データ（df_receipt）に対し、顧客ID（customer_id）ごとに最も古い売上年月日（sales_ymd）を求め、10件表示せよ。

```python
# Pandas
df_receipt[["customer_id", "sales_ymd"]].groupby("customer_id").min().head(10)
```

```python
# Polars
df_receipt.group_by("customer_id").agg(pl.col("sales_ymd").min()).head(10)
```

```sql
%%sql
SELECT
  customer_id,
  MIN(sales_ymd)
FROM
  receipt
GROUP BY
  customer_id
LIMIT
  10
```

---

### 問２６

> P-026: レシート明細データ（df_receipt）に対し、顧客ID（customer_id）ごとに最も新しい売上年月日（sales_ymd）と古い売上年月日を求め、両者が異なるデータを10件表示せよ。

```python
# Pandas
df_tmp = df_receipt.groupby("customer_id").agg({"sales_ymd": ["max", "min"]}).reset_index()
df_tmp.columns = ["customer_id", "sales_ymd_max", "sales_ymd_min"]
df_tmp.query("sales_ymd_max != sales_ymd_min").head(10)
```

```python
# Polars
df_tmp = df_receipt.group_by("customer_id").agg(
    pl.col("sales_ymd").max().alias("sales_ymd_max"),
    pl.col("sales_ymd").min().alias("sales_ymd_min"),
)
df_tmp.filter(pl.col("sales_ymd_max") != pl.col("sales_ymd_min")).head(10)
```

```sql
%%sql
SELECT
  customer_id,
  MAX(sales_ymd) AS sales_ymd_max,
  MIN(sales_ymd) AS sales_ymd_min
FROM
  receipt
GROUP BY
  customer_id
HAVING 
  MAX(sales_ymd) <> MIN(sales_ymd)
LIMIT 10
```

---

### 問２７

> P-027: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに売上金額（amount）の平均を計算し、降順でTOP5を表示せよ。

```python
# Pandas
df_receipt[["store_cd", "amount"]].groupby("store_cd").mean().sort_values("amount", ascending=False).head()
```

```python
# Polars
df_receipt.group_by("store_cd").agg(pl.col("amount").mean()).sort("amount", descending=True).head()
```

```sql
%%sql
SELECT
  store_cd,
  AVG(amount) as amount_avg
FROM
  receipt
GROUP BY
  store_cd
ORDER BY
  amount_avg DESC
LIMIT
  5
```

---

### 問２８

> P-028: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに売上金額（amount）の中央値を計算し、降順でTOP5を表示せよ。

```python
# Pandas
df_tmp = df_receipt[["store_cd", "amount"]].groupby("store_cd").median().reset_index()
df_tmp.columns = ["store_cd", "amount_med"]
df_tmp.sort_values("amount_med", ascending=False).head()
```

```python
# Polars
df_receipt.group_by("store_cd").agg(pl.col("amount").median()).sort("amount", descending=True).head()
```

```sql
%%sql
SELECT
  store_cd,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) AS amount_med
FROM
  receipt
GROUP BY
  store_cd
ORDER BY
  amount_med DESC
LIMIT
  5
```

---

### 問２９

> P-029: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに商品コード（product_cd）の最頻値を求め、10件表示させよ。

```python
# Pandas
df_receipt.groupby("store_cd").product_cd.apply(lambda x: x.mode()).reset_index().head(10)
```

```python
# Polars
df_receipt.group_by("store_cd").agg(
    pl.col("product_cd").mode()
).head(10)
```

```sql
%%sql
SELECT
  store_cd,
  MODE() WITHIN GROUP(ORDER BY product_cd)
FROM
  receipt
GROUP BY
  store_cd
LIMIT
  10
```

---

### 問３０

> P-030: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに売上金額（amount）の分散を計算し、降順で5件表示せよ。

```python
# Pandas
df_receipt \
    .groupby("store_cd") \
    .amount.var(ddof=0) \
    .reset_index() \
    .sort_values('amount', ascending=False) \
    .head(5)
```

```python
# Polars
df_receipt.group_by("store_cd").agg(
    pl.col("amount").var(ddof=0)
).sort("amount", descending=True).head(5)
```

```sql
%%sql
SELECT
    store_cd,
    VAR_POP(amount) AS amount_variance
FROM
    receipt
GROUP BY
    store_cd
ORDER BY
    amount_variance DESC
LIMIT 5;
```

---

## 問３０までの所感

20問までは正規表現を用いた文字列の処理などが中心でしたが、問30までは基本統計量を用いたデータの数値化が主な内容でした。SQL、Pandas、Polarsで言語に組み込まれた関数やフレームワークのメソッドを使うことにより簡単に記述できることが確認できたかと思います。

また、PolarsはPandasよりちょっとした処理を書く場合でも長くなる傾向がありましたが、基本的統計量の処理ではPolarsらしい書き方を維持しつつも長さは変わらず安定しており、Pandasよりもシンプルに書けるケースもありました。良くも悪くも一定量の処理の記述が必要ですが、複雑になっても同じような手順で書くことができ非常に早い速度でデータ処理を行える点で改めてPolarsの魅力を発見できました。PandasもPolars以前はほぼ唯一の選択肢として広く長く使われていたフレームワークであるため慣れている方も多く情報も多いので手軽に使えるのではないかと思います。

大規模なデータを高速で処理する必要がある場合にはPolarsが有力ですがそれ以外の多くの場合にはPandasも依然として強い選択肢であると思います。

