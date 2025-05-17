---
title: "데이터 사이언스 100본 노크를 Pandas·Polars·SQL로 풀기(#1-#10)"
slug: "data-science-knock100-part1"
description: "Python(Polars/Pandas)과 SQL로 데이터 사이언스 100본 노크의 문제 1부터 10까지 해결합니다."
date: 2024-11-24T09:02:29.266Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/df.png"
draft: false
tags: ['데이터 사이언스', 'Python']
categories: ['Programming']
---

데이터 사이언스 100본 노크를 Python(Pandas/Polars)과 SQL로 풀어보겠습니다.

## 데이터 사이언스 100본 노크

이 교재는 데이터 사이언스 협회가 [GitHub](https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess?tab=readme-ov-file)에서 공개한 것입니다. 데이터 사이언스를 위해 가상 데이터를 처리하면서 프로그래밍 언어를 사용한 통계 기법이나 Sklearn 등의 머신러닝 기법을 배울 수 있습니다.

### 왜 풀어보는가

개인적인 동기이므로 건너뛰어도 좋습니다. 다만, 어떻게 활용할지 또는 왜 풀어보는지 불분명한 경우 참고로 읽어주시기 바랍니다.

2024년 11월 중순까지는 특히 데이터 사이언스의 '데' 자도 모르고, 실제로 데이터 사이언스를 배우고 싶지 않았습니다. 그럼에도 불구하고 두 가지 이유로 시도하기로 했습니다. 첫 번째는 시간이 여유로워졌기 때문입니다. 사이트 업데이트나 Web 앱 부분 외에는 자유롭게 프로그래밍을 하며 시간을 보냈습니다. 그 결과로 마침내 하고 싶은 일과 해야 할 일이 넘쳐나서 우선순위를 정하고 분류한 결과, 페이지 업데이트 시간과 데이터 사이언스 학습 시간을 확보할 수 있게 되었습니다. 하지만 이 이유만으로는 약간 부족하므로 두 번째 이유입니다. 업무에서 프로그래밍을 하면서 업무 관리와 개선을 하다 보니, 테크를 활용해 문제를 해결하는 기술과 함께 조정력이나 관리력이 평가되어, 자연스럽게 PM 계열 직종이 되었습니다. PM이 되면 로드맵을 만들고, 일을 추진할 계획을 세우며, 방향을 전달하고 동기를 부여하여 목표를 계획적으로 달성하며, 아웃풋이나 아웃컴을 내야 합니다. 그 과정에서 관련자에게 행동을 유도하거나, 성과를 평가받거나, 개선 활동을 하기 위해 수치화가 매우 중요합니다. 어떤 배경을 가진 숫자로 스토리를 만들고, 설득할 수 있으며, 그 영향이나 개선 상황을 숫자의 추이를 통해 설명할 수 있습니다. 프로그래밍으로 숫자를 수집하거나 만들 수 있지만, 그 숫자에 대해 더 높은 해상도로 이해하고 설명하기 위해 데이터 사이언스에 의한 데이터 처리나 집계 기술은 필수입니다. 저는 비즈니스 상황에 대해 숫자를 사용하여 구체적이고 효과적으로 설명하기 위한 수단으로 데이터 사이언스를 배워야 한다고 생각하고, 문제를 풀기로 했습니다.

### 환경 구축

Docker를 설치해야 합니다. Windows/Mac/Linux의 어떤 OS에서도 100본 노크에 도전할 수 있습니다. Docker를 설치하고 로그인한 후, 다음 명령어를 실행하세요.

```shell
git clone https://github.com/The-Japan-DataScientist-Society/100knocks-preprocess
cd 100knocks-preprocess
docker-compose up -d --build
```

명령어 실행이 완료되고 구축이 끝나면 다음 URL에 접근하면 Jupyter Notebook이 표시되며, 내부에 있는 노트에서 문제에 도전할 수 있습니다.

```
http://localhost:8888
```

### Polars에 대한 대응

Python용 노트북도 환경에 포함되어 있지만, 그대로 사용하면 Pandas만으로 답할 수 있는 상태입니다. Python 노트북을 복사하여 붙여넣고, 복사한 것을 다음과 같이 수정하세요.

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
    # infer_schema_length를 늘려서 타입 추론의 정확도를 높임
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

내용으로는, Polars를 추가로 설치하고, Pandas에서 Polars의 DataFrame으로 전환하며, Polars의 타입 추론에 대응하는 처리를 하고 있습니다. 이 코드를 사용하면 Python의 Pandas 외에도 Polars로 풀 수 있게 됩니다.

### 주의사항

Pandas, Polars, SQL로 100본 노크를 10문제씩 풀어갈 예정이지만, SQL에서는 Sklearn 같은 머신러닝 처리를 다룰 수 없습니다. 공식 문서에 "언어에 따라 적합하지 않은 문제가 있을 수 있습니다"라고 되어 있으므로, 답이 불가능한 문제의 경우는 건너뜁니다. 현재 SQL에 대해서는 답이 10문제만 있지만, 10문제 이후에도 가능한 문제는 최대한 풀어갈 예정입니다. Polars는 Rust 언어가 아닌 Python 버전으로 풀며, Pandas와 마찬가지로 모든 문제에 답할 예정입니다.

