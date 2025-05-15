---
title: 데이터 과학 100본 노크를 Pandas·Polars·SQL로 풀기(#21-#30)
slug: data-science-knock100-part3
description: Python(Polars/Pandas)과 SQL로 데이터 과학 100본 노크의 문제 21부터 30까지를 해결합니다. 기본 통계량 계산이 주요 과제입니다.
date: 2024-12-07T03:50:22.460Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['Python', '데이터 과학']
categories: ['Programming']
---

# 데이터 과학 100본 노크를 Pandas·Polars·SQL로 풀기(#21-#30)

[이전 노크](/data-science-knock100-part2)에 이어, 문제 21부터 30까지를 Pandas/Polars/SQL로 풀어보겠습니다.

## 문제

문제를 풀기 전에 반드시 첫 번째 코드 셀을 실행하세요. 실행하지 않으면 변수가 정의되지 않아 데이터 처리 문제가 발생할 수 있습니다. 잊지 말고 실행해 주세요.

### 문제 21

> P-021: 레시트 상세 데이터(df_receipt)에 대해, 항목 수를 카운트하세요.

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

### 문제 22

> P-022: 레시트 상세 데이터(df_receipt)의 고객 ID(customer_id)에 대해, 유니크 항목 수를 카운트하세요.

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

### 문제 23

> P-023: 레시트 상세 데이터(df_receipt)에 대해, 매장 코드(store_cd)별로 판매 금액(amount)과 판매 수량(quantity)을 합산하세요.

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

### 문제 24

> P-024: 레시트 상세 데이터(df_receipt)에 대해, 고객 ID(customer_id)별로 가장 최근 판매 연월일(sales_ymd)을 구하고, 10건을 표시하세요.

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

### 문제 25

> P-025: 레시트 상세 데이터(df_receipt)에 대해, 고객 ID(customer_id)별로 가장 오래된 판매 연월일(sales_ymd)을 구하고, 10건을 표시하세요.

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

### 문제 26

> P-026: 레시트 상세 데이터(df_receipt)에 대해, 고객 ID(customer_id)별로 가장 최근 판매 연월일(sales_ymd)과 가장 오래된 판매 연월일을 구하고, 둘 다 다른 데이터를 10건 표시하세요.

```python
# Pandas
df_tmp = df_receipt.groupby("customer_id").agg({"sales_ymd": ["max", "min"]}) .reset_index()
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

### 문제 27

> P-027: 레시트 상세 데이터(df_receipt)에 대해, 매장 코드(store_cd)별로 판매 금액(amount)의 평균을 계산하고, 내림차순으로 TOP 5를 표시하세요.

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

### 문제 28

> P-028: 레시트 상세 데이터(df_receipt)에 대해, 매장 코드(store_cd)별로 판매 금액(amount)의 중앙값을 계산하고, 내림차순으로 TOP 5를 표시하세요.

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

### 문제 29

> P-029: 레시트 상세 데이터(df_receipt)에 대해, 매장 코드(store_cd)별로 상품 코드(product_cd)의 최빈값을 구하고, 10건을 표시하세요.

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

### 문제 30

> P-030: 레시트 상세 데이터(df_receipt)에 대해, 매장 코드(store_cd)별로 판매 금액(amount)의 분산을 계산하고, 내림차순으로 5건을 표시하세요.

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

## 문제 30까지의 소감

20문제까지는 정규 표현식을 사용한 문자열 처리 등이 중심이었지만, 문제 30까지는 기본 통계량을 사용한 데이터 수치화가 주요 내용이었습니다. SQL, Pandas, Polars에서 언어에 내장된 함수나 프레임워크의 메서드를 사용하여 쉽게 작성할 수 있음을 확인할 수 있었습니다.

또한, Polars는 Pandas보다 간단한 처리에서도 약간 길어지는 경향이 있지만, 기본 통계량 처리에서는 Polars다운 작성 방식을 유지하면서도 길이가 비슷하거나 안정적이었고, Pandas보다 간단하게 작성할 수 있는 경우도 있었습니다. 좋든 나쁘든 일정량의 처리가 필요하지만, 복잡해져도 비슷한 절차로 작성할 수 있고 매우 빠른 속도로 데이터 처리를 할 수 있다는 점에서 Polars의 매력을 다시 발견할 수 있었습니다. Pandas는 Polars 이전에 거의 유일한 선택지로 널리 오랫동안 사용되었기 때문에 익숙한 사람이 많고 정보도 많아서 쉽게 사용할 수 있을 것입니다.

대규모 데이터를 고속으로 처리해야 할 경우에는 Polars가 유력하지만, 그 외의 많은 경우에는 Pandas도 여전히 강력한 선택지입니다.