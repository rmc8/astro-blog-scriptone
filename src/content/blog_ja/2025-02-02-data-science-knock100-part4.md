---
title: "データサイエンス100本ノックをPandas・Polars・SQLで解く(#31-#40)"
slug: "data-science-knock100-part4"
description: "Python(Polars/Pandas)とSQLでデータサイエンス100本ノックの問３１から問４０まで解答します。基本統計量の算出し、算出した値でフィルターをすることや一時テーブルの作成、テーブルの作成がメインの内容となります。"
date: 2025-02-02T02:54:15.860Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['Python', 'データサイエンス']
categories: ['Programming']
---

[前回のノック](/data-science-knock100-part3)に続いて、問31から問40までの10問をPandas/Polars/SQLでときます。

## 問題

問題を解き始める前に必ず1つ目のコードのセルを実行してください。実行しない場合、変数が未定義となりデータ処理の問題を解いてもエラーが出てきますので、忘れずに実行いただきますようお願いいたします。

### 問３１

> P-031: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに売上金額（amount）の標準偏差を計算し、降順で5件表示せよ。

```python
# Pandas
tmp = df_receipt[["store_cd", "amount"]].groupby("store_cd").std(ddof=0).reset_index()
tmp.sort_values("amount", ascending=False).head()
```

```python
# Polars
df_receipt.group_by("store_cd").agg(
    pl.col("amount").std(ddof=0)
).sort("amount", descending=True).head(5)
```

```sql
%%sql
SELECT
    store_cd,
    STDDEV(amount)
FROM
    receipt
GROUP BY
    store_cd
ORDER BY
    stddev DESC
LIMIT
    5
```

---

### 問3２

> P-032: レシート明細データ（df_receipt）の売上金額（amount）について、25％刻みでパーセンタイル値を求めよ。

```python
# Pandas
df_receipt.amount.quantile(q=np.arange(1, 5) / 4)
```

```python
# Polars
df_receipt.select(
    pl.col("amount").quantile(q, interpolation="linear").alias(f"amount_quantile_{int(q * 100)}")
    for q in np.arange(1, 5) / 4
)
```

```sql
%%sql
SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY amount) AS percentile_25,
    PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY amount) AS percentile_50,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY amount) AS percentile_75,
    PERCENTILE_CONT(1.00) WITHIN GROUP (ORDER BY amount) AS percentile_100
FROM
    receipt
;
```

---

### 問３３

> P-033: レシート明細データ（df_receipt）に対し、店舗コード（store_cd）ごとに売上金額（amount）の平均を計算し、330以上のものを抽出せよ。

```python
# Pandas
avg_df = df_receipt.groupby("store_cd").amount.mean().reset_index()
avg_df.query("amount >= 330")df_receipt[["store_cd", "amount", "quantity"]].groupby("store_cd").sum()
```

```python
# Polars
avg_df = df_receipt.group_by("store_cd").agg(pl.mean("amount").alias("amount"))
avg_df.filter(pl.col("amount") >= 330)
```

```sql
%%sql
SELECT
    store_cd,
    AVG(amount)
FROM
    receipt
GROUP BY
    store_cd
HAVING
    AVG(amount) >= 330
```

---

### 問3４

> P-034: レシート明細データ（df_receipt）に対し、顧客ID（customer_id）ごとに売上金額（amount）を合計して全顧客の平均を求めよ。ただし、顧客IDが"Z"から始まるものは非会員を表すため、除外して計算すること。

```python
# Pandas
member_df = df_receipt[~df_receipt["customer_id"].str.startswith("Z")]
member_df.groupby("customer_id").amount.sum().mean()
```

```python
# Polars
df_receipt.filter(~pl.col("customer_id").str.starts_with("Z")) \
    .group_by("customer_id").agg(pl.sum("amount")) \
    .select(pl.col("amount").mean())
```

```sql
%%sql
WITH customer_revenue_totals AS (
    SELECT
        customer_id,
        SUM(amount) as revenue
    FROM
        receipt
    WHERE
        customer_id NOT LIKE 'Z%'
    GROUP BY
        customer_id
)
SELECT AVG(revenue) FROM customer_revenue_totals
```

---

### 問３５

