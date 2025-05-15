---
title: Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#1-#10)
slug: data-science-knock100-part1
description: This post solves the first 10 questions of Data Science 100 Knocks using Python (Polars/Pandas) and SQL.
date: 2024-11-24T09:02:29.266Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['Data Science', 'Python']
categories: ['Programming']
---

# Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#1-#10)

This solves Data Science 100 Knocks using Python (Pandas/Polars) and SQL.

## Data Science 100 Knocks

This material is published by the Data Science Association on [GitHub](https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess?tab=readme-ov-file). It uses fictional data for data science to learn statistical techniques with programming languages and machine learning methods using Sklearn.

### Why Solve It?

This is a personal motivation, so feel free to skip it. However, if you're unclear on how to use it or why to solve it, you may find this helpful as a reference.

In mid-November 2024, I had no involvement in data science and wasn't particularly interested in learning it. But I decided to proceed for two reasons. First, I gained some free time. I was updating my site and freely programming without focusing on web apps, which led to an overflow of things I wanted or needed to do. By prioritizing and organizing, I secured time for site updates and learning data science. However, this reason alone felt weak, so here's the second. While managing and improving tasks through programming at work, I was evaluated on skills for solving problems with tech, as well as adjustment and management abilities, leading me to a PM-like role. As a PM, I must create roadmaps, plan to move things forward, communicate directions, motivate toward goals, and achieve planned outputs and outcomes. To do this, I need to involve stakeholders, get evaluations of results, and drive improvements, making quantification extremely important. Numbers with context create stories for persuasion, and their trends explain impacts and improvements. While programming can collect or create numbers, to understand and explain them with higher resolution, data science techniques for data processing and aggregation are essential. I believe data science is a means to explain business situations specifically and effectively using numbers, so I decided to solve these problems.

### Environment Setup

You need to install Docker, and you can challenge the 100 Knocks on any OS like Windows, Mac, or Linux. After installing and logging into Docker, run the following commands:

```shell
git clone https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess
cd 100knocks-preprocess
docker-compose up -d --build
```

Once the commands are executed and the setup is complete, access the following URL to see Jupyter Notebook, where you can tackle the problems from the notebooks inside.

```
http://localhost:8888
```

### Polars Compatibility

The Python notebooks are included in the environment, but they are set up for Pandas only. Copy and paste the Python notebook, and modify the copy as follows:

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
    # Increase infer_schema_length to improve type inference accuracy
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

This code installs Polars additionally, switches from Pandas DataFrame to Polars, and handles Polars type inference. Using this code makes it possible to solve with Polars in addition to Python's Pandas.

### Notes

I will solve the 100 Knocks in 10-question sets using Pandas, Polars, and SQL, but SQL cannot handle machine learning processes like Sklearn. The official documentation mentions that some questions may not suit certain languages, so I'll skip impossible ones. Currently, only 10 SQL questions are solved, but I'll tackle as many as possible beyond that. For Polars, using the Python version, I'll solve all questions like Pandas.

## Problems

Before starting the problems, always execute the first code cell. If you don't, variables will be undefined, causing errors in data processing, so please don't forget.

### Question 1

> P-001: From the receipt details data (df_receipt), display the first 10 records of all items and visually confirm what data is held.

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

### Question 2

> P-002: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), and sales amount (amount), and display 10 records.

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

### Question 3

> P-003: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), and sales amount (amount), and display 10 records. However, change the item name of sales_ymd to sales_date for extraction.

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

### Question 4

> P-004: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), and sales amount (amount), and extract data that meets the following conditions.
>
> - Customer ID (customer_id) is "CS018205000001"

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

### Question 5

> P-005: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), and sales amount (amount), and extract data that meets all the following conditions.
>
> - Customer ID (customer_id) is "CS018205000001"
> - Sales amount (amount) is 1,000 or more

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

### Question 6

> P-006: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), sales quantity (quantity), and sales amount (amount), and extract data that meets all the following conditions.
>
> - Customer ID (customer_id) is "CS018205000001"
> - Sales amount (amount) is 1,000 or more, or sales quantity (quantity) is 5 or more

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

### Question 7

> P-007: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), and sales amount (amount), and extract data that meets all the following conditions.
>
> - Customer ID (customer_id) is "CS018205000001"
> - Sales amount (amount) is 1,000 or more and 2,000 or less

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

### Question 8

> P-008: From the receipt details data (df_receipt), specify the columns in the order of sales date (sales_ymd), customer ID (customer_id), product code (product_cd), and sales amount (amount), and extract data that meets all the following conditions.
>
> - Customer ID (customer_id) is "CS018205000001"
> - Product code (product_cd) is not "P071401019"

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

### Question 9

> P-009: In the following process, rewrite OR to AND without changing the output result.
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

### Question 10

> P-010: From the store data (df_store), extract all items where the store code (store_cd) starts with "S14", and display 10 records.

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

## Reflections on Questions 1-10

The problems involve simply selecting columns from tables and filtering, so as an introduction, they felt very easy. Thus, even with three patterns in two languages, it wasn't difficult. Pandas allows writing queries like SQL but more concisely, so it's pleasant to write. It might be because you don't have to write SELECT statements or FROM clauses each time like in SQL. Polars has similar syntax to Pandas and is very fast, making it an attractive option. However, since it doesn't support queries like Pandas, filtering with multiple columns and conditions can be more cumbersome than Pandas, and for simple processes, it might be less readable than SQL due to more duplication. Also, the method name is 'starts_with' instead of 'startswith', so you need to pay attention to such details. SQL requires writing SELECT and FROM each time, but since it's explicitly blocked by statements and clauses, simple queries are very clear. Its repetitive structure might make it easier to remember than the others.

There is an official commentary book for the 100 Knocks, so refer to the book for any unclear points (Polars is an addition I made, so it's probably not covered).
* [Data Science 100 Knocks Structured Data Processing Guidebook](https://amzn.to/4i5DEt2)
