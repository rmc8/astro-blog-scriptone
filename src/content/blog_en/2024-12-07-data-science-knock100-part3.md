---
title: Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#21-#30)
slug: data-science-knock100-part3
description: Solving Data Science 100 Knocks questions 21 to 30 with Python (Polars/Pandas) and SQL. The main task is calculating basic statistics.
date: 2024-12-07T03:50:22.460Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['Python', 'データサイエンス']
categories: ['Programming']
---

# Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#21-#30)

Continuing from the previous knocks ([previous knocks](/data-science-knock100-part2)), we will solve questions 21 to 30 using Pandas, Polars, and SQL.

## Problems

Before starting to solve the problems, make sure to execute the first code cell. If you do not execute it, variables will be undefined, and you will encounter errors during data processing, so please do not forget to run it.

### Question 21

> P-021: For the receipt details data (df_receipt), count the number of records.

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

### Question 22

> P-022: For the receipt details data (df_receipt), count the unique number of customer IDs (customer_id).

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

### Question 23

> P-023: For the receipt details data (df_receipt), sum the sales amount (amount) and sales quantity (quantity) by store code (store_cd).

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

### Question 24

> P-024: For the receipt details data (df_receipt), find the most recent sales date (sales_ymd) for each customer ID (customer_id), and display 10 records.

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

### Question 25

> P-025: For the receipt details data (df_receipt), find the oldest sales date (sales_ymd) for each customer ID (customer_id), and display 10 records.

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

### Question 26

> P-026: For the receipt details data (df_receipt), for each customer ID (customer_id), find the most recent sales date (sales_ymd) and the oldest sales date, and display 10 records where they differ.

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

### Question 27

> P-027: For the receipt details data (df_receipt), calculate the average sales amount (amount) by store code (store_cd), and display the top 5 in descending order.

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

### Question 28

> P-028: For the receipt details data (df_receipt), calculate the median sales amount (amount) by store code (store_cd), and display the top 5 in descending order.

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

### Question 29

> P-029: For the receipt details data (df_receipt), find the mode of product code (product_cd) by store code (store_cd), and display 10 records.

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

### Question 30

> P-030: For the receipt details data (df_receipt), calculate the variance of sales amount (amount) by store code (store_cd), and display the top 5 in descending order.

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

## Reflections on Questions up to 30

The first 20 questions focused mainly on string processing using regular expressions, but up to question 30, the content centered on numerical data processing using basic statistics. We confirmed that these can be easily implemented using built-in functions or methods in SQL, Pandas, and Polars.

Additionally, while Polars tends to result in slightly longer code for some simple processes compared to Pandas, for basic statistical processing, it maintains its characteristic style and length, and in some cases, it can be written more simply than Pandas. It requires a certain amount of code description, both positively and negatively, but it allows for very fast data processing even with complex operations, which highlights Polars' appeal. Since Pandas has been widely used as the almost exclusive choice before Polars, many people are familiar with it, and there is a lot of information available, making it easy to use.

For cases requiring high-speed processing of large-scale data, Polars is a strong option, but for many other scenarios, Pandas remains a solid choice.
