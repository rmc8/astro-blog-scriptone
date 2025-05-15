---
title: Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#11-#20)
slug: data-science-knock100-part2
description: This article solves questions 11 through 20 of Data Science 100 Knocks using Python (Polars/Pandas) and SQL. It mainly focuses on string pattern detection using LIKE, endswith, startswith, and regular expressions.
date: 2024-11-29T22:11:45.861Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['Data Science', 'Python']
categories: ['Programming']
---

# Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#11-#20)

Continuing from the previous knocks [/data-science-knock100-part1], this section solves questions 11 through 20 using Pandas, Polars, and SQL.

## Problems

Before starting to solve the problems, make sure to execute the first code cell. If you don't, variables will be undefined, and you may encounter errors during data processing, so please don't forget to run it.

### Question 11

> P-011: From the customer data (df_customer), extract all records where the customer ID (customer_id) ends with '1' and display 10 records.

```python
# Pandas
df_customer[df_customer["customer_id"].str.endswith("1")].head(10)
```

```python
# Polars
df_customer.filter(pl.col("customer_id").str.ends_with("1"))
```

```sql
%%sql
SELECT
  *
FROM
  customer
WHERE
  customer_id LIKE '%1'
LIMIT 10
```

---

### Question 12

> P-012: From the store data (df_store), display all records where the address (address) contains '横浜市'.

```python
# Pandas
df_customer[df_customer["address"].str.contains("横浜市")]
```

```python
# Polars
df_store.filter(pl.col("address").str.contains("横浜市"))
```

```sql
%%sql
SELECT
  *
FROM
  STORE
WHERE
  address LIKE '%横浜市%'
```

---

### Question 13

> P-013: From the customer data (df_customer), extract all records where the status code (status_cd) starts with an alphabet from A to F, and display 10 records.

```python
# Pandas
df_customer[df_customer["status_cd"].str.contains(r'^[A-F]')].head(10)
```

```python
# Polars
df_customer.filter(pl.col("status_cd").str.contains(r'^[A-F].*'))
```

```sql
%%sql
SELECT
  *
FROM
  customer
WHERE
  status_cd ~ '^[A-F].*'
LIMIT
  10
```

---

### Question 14

> P-014: From the customer data (df_customer), extract all records where the status code (status_cd) ends with a digit from 1 to 9, and display 10 records.

```python
# Pandas
df_customer[df_customer["status_cd"].str.contains(r'.*[1-9]$')].head(10)
```

```python
# Polars
df_customer.filter(pl.col("status_cd").str.contains(r'.*[1-9]$')).head(10)
```

```sql
%%sql
SELECT
  *
FROM
  customer
WHERE
  status_cd ~ '.*[1-9]$'
LIMIT 10
```

---

### Question 15

> P-015: From the customer data (df_customer), extract all records where the status code (status_cd) starts with an alphabet from A to F and ends with a digit from 1 to 9, and display 10 records.

```python
# Pandas
df_customer[df_customer["status_cd"].str.contains(r'^[A-F].*[1-9]$')].head(10)
```

```python
# Polars
df_customer.filter(pl.col("status_cd").str.contains(r'^[A-F].*[1-9]$'))
```

```sql
SELECT
  *
FROM
  customer
WHERE
  status_cd ~ '^[A-F].*[1-9]$'
LIMIT
  10
```

---

### Question 16

> P-016: From the store data (df_store), display all records where the phone number (tel_no) is in the format of 3 digits-3 digits-4 digits.

```python
# Pandas
df_store[df_store["tel_no"].str.contains(r'\d{3}-\d{3}-\d{4}')]
```

```python
# Polars
df_store.filter(pl.col("tel_no").str.contains(r'\d{3}-\d{3}-\d{4}'))
```

```sql
%%sql
SELECT
  *
FROM
  store
WHERE
  tel_no ~ '\d{3}-\d{3}-\d{4}'
```

---

### Question 17

