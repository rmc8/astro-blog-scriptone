---
title: 데이터사이언스 100본 노크를 Pandas·Polars·SQL로 풀기(#31-#40)
slug: data-science-knock100-part4
description: Python(Polars/Pandas)과 SQL로 데이터사이언스 100본 노크의 문제 31부터 40까지를 해결합니다. 기본 통계량 계산, 계산된 값으로 필터링, 임시 테이블 생성, 테이블 생성이 주요 내용입니다.
date: 2025-02-02T02:54:15.860Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['Python', '데이터사이언스']
categories: ['Programming']
---

# 데이터사이언스 100본 노크를 Pandas·Polars·SQL로 풀기(#31-#40)

[이전 노크](/data-science-knock100-part3)에 이어, 문제 31부터 40까지를 Pandas/Polars/SQL로 풀어보겠습니다.

## 문제

문제를 풀기 전에 반드시 첫 번째 코드 셀을 실행하세요. 실행하지 않으면 변수가 정의되지 않아 데이터 처리 문제가 발생할 수 있습니다. 잊지 말고 실행해 주세요.

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

기본적인 통계량을 계산한 후, 계산된 값을 사용하여 필터링하거나, 임시 테이블로 집계 결과를 저장하여 추가 처리를 하는 등 복잡한 처리가 증가했습니다. 이에 따라 SQL은 Pandas나 Polars에 비해 설명량이 증가하는 경향이 있습니다. Pandas는 여전히 다른 프레임워크보다 짧게 처리를 작성할 수 있으며, 여기까지는 성능 문제도 특별히 없습니다. Polars는 Pandas보다 길어지기 쉽지만, 메서드 체인이나 식을 사용한 데이터 처리의 쓰임새가 일관되어 있어, 단순히 데이터 처리를 하는 경우 Polars도 매력적인 선택지처럼 보입니다. 또한, 데이터 결합으로는 외부 결합·내부 결합·크로스 결합 등이 등장하며, 데이터 처리에서 다양한 데이터를 적절히 연계시키기 위한 중요한 개념이 됩니다. 적절한 연결을 수행하여 데이터의 누락 방지나 NaN에 대한 값 보완 등 데이터 분석이나 머신러닝에서의 데이터 형성에 관련된 부분이므로, 결합 방법의 차이점에 대해 코드와 함께 이해할 수 있으면 좋을 것 같습니다.