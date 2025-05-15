---
title: 데이터 사이언스 100본 노크를 Pandas·Polars·SQL로 풀기(#11-#20)
slug: data-science-knock100-part2
description: Python(Polars/Pandas)과 SQL로 데이터 사이언스 100본 노크의 문제 11부터 20까지 해결합니다. 주로 LIKE, endswith, startswith, 정규 표현식을 사용하여 문자열 패턴 검출을 수행합니다.
date: 2024-11-29T22:11:45.861Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['데이터 사이언스', 'Python']
categories: ['Programming']
---

# 데이터 사이언스 100본 노크를 Pandas·Polars·SQL로 풀기(#11-#20)

[이전 노크](/data-science-knock100-part1)에 이어, 문제 11부터 20까지를 Pandas/Polars/SQL로 풀어보겠습니다.

## 문제

문제를 풀기 전에 첫 번째 코드 셀을 반드시 실행하세요. 실행하지 않으면 변수가 정의되지 않아 데이터 처리 문제가 발생할 수 있습니다. 잊지 말고 실행하세요.

### 문제 11

> P-011: 고객 데이터（df_customer）에서 고객ID（customer_id）の末尾が1のものだけ全項目抽出し、10件表示せよ。

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

### 문제 12

> P-012: 매장 데이터（df_store）에서, 주소 (address) に"横浜市"が含まれるものだけ全項目表示せよ。

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

### 문제 13

> P-013: 고객 데이터（df_customer）에서, 상태 코드（status_cd）の先頭がアルファベットのA〜Fで始まるデータを全項目抽出し、10件表示せよ。

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

### 문제 14

> P-014: 고객 데이터（df_customer）에서, 상태 코드（status_cd）の末尾が数字の1〜9で終わるデータを全項目抽出し、10件表示せよ。

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

### 문제 15

> P-015: 고객 데이터（df_customer）에서, 상태 코드（status_cd）の先頭がアルファベットのA〜Fで始まり、末尾が数字の1〜9で終わるデータを全項目抽出し、10件表示せよ。

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

### 문제 16

> P-016: 매장 데이터（df_store）에서, 전화 번호（tel_no）が3桁-3桁-4桁のデータを全項目表示せよ。

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

### 문제 17

> P-017: 고객 데이터（df_customer）を生年月日（birth_day）で高齢順にソートし、先頭から全項目を10件表示せよ。

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

### 문제 18

> P-018: 고객 데이터（df_customer）を生年月日（birth_day）で若い順にソートし、先頭から全項目を10件表示せよ。

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

### 문제 19

> P-019: レシート明細データ（df_receipt）に対し、1件あたりの売上金額（amount）が高い順にランクを付与し、先頭から10件表示せよ。項目は顧客ID（customer_id）、売上金額（amount）、付与したランクを表示させること。なお、売上金額（amount）が等しい場合は同一順位を付与するものとする。

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

### 문제 20

> P-020: レシート明細データ（df_receipt）に対し、1件あたりの売上金額（amount）が高い順にランクを付与し、先頭から10件表示せよ。項目は顧客ID（customer_id）、売上金額（amount）、付与したランクを表示させること。なお、売上金額（amount）が等しい場合でも別順位を付与すること。

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

## 문제 20까지의 소감

Pandas와 Polars는 약간의 문법 차이가 있지만 여기까지는 큰 불편함 없이 작성할 수 있었습니다. 일정한 규칙에 따라 Pandas와 Polars를 모두 작성할 수 있고, 공통점이 많아서 계속 작성하다 보면 두 프레임워크를 모두 다룰 수 있을 것 같습니다.

또한, 이전 문제 10이나 이번 문제 11부터 LIKE나 startswith, endswith, 정규 표현식(Regex)을 사용한 문자열 패턴 검사 문제가 많이 포함되어 있습니다. 그 중에서도 정규 표현식은 LIKE, startswith, endswith를 대체하여 사용할 수 있는 매우 추상적이고 편리한 방법으로, 데이터 분석뿐만 아니라 웹 스크래핑에서의 데이터 정형화나 특정 패턴의 문자열에서 문자를 추출하는 등의 용도로 사용할 수 있습니다. 문자열 처리에서 매우 강력한 도구이므로, 문자열을 사용하는 데이터 분석에서는 피할 수 없을 것입니다. 약하다면 이 기회에 정규 표현식을 도전해 보는 것이 좋을 수 있습니다.

다음 책은 정규 표현식의 작성법을 드릴 형식으로 배울 수 있는 책입니다.

* [반복 학습 소프트웨어 포함 정규 표현식 작성 드릴 (WEB+DB PRESS plus)](https://amzn.to/3Zv710T)

정규 표현식 자체는 사양이 크게 변경되지 않기 때문에, 2010년 12월 22일에 출시된 책이지만, 14년이 지난 지금도 그 유용성은 변하지 않습니다. 최신 책이 많지 않지만, 오래된 책이라도 특별한 문제가 없으므로, 원하는 책으로 즐겨보세요.