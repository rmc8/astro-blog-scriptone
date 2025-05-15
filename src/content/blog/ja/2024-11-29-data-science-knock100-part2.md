---
title: data-science-knock100-part2
description: Python(Polars/Pandas)とSQLでデータサイエンス100本ノックの問11から問20まで解答します。主にLIKE, endswith, startswith, 正規表現などを用いた文字列のパターン検出を行います。
date: 2024-11-29T22:11:45.861Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png
draft: false
tags: ['データサイエンス', 'Python']
categories: ['Programming']
---

# データサイエンス100本ノックをPandas・Polars・SQLで解く(#11-#20)

[前回のノック](/data-science-knock100-part1)に続いて、問11から問20までの10問をPandas/Polars/SQLでときます。

## 問題

問題を解き始める前に必ず1つ目のコードのセルを実行してください。実行しない場合、変数が未定義となりデータ処理の問題を解いてもエラーが出てきますので、忘れずに実行いただきますようお願いいたします。

### 問１１

> P-011: 顧客データ（df_customer）から顧客ID（customer_id）の末尾が1のものだけ全項目抽出し、10件表示せよ。

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

### 問１２

> P-012: 店舗データ（df_store）から、住所 (address) に"横浜市"が含まれるものだけ全項目表示せよ。

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

### 問１３

> P-013: 顧客データ（df_customer）から、ステータスコード（status_cd）の先頭がアルファベットのA〜Fで始まるデータを全項目抽出し、10件表示せよ。

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

### 問１４

> P-014: 顧客データ（df_customer）から、ステータスコード（status_cd）の末尾が数字の1〜9で終わるデータを全項目抽出し、10件表示せよ。

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

### 問１５

> P-015: 顧客データ（df_customer）から、ステータスコード（status_cd）の先頭がアルファベットのA〜Fで始まり、末尾が数字の1〜9で終わるデータを全項目抽出し、10件表示せよ。

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

### 問１６

> P-016: 店舗データ（df_store）から、電話番号（tel_no）が3桁-3桁-4桁のデータを全項目表示せよ。

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

### 問１７

> P-017: 顧客データ（df_customer）を生年月日（birth_day）で高齢順にソートし、先頭から全項目を10件表示せよ。

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

### 問１８

> P-018: 顧客データ（df_customer）を生年月日（birth_day）で若い順にソートし、先頭から全項目を10件表示せよ。

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

### 問１９

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

### 問２０

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

## 問２０までの所感

PandasとPolarsは若干記法の違いがありますがここまではあまり違和感などなく書けました。一定のルールに沿ってPandasもPolarsも記述でき、共通点も多いので書き続けていれば問題なく両方のフレームワークを扱えそうです。

また、前回の問10や今回の問11からLIKEやstartswith, endswithや正規表現（regex）を使った文字列のパターンの検査が多く含まれています。中でも正規表現はLIKE, startswith, endswithを代替して使うことができる非常に抽象的で便利な書き方であり、データ分析に限らずWebスクレイピングにおけるデータの整形や特定のパターンの文字列から文字を抽出するような使い方ができます。文字列の加工において非常に強力なツールであるため、文字列を用いたデータ分析においては避けて通ることは難しいでしょう。苦手な場合にはこの機に正規表現にチャレンジしてみると良いかもしれません。

以下の書籍は正規表現の書き方をドリル形式で学べる書籍です。

* [反復学習ソフト付き 正規表現書き方ドリル (WEB+DB PRESS plus)](https://amzn.to/3Zv710T)

正規表現自体は仕様が大きく変わってはいないので、2010年12月22日に発売された書籍ですが、14年経った現在においてもその有用さに変わりはありません。真新しい書籍が豊富にはありませんが、古い書籍でもとくに問題はありませんので、お好みの書籍などでぜひ遊んでみてください。