## 문제

문제를 풀기 전에 반드시 첫 번째 코드 셀을 실행하세요. 실행하지 않으면 변수가 정의되지 않아 데이터 처리 문제가 발생할 수 있으므로 잊지 말고 실행하세요.

### 문제 1

> P-001: 레시트 명세 데이터（df_receipt）에서 모든 항목의 처음 10건을 표시하여, 어떤 데이터를 보유하고 있는지 육안으로 확인하세요.

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

### 문제 2

> P-002: 레시트 명세 데이터（df_receipt）에서 판매 연월일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 금액（amount）의 순서로 열을 지정하여 10건을 표시하세요.

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

### 문제 3

> P-003: 레시트 명세 데이터（df_receipt）에서 판매 연월일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 금액（amount）의 순서로 열을 지정하여 10건을 표시하세요. 단, sales_ymd를 sales_date로 항목 이름을 변경하여 추출하세요.

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

### 문제 4

> P-004: 레시트 명세 데이터（df_receipt）에서 판매 일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 금액（amount）의 순서로 열을 지정하여, 다음 조건을 만족하는 데이터를 추출하세요.
>
> - 고객 ID（customer_id）が"CS018205000001"

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

### 문제 5

> P-005: 레시트 명세 데이터（df_receipt）에서 판매 일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 금액（amount）의 순서로 열을 지정하여, 다음 모든 조건을 만족하는 데이터를 추출하세요.
>
> - 고객 ID（customer_id）が"CS018205000001"
> - 판매 금액（amount）が1,000以上

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

### 문제 6

> P-006: 레시트 명세 데이터（df_receipt）에서 판매 일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 수량（quantity）、판매 금액（amount）의 순서로 열을 지정하여, 다음 모든 조건을 만족하는 데이터를 추출하세요.
>
> - 고객 ID（customer_id）が"CS018205000001"
> - 판매 금액（amount）が1,000以上または 판매 수량（quantity）が5以上

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

### 문제 7

> P-007: 레시트 명세 데이터（df_receipt）에서 판매 일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 금액（amount）의 순서로 열을 지정하여, 다음 모든 조건을 만족하는 데이터를 추출하세요.
>
> - 고객 ID（customer_id）が"CS018205000001"
> - 판매 금액（amount）が1,000以上2,000以下

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

### 문제 8

> P-008: 레시트 명세 데이터（df_receipt）에서 판매 일（sales_ymd）、고객 ID（customer_id）、상품 코드（product_cd）、판매 금액（amount）의 순서로 열을 지정하여, 다음 모든 조건을 만족하는 데이터를 추출하세요.
>
> - 고객 ID（customer_id）が"CS018205000001"
> - 상품 코드（product_cd）が"P071401019"以外

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

### 문제 9

> P-009: 다음 처리에서 출력 결과를 변경하지 않고 OR를 AND로 바꿔보세요.
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

### 문제 10

> P-010: 상점 데이터（df_store）에서 상점 코드（store_cd）が"S14"로 시작하는 것만 모든 항목을 추출하여 10건을 표시하세요.

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

## 문제 10까지의 소감

문제 내용으로는 테이블에서 열을 선택하고 간단히 필터링하여 출력하는 내용이므로, 소개로서는 매우 쉽다고 느꼈습니다. 따라서 2개 언어로 3패턴의 답이라도 어렵지 않았습니다. Pandas는 SQL처럼 쿼리를 작성할 수 있고, SQL보다 깔끔하게 요약되므로 쓰임새가 좋습니다. SQL처럼 SELECT 문이나 FROM 절을 매번 쓰지 않기 때문에 깔끔한 것 같습니다. Polars도 Pandas와 비슷한 방식으로 작성할 수 있고, 매우 빠르기 때문에 매력적인 선택지입니다. 다만 쿼리를 Pandas처럼 사용할 수 없어서 여러 열에서 여러 조건으로 필터링할 때 Pandas보다 작성하기가 더 어렵고, 간단한 처리에 한정하면 SQL보다 중복이 많아 보일 수 있습니다. 또한, starts_with가 stawts_with처럼 str 타입의 메서드 이름에서 표기 변동이 일어나므로 세부적으로 주의가 필요합니다.
SQL은 매번 SELECT나 FORM을 써야 하지만 문·구마다 명시적으로 블록이 나뉘어 있으므로 간단한 쿼리라면 매우 이해하기 쉽습니다. 반복적으로 문·구를 쓰는 구조이므로 어쩌면 기억하기 쉬운 점에서 SQL에 장점이 있을 수 있습니다.

공식의 100본 노크 설명 책도 있으므로, 불명확한 점이 있으면 책을 참조하세요 (Polars는 임의로 추가한 것이므로 기재되지 않을 것으로 생각됩니다).
* [데이터 사이언스 100본 노크 구조화 데이터 처리 편 가이드북](https://amzn.to/4i5DEt2)