> P-035: レシート明細データ（df_receipt）に対し、顧客ID（customer_id）ごとに売上金額（amount）を合計して全顧客の平均を求め、平均以上に買い物をしている顧客を抽出し、10件表示せよ。ただし、顧客IDが"Z"から始まるものは非会員を表すため、除外して計算すること。

```python
# Pandas
df_amount_sum = df_receipt[~df_receipt['customer_id'].str.startswith("Z")].\
                                    groupby('customer_id').amount.sum()
amount_mean = df_amount_sum.mean()
df_amount_sum = df_amount_sum.reset_index()
df_amount_sum[df_amount_sum['amount'] >= amount_mean].head(10)
```

```python
# Polars
df_amount_sum = (
    df_receipt.filter(~pl.col("customer_id").str.starts_with("Z"))
    .group_by("customer_id")
    .agg(pl.sum("amount").alias("amount"))
)
amount_mean = df_amount_sum.select(pl.col("amount").mean()).item()
df_amount_sum.filter(pl.col("amount") >= amount_mean).head(10)
```

```sql
%%sql
WITH customer_amount_sum AS (
    SELECT
        customer_id,
        SUM(amount) AS amount
    FROM
        receipt
    WHERE
        customer_id NOT LIKE 'Z%'
    GROUP BY
        customer_id
)
SELECT
    *
FROM
    customer_amount_sum
WHERE
    amount >= (SELECT AVG(amount) FROM customer_amount_sum)
LIMIT
    10;
```

---

### 問３６

> P-036: レシート明細データ（df_receipt）と店舗データ（df_store）を内部結合し、レシート明細データの全項目と店舗データの店舗名（store_name）を10件表示せよ。

```python
# Pandas
pd.merge(df_receipt, df_store[["store_cd", "store_name"]], how="inner").head(10)
```

```python
# Polars
df_receipt.join(df_store.select(["store_cd", "store_name"]), on="store_cd", how="inner")
```

```sql
%%sql
SELECT
    r.*,
    s.store_name
FROM
    receipt r INNER JOIN store s
    ON r.store_cd = s.store_cd 
LIMIT
    10
```

---

### 問３７

> P-037: 商品データ（df_product）とカテゴリデータ（df_category）を内部結合し、商品データの全項目とカテゴリデータのカテゴリ小区分名（category_small_name）を10件表示せよ。

```python
# Pandas
pd.merge(
    df_product,
    df_category[['category_major_cd', 'category_medium_cd', 'category_small_cd','category_small_name']],
    how="inner",
    on=['category_major_cd', 'category_medium_cd', 'category_small_cd']
).head(10)
```

```python
# Polars
df_product.join(
    df_category.select(['category_major_cd', 'category_medium_cd', 'category_small_cd','category_small_name']),
    on=['category_major_cd', 'category_medium_cd', 'category_small_cd'],
    how="inner"
)
```

```sql
%%sql
SELECT
    p.*,
    c.category_small_name
FROM
    product p INNER JOIN category c
    ON p.category_major_cd = c.category_major_cd
    AND p.category_medium_cd = c.category_medium_cd
    AND p.category_small_cd = c.category_small_cd
LIMIT
    10
```

---

### 問３８

> P-038: 顧客データ（df_customer）とレシート明細データ（df_receipt）から、顧客ごとの売上金額合計を求め、10件表示せよ。ただし、売上実績がない顧客については売上金額を0として表示させること。また、顧客は性別コード（gender_cd）が女性（1）であるものを対象とし、非会員（顧客IDが"Z"から始まるもの）は除外すること。

```python
# Pandas
df_amount_sum = df_receipt.groupby("customer_id").amount.sum().reset_index()
tar_customer_df = df_customer[(df_customer["gender_cd"] == "1") & (~df_customer["customer_id"].str.startswith("Z"))]
pd.merge(tar_customer_df, df_amount_sum, how="left").fillna(0).head(10)
```

```python
# Polars
df_amount_sum = df_receipt.group_by("customer_id").agg(pl.sum("amount").alias("amount"))
tar_customer_df = df_customer.filter((pl.col("gender_cd") == "1") & (~pl.col("customer_id").str.starts_with("Z")))
tar_customer_df.join(df_amount_sum, on="customer_id", how="left").fill_null(0).head(10)
```

```sql
%%sql
SELECT
    c.customer_id,
    COALESCE(SUM(r.amount), 0)
FROM
    customer c LEFT OUTER JOIN receipt r
    ON r.customer_id = c.customer_id
WHERE
    c.gender_cd = '1'
    AND NOT c.customer_id LIKE 'Z%'
GROUP BY
    c.customer_id
LIMIT
    10
```