> P-017: Sort the customer data (df_customer) by birth date (birth_day) in descending order (oldest first) and display the first 10 records for all columns.

```python
# Pandas
df_customer.sort_values("birth_day").head(10)
```

```python
# Polars
df_customer.sort("birth_day").head(10)
```

```sql
%%sql
SELECT
  *
FROM
  customer
ORDER BY
  birth_day 
LIMIT
  10
```

---

### Question 18

> P-018: Sort the customer data (df_customer) by birth date (birth_day) in ascending order (youngest first) and display the first 10 records for all columns.

```python
# Pandas
df_customer.sort_values("birth_day", ascending=False).head(10)
```

```python
# Polars
df_customer.sort("birth_day", descending=True)
```

```sql
%%sql
SELECT
  *
FROM
  customer
ORDER BY
  birth_day DESC
LIMIT
  10
```

---

### Question 19

> P-019: For the receipt details data (df_receipt), rank the sales amount per transaction (amount) in descending order and display the top 10 records. Display customer ID (customer_id), sales amount (amount), and the assigned rank. If sales amounts (amount) are equal, assign the same rank.

```python
# Pandas
df_tmp = df_receipt[['customer_id', 'amount']].copy()
df_tmp['ranking'] = df_tmp['amount'].rank(method='min', ascending=False).map(int)
df_tmp.sort_values('ranking').head(10)
```

```python
# Polars
rank = df_receipt["amount"].rank(method="min", descending=True).cast(pl.Int32).alias("rank")
df = df_receipt.with_columns([rank])
df.sort("rank")[["customer_id", "amount", "rank"]].head(10)
```

```sql
%%sql
SELECT
  customer_id,
  amount,
  RANK() OVER (ORDER BY amount DESC) as rank
FROM
  receipt
LIMIT
  10
```

---

### Question 20

> P-020: For the receipt details data (df_receipt), rank the sales amount per transaction (amount) in descending order and display the top 10 records. Display customer ID (customer_id), sales amount (amount), and the assigned rank. If sales amounts (amount) are equal, assign distinct ranks.

```python
# Pandas
df_tmp = df_receipt[['customer_id', 'amount']].copy()
df_tmp['ranking'] = df_tmp['amount'].rank(method='first', ascending=False).map(int)
df_tmp.sort_values('ranking').head(10)
```

```python
# Polars
rank = df_receipt["amount"].rank(method="min", descending=True).cast(pl.Int32).alias("rank")
df = df_receipt.with_columns([rank])
df.sort("rank")[["customer_id", "amount", "rank"]].head(10)
```

```sql
%%sql
SELECT
  customer_id,
  amount,
  ROW_NUMBER() OVER (ORDER BY amount DESC) as rank
FROM
  receipt
LIMIT
  10
```

## Reflections on Questions 1 through 20

There are slight differences in syntax between Pandas and Polars, but up to this point, I didn't find it too difficult to write. Both frameworks follow certain rules and have many commonalities, so with continued practice, I can handle both effectively.

Additionally, from Question 10 in the previous section and Questions 11 onward, there are many instances of string pattern checks using LIKE, startswith, endswith, and regular expressions (regex). Among these, regular expressions are a highly abstract and versatile way to replace LIKE, startswith, and endswith. They can be used not only in data analysis but also in web scraping for data formatting or extracting specific patterns from strings. As a powerful tool for string processing, it's hard to avoid in string-based data analysis. If you're not comfortable with it, this is a good opportunity to challenge yourself with regular expressions.

The following book is a drill-based resource for learning regular expression writing:

* [Regular Expression Writing Drills with Repetitive Learning Software (WEB+DB PRESS plus)](https://amzn.to/3Zv710T)

Regular expressions themselves haven't changed much in terms of specifications, so even though this book was released on December 22, 2010, its usefulness remains today, 14 years later. While there aren't many new books on the topic, older ones are still perfectly fine, so feel free to explore with your preferred resources.

