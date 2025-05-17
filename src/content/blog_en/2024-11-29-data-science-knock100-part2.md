---
title: "Solving Data Science 100 Knocks with Pandas, Polars, and SQL (#11-#20)"
slug: "data-science-knock100-part2"
description: "Solve questions 11 to 20 of Data Science 100 Knocks using Python (Polars/Pandas) and SQL. Mainly perform string pattern detection using LIKE, endswith, startswith, and regular expressions."
date: 2024-11-29T22:11:45.861Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['Data Science', 'Python']
categories: ['Programming']
---

Continuing from the previous knock [/data-science-knock100-part1], solve questions 11 to 20 using Pandas/Polars/SQL.

## Problems

Before starting to solve the problems, please execute the first code cell. If you do not, variables will be undefined, and errors may occur during data processing, so please do not forget to run it.

### Question 11

> P-011: From the customer data (df_customer), extract all items where the customer ID (customer_id) ends with 1, and display 10 items.

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

> P-012: From the store data (df_store), display all items where the address (address) contains "横浜市".

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

> P-013: From the customer data (df_customer), extract all items where the status code (status_cd) starts with an alphabet from A to F, and display 10 items.

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

> P-014: From the customer data (df_customer), extract all items where the status code (status_cd) ends with a digit from 1 to 9, and display 10 items.

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

> P-015: From the customer data (df_customer), extract all items where the status code (status_cd) starts with an alphabet from A to F and ends with a digit from 1 to 9, and display 10 items.

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

> P-016: From the store data (df_store), display all items where the phone number (tel_no) is in the format of 3 digits-3 digits-4 digits.

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

> P-017: Sort the customer data (df_customer) by birth date (birth_day) in descending order (oldest first), and display the first 10 items for all columns.

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

> P-018: Sort the customer data (df_customer) by birth date (birth_day) in ascending order (youngest first), and display the first 10 items for all columns.

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

> P-019: For the receipt details data (df_receipt), assign ranks based on sales amount (amount) in descending order, and display the first 10 items. Show customer ID (customer_id), sales amount (amount), and the assigned rank. If sales amounts (amount) are equal, assign the same rank.

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

> P-020: For the receipt details data (df_receipt), assign ranks based on sales amount (amount) in descending order, and display the first 10 items. Show customer ID (customer_id), sales amount (amount), and the assigned rank. If sales amounts (amount) are equal, assign different ranks.

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

## Thoughts on Questions 1 to 20

There are slight differences in syntax between Pandas and Polars, but up to this point, I could write them without much discomfort. Both frameworks follow certain rules and have many commonalities, so continuing to write them should allow me to handle both frameworks without issues.

Additionally, from Question 10 in the previous set and Questions 11 onward, there are many cases involving string pattern checks using LIKE, startswith, endswith, and regular expressions (regex). Among these, regular expressions are a very abstract and convenient way to replace LIKE, startswith, and endswith, and can be used for data shaping in data analysis as well as extracting characters from specific patterns in web scraping. They are a powerful tool for string processing, so it is difficult to avoid them in data analysis involving strings. If you are not good at them, this is a good opportunity to challenge yourself with regular expressions.

The following book is a drill-based resource for learning how to write regular expressions.

* [Regular Expressions Writing Drill with Repetitive Learning Software (WEB+DB PRESS plus)](https://amzn.to/3Zv710T)

Regular expressions themselves have not changed much in specification, so even though this book was released on December 22, 2010, its usefulness remains today, 14 years later. There are not many new books available, but older ones are fine, so feel free to try with your preferred book.