---

### 問３９

> P-039: レシート明細データ（df_receipt）から、売上日数の多い顧客の上位20件を抽出したデータと、売上金額合計の多い顧客の上位20件を抽出したデータをそれぞれ作成し、さらにその2つを完全外部結合せよ。ただし、非会員（顧客IDが"Z"から始まるもの）は除外すること。

```python
# Pandas
tar_cust_df = df_receipt[~df_receipt["customer_id"].str.startswith("Z")]
t20_cust_df = tar_cust_df[["customer_id", "sales_ymd"]].drop_duplicates()\
    .groupby("customer_id").count().reset_index() \
    .sort_values("sales_ymd", ascending=False).head(20)
t20_sales_df = tar_cust_df[["customer_id", "amount"]]\
    .groupby("customer_id").sum().reset_index() \
    .sort_values("amount", ascending=False).head(20)
pd.merge(t20_cust_df, t20_sales_df, how="outer")
```

```python
# Polars
tar_cust_df = df_receipt.filter(~pl.col("customer_id").str.starts_with("Z"))
t20_cust_df = tar_cust_df.select(["customer_id", "sales_ymd"]) \
    .unique().group_by("customer_id").agg(pl.count("sales_ymd").alias("sales_ymd_count")) \
    .sort("sales_ymd_count", descending=True).head(20)
t20_sales_df = tar_cust_df.select(["customer_id", "amount"]) \
    .group_by("customer_id").agg(pl.sum("amount").alias("amount_sum")) \
    .sort("amount_sum", descending=True).head(20)
t20_cust_df.join(t20_sales_df, on="customer_id", how="full")
```

```sql
%%sql
WITH t20_customer as (
    SELECT
        customer_id,
        count(DISTINCT sales_ymd) as cnt
    FROM
        receipt
    WHERE
        customer_id NOT LIKE 'Z%'
    GROUP BY
        customer_id
    ORDER BY
        cnt DESC
    LIMIT
        20
), t20_sales as (
    SELECT
        customer_id,
        SUM(amount) as total_amount
    FROM
        receipt
    WHERE
        customer_id NOT LIKE 'Z%'
    GROUP BY
        customer_id
    ORDER BY
        total_amount DESC
    LIMIT
        20
)
SELECT
    COALESCE(c.customer_id, s.customer_id) customer_id,
    c.cnt,
    s.total_amount
FROM
    t20_customer c
    FULL OUTER JOIN t20_sales s
    ON
        c.customer_id = s.customer_id
```

---

### 問４０

> P-040: 全ての店舗と全ての商品を組み合わせたデータを作成したい。店舗データ（df_store）と商品データ（df_product）を直積し、件数を計算せよ。

```python
# Pandas
df_store_tmp = df_store.copy()
df_product_tmp = df_product.copy()

df_store_tmp["key"] = 0
df_product_tmp["key"] = 0

len(pd.merge(df_store_tmp, df_product_tmp, how="outer", on="key"))
```

```python
# Polars
df_store.join(df_product, how="cross").height
```

```sql
%%sql
SELECT
    COUNT(*)
FROM
    store
    CROSS JOIN product
```

---

## 問４０までの所感

基本的統計量の算出をした上で、算出した値を使ってフィルターしたり、一時テーブルで集計結果を保存してさらに処理をしたりなど複雑な処理が増えてきました。それに伴いSQLは、PandasやPolarsよりも記述量が増えている傾向にあると思います。Pandasは相変わらず他のフレームワークよりは短めに処理を書き上げることができ、ここまでではパフォーマンスの問題もとくにありません。PolarsはPandasよりも長くなりがちですがメソッドチェーンや式を使ったデータ処理の書き味が一貫しており、単にデータ処理をするだけであればPolarsも魅力的な選択肢のように思えます。また、データの結合としては外部結合・内部結合・クロス結合なども出てきており、データ処理においてさまざまなデータを適切に連携させるために重要な概念となります。適切な紐付けを行いデータの欠落のさせ方や、NaNに対する値の補完などデータ分析や機械学習におけるデータの整形に関わるところなので、結合方法の違いについてもコードとセットで理解ができるとよさそうです。

