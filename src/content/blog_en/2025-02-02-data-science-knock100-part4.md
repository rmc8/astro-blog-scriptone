---
title: "Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#31-#40)"
slug: "data-science-knock100-part4"
description: "This article solves questions 31 through 40 of Data Science 100 Knocks using Python (Polars/Pandas) and SQL. The main content includes calculating basic statistics, filtering based on those values, creating temporary tables, and creating tables."
date: 2025-02-02T02:54:15.860Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['Python', 'Data Science']
categories: ['Programming']
---

Continuing from the previous knock ([/data-science-knock100-part3]), we solve questions 31 through 40 using Pandas/Polars/SQL.

## Problems

Before starting to solve the problems, please make sure to execute the first code cell. If you do not execute it, variables will be undefined, and you will encounter errors during data processing, so please do not forget to run it.

### Question 31

> P-031: For the receipt details data (df_receipt), calculate the standard deviation of the sales amount (amount) for each store code (store_cd), and display the top 5 in descending order.

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

### Question 32

> P-032: For the sales amount (amount) in the receipt details data (df_receipt), calculate the percentile values at 25% intervals.

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

### Question 33

> P-033: For the receipt details data (df_receipt), calculate the average sales amount (amount) for each store code (store_cd), and extract those that are 330 or more.

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

### Question 34

> P-034: For the receipt details data (df_receipt), calculate the total sales amount (amount) for each customer ID (customer_id), then find the average across all customers. However, exclude those with customer ID starting with "Z" as they represent non-members.

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

### Question 35

> P-035: For the receipt details data (df_receipt), calculate the total sales amount (amount) for each customer ID (customer_id), then find the average across all customers, and extract customers who have spent more than the average. Display 10 records. However, exclude those with customer ID starting with "Z" as they represent non-members.

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

### Question 36

> P-036: Inner join the receipt details data (df_receipt) and store data (df_store), and display all items from the receipt details data along with the store name (store_name) for 10 records.

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

### Question 37

> P-037: Inner join the product data (df_product) and category data (df_category), and display all items from the product data along with the category small name (category_small_name) for 10 records.

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

### Question 38

> P-038: From the customer data (df_customer) and receipt details data (df_receipt), calculate the total sales amount for each customer, and display 10 records. However, treat customers with no sales as 0 for sales amount. Target only customers with gender code (gender_cd) as female (1), and exclude non-members (customer ID starting with "Z").

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

### Question 39

> P-039: From the receipt details data (df_receipt), create data for the top 20 customers by number of sales days and the top 20 customers by total sales amount, then perform a full outer join on these two datasets. However, exclude non-members (customer ID starting with "Z").

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

### Question 40

> P-040: We want to create data that combines all stores and all products. Perform a Cartesian product of the store data (df_store) and product data (df_product), and calculate the number of records.

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

## Reflections on Questions up to 40

After calculating basic statistics, we performed more complex processing such as filtering based on those values, saving aggregation results in temporary tables for further processing, and more. Consequently, SQL tends to have more code compared to Pandas or Polars. Pandas can still write processes relatively concisely, and there are no particular performance issues up to this point. Polars may result in longer code than Pandas, but its consistent style of method chaining and expressions makes it an attractive option for pure data processing. Additionally, various joins like outer joins, inner joins, and cross joins have appeared, which are important concepts for appropriately linking different data in data processing. Understanding the differences in join methods, along with the code, is useful for data shaping in data analysis and machine learning, including how to handle data omissions and NaN values.