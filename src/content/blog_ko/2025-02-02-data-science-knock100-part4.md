---
title: "데이터 사이언스 100본 노크를 Pandas·Polars·SQL로 풀기(#31-#40)"
slug: "data-science-knock100-part4"
description: "Python(Polars/Pandas)과 SQL로 데이터 사이언스 100본 노크의 문제 31부터 40까지를 해결합니다. 기본 통계량 계산, 계산된 값으로 필터링, 임시 테이블 생성, 테이블 생성이 주요 내용입니다."
date: 2025-02-02T02:54:15.860Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['Python', '데이터 사이언스']
categories: ['Programming']
---

[이전 노크](/data-science-knock100-part3)에 이어서, 문제 31부터 40까지를 Pandas/Polars/SQL로 풀어보겠습니다.

## 문제

문제를 풀기 전에 첫 번째 코드 셀을 반드시 실행하세요. 실행하지 않으면 변수가 정의되지 않아 데이터 처리 문제가 발생할 수 있습니다. 잊지 말고 실행해 주세요.

### 문제 31

> P-031: 레시트 상세 데이터(df_receipt)에 대해, 상점 코드(store_cd)별로 판매 금액(amount)의 표준 편차를 계산하고, 내림차순으로 5건 표시하세요.

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

### 문제 32

> P-032: 레시트 상세 데이터(df_receipt)의 판매 금액(amount)에 대해, 25% 단위로 백분위수를 구하세요.

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

### 문제 33

> P-033: 레시트 상세 데이터(df_receipt)에 대해, 상점 코드(store_cd)별로 판매 금액(amount)의 평균을 계산하고, 330 이상인 것을 추출하세요.

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

### 문제 34

> P-034: 레시트 상세 데이터(df_receipt)에 대해, 고객 ID(customer_id)별로 판매 금액(amount)을 합산하여 전체 고객의 평균을 구하세요. 단, 고객 ID가 "Z"로 시작하는 것은 비회원으로, 계산에서 제외하세요.

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

### 문제 35

> P-035: 레시트 상세 데이터(df_receipt)에 대해, 고객 ID(customer_id)별로 판매 금액(amount)을 합산하여 전체 고객의 평균을 구하고, 평균 이상으로 구매한 고객을 추출하여 10건 표시하세요. 단, 고객 ID가 "Z"로 시작하는 것은 비회원으로, 계산에서 제외하세요.

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

### 문제 36

> P-036: 레시트 상세 데이터(df_receipt)와 상점 데이터(df_store)를 내부 조인하여, 레시트 상세 데이터의 모든 항목과 상점 데이터의 상점 이름(store_name)을 10건 표시하세요.

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

### 문제 37

> P-037: 상품 데이터(df_product)와 카테고리 데이터(df_category)를 내부 조인하여, 상품 데이터의 모든 항목과 카테고리 데이터의 카테고리 소분류 이름(category_small_name)을 10건 표시하세요.

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

### 문제 38

> P-038: 고객 데이터(df_customer)와 레시트 상세 데이터(df_receipt)에서, 고객별 판매 금액 합계를 구하고, 10건 표시하세요. 단, 판매 실적이 없는 고객은 판매 금액을 0으로 표시하고, 고객은 성별 코드(gender_cd)가 여성(1)인 것을 대상으로 하며, 비회원(고객 ID가 "Z"로 시작하는 것)은 제외하세요.

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

### 문제 39

> P-039: 레시트 상세 데이터(df_receipt)에서, 판매 일수가 많은 고객의 상위 20건을 추출한 데이터와, 판매 금액 합계가 많은 고객의 상위 20건을 추출한 데이터를 각각 생성한 후, 두 데이터를 완전 외부 조인하세요. 단, 비회원(고객 ID가 "Z"로 시작하는 것)은 제외하세요.

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

### 문제 40

> P-040: 모든 상점과 모든 상품을 조합한 데이터를 생성하세요. 상점 데이터(df_store)와 상품 데이터(df_product)를 직적하여, 건수를 계산하세요.

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

## 문제 40까지의 소감

기본적인 통계량을 계산한 후, 계산된 값을 사용하여 필터링하거나, 임시 테이블로 집계 결과를 저장하여 추가 처리를 하는 등 복잡한 처리가 증가했습니다. 이에 따라 SQL은 Pandas나 Polars에 비해 설명량이 증가하는 경향이 있습니다. Pandas는 여전히 다른 프레임워크보다 짧게 처리를 할 수 있으며, 여기까지는 성능 문제도 특별히 없습니다. Polars는 Pandas보다 길어지기 쉽지만, 메서드 체인이나 식을 사용한 데이터 처리의 쓰임새가 일관되어 있어, 단순히 데이터 처리를 하는 경우 Polars도 매력적인 선택지처럼 보입니다. 또한, 데이터 조합으로는 외부 조인·내부 조인·크로스 조인 등이 등장하며, 데이터 처리에서 다양한 데이터를 적절히 연계시키기 위한 중요한 개념이 됩니다. 적절한 연결을 수행하여 데이터의 누락 방지나 NaN에 대한 값 보완 등 데이터 분석이나 머신 러닝에서의 데이터 정형화와 관련된 부분이므로, 조인 방법의 차이도 코드와 함께 이해하면 좋을 것 같습니다.