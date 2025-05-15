---
title: Python으로 중첩된 JSON(딕셔너리)을 CSV나 df로 변환하는 방법
slug: pythonjsoncsvdf
description: ""
date: 2023-06-27T16:36:48.821Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/python_logo.webp
draft: false
tags: ['JSON', 'Python', 'API']
categories: ['Programming']
---

# Python으로 중첩된 JSON(딕셔너리)을 CSV나 df로 변환하는 방법

<p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/1170695230331030502?hl=ja#">날씨 웹 서비스의 API</a>에서 JSON을 가져와 중첩된 JSON 값을 재귀 함수를 사용하여 완전히 추출하여 Excel, CSV, Pandas의 데이터 프레임 등으로 변환하는 코드를 작성했습니다. 간단히 설명하겠습니다.<br></p><h2 id="hcf2b66e679">코드</h2><pre><code class="hljs"><span class="hljs-keyword">import</span> time

<span class="hljs-keyword">import</span> requests <span class="hljs-keyword">as</span> req
<span class="hljs-keyword">import</span> pandas <span class="hljs-keyword">as</span> pd

<span class="hljs-keyword">def</span> <span class="hljs-title function_">conv_to_2d</span>(<span class="hljs-params">objct, parent=<span class="hljs-literal">None</span>, num=<span class="hljs-literal">None</span></span>):
    <span class="hljs-keyword">for</span> key, vals <span class="hljs-keyword">in</span> objct.items():
        <span class="hljs-comment"># key의 설정</span>
        <span class="hljs-keyword">if</span> parent <span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-literal">None</span> <span class="hljs-keyword">and</span> num <span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-literal">None</span>:
            abs_key = <span class="hljs-string">"{}.{}.{}"</span>.<span class="hljs-built_in">format</span>(parent, key, num)
        <span class="hljs-keyword">elif</span> parent <span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-literal">None</span>:
            abs_key = <span class="hljs-string">"{}.{}"</span>.<span class="hljs-built_in">format</span>(parent, key)
        <span class="hljs-keyword">else</span>:
            abs_key = key

        <span class="hljs-comment"># vals의 타입에 따라 처리 분기</span>
        <span class="hljs-keyword">if</span> <span class="hljs-built_in">type</span>(vals) <span class="hljs-keyword">is</span> <span class="hljs-built_in">dict</span>:
            <span class="hljs-keyword">yield</span> <span class="hljs-keyword">from</span> conv_to_2d(objct=vals, parent=key)
        <span class="hljs-keyword">elif</span> <span class="hljs-built_in">type</span>(vals) <span class="hljs-keyword">is</span> <span class="hljs-built_in">list</span>:
            val_list = []
            <span class="hljs-keyword">for</span> n, val <span class="hljs-keyword">in</span> <span class="hljs-built_in">enumerate</span>(vals):
                is_target = [<span class="hljs-built_in">type</span>(val) <span class="hljs-keyword">is</span> <span class="hljs-built_in">int</span>, <span class="hljs-built_in">type</span>(val) <span class="hljs-keyword">is</span> <span class="hljs-built_in">float</span>, <span class="hljs-built_in">type</span>(val) <span class="hljs-keyword">is</span> <span class="hljs-built_in">bool</span>]
                <span class="hljs-keyword">if</span> <span class="hljs-built_in">type</span>(val) <span class="hljs-keyword">is</span> <span class="hljs-built_in">str</span>:
                    <span class="hljs-keyword">if</span> val:
                        val_list += [val]
                <span class="hljs-keyword">elif</span> <span class="hljs-built_in">any</span>(is_target):
                    num_str = <span class="hljs-built_in">str</span>(val)
                    <span class="hljs-keyword">if</span> num_str:
                        val_list += [num_str]
                <span class="hljs-keyword">elif</span> <span class="hljs-built_in">type</span>(val) <span class="hljs-keyword">is</span> <span class="hljs-built_in">dict</span>:
                    <span class="hljs-keyword">yield</span> <span class="hljs-keyword">from</span> conv_to_2d(objct=val, parent=abs_key, num=n)
            <span class="hljs-keyword">if</span> val_list:
                <span class="hljs-keyword">yield</span> abs_key, <span class="hljs-string">","</span>.join(val_list)
        <span class="hljs-keyword">else</span>:
            <span class="hljs-keyword">yield</span> abs_key, vals

<span class="hljs-keyword">def</span> <span class="hljs-title function_">get_json</span>(<span class="hljs-params">url</span>):
    r = req.get(url)
    <span class="hljs-keyword">return</span> r.json()

<span class="hljs-keyword">def</span> <span class="hljs-title function_">main</span>():
    base_url = <span class="hljs-string">"http://weather.livedoor.com/forecast/webservice/json/v1?city={}"</span>
    city_id = [<span class="hljs-string">"400040"</span>, <span class="hljs-string">"290010"</span>, <span class="hljs-string">"270000"</span>, <span class="hljs-string">"190010"</span>, <span class="hljs-string">"130010"</span>, <span class="hljs-string">"015010"</span>, <span class="hljs-string">"473000"</span>, <span class="hljs-string">"350010"</span>]
    url_list = [base_url.<span class="hljs-built_in">format</span>(id_) <span class="hljs-keyword">for</span> id_ <span class="hljs-keyword">in</span> city_id]

    weather_table = []
    <span class="hljs-keyword">for</span> url <span class="hljs-keyword">in</span> url_list:
        res = get_json(url)
        record = {key: val <span class="hljs-keyword">for</span> key, val <span class="hljs-keyword">in</span> conv_to_2d(res)}
        weather_table.append(record)
        time.sleep(<span class="hljs-number">1</span>)
    df = pd.DataFrame(weather_table)
    df.to_excel(<span class="hljs-string">"sample.xlsx"</span>, index=<span class="hljs-literal">False</span>)

<span class="hljs-keyword">if</span> __name__ == <span class="hljs-string">"__main__"</span>:
    main()
</code></pre><p><br></p><h2 id="h6ae61e96eb">처리 내용</h2><h3 id="hdf531bb9c1">STEP1 URL 설정</h3><p>main 함수를 실행하여 프로그램 전체를 동작시키기 때문에, main 함수부터 순서대로 처리를 추적합니다. <code>http://weather.livedoor.com/forecast/webservice/json/v1?city=</code>의 = 뒤에 city_id를 입력하면, city_id에 해당하는 도시의 날씨 정보를 가져올 수 있습니다. city_id를 입력한 리스트를 만들고, url_list 변수에서는 내포 표기로 url에 city_id를 삽입한 url의 리스트를 생성합니다.<br></p><h3 id="h6c99723043">STEP2 JSON 획득</h3><p>for문 외부에 응답을 저장하기 위한 빈 리스트 <code>weather_table</code>을 생성합니다. url_list를 for문에 적용하여 get_json 함수로 JSON을 획득합니다. get_json 함수에서는 url을 인수로 받아 requests로 HTTP 요청 GET 메서드로 API에서 응답을 획득합니다. 획득한 응답을 json으로 읽어 main 함수에 값을 반환합니다.<br></p><h3 id="h92917775bb">STEP3 JSON의 이차원화</h3><p>본 게시물의 주제입니다. 획득한 JSON을 재귀 함수를 사용하여 키와 값의 세트를 획득합니다. <code>conv_to_2d</code>가 이번에 작성한 함수입니다. <code>conv_to_2d</code>는 제네레이터 함수로서 작동하여 순서대로 키와 값의 세트를 획득할 수 있으므로 딕셔너리 내포 표기로 딕셔너리 레코드를 생성합니다. 재귀 함수는 함수 a 안에서 자신(함수 a)을 호출하는 처리를 의미합니다.<br></p><h4 id="hc3cb2d1b9d">재귀 함수를 채택하는 이유</h4><p>이번에 재귀 함수를 사용하는 이유는, 다른 JSON의 이용도 고려하여 데이터 양이 불명확하고, 중첩(중첩)이 얼마나 있는지 불명확한 것을 일단은 가정하여, 올바른 형식의 JSON이라면 변환할 수 있도록 하기 위함입니다. 그때 N중의 for에 걸쳐야 하며, 그 처리를 실현하는 방법으로 재귀 함수가 최적이라는 것이 재귀 함수를 이용하는 이유입니다.<br></p><h4 id="he873b16ad8">재귀 함수의 정지 조건</h4><p>conv_to_2d 함수에서 conv_to_2d 함수를 호출하기 때문에 무조건 실행하면 무한히 conv_to_2d가 호출되어 처리되지 않게 됩니다(에러). 따라서 어떤 조건으로 함수를 멈추게 해야 합니다만, 이번에는 읽을 JSON 값이 없어질 때까지가 정지 조건입니다. yield로 값을 반환하면서 모든 값을 반환하는 것을 기다리는 쪽이 처리 흐름이 간단해 보이므로 return을 사용하지 않고 작성했습니다.<br></p><h4 id="h2bbd84fdd4">인수와 함수의 사용 방법</h4><table><tbody><tr><th colspan="1" rowspan="1"><p>인수</p></th><th colspan="1" rowspan="1"><p>설명</p></th></tr><tr><td colspan="1" rowspan="1"><p>objct</p></td><td colspan="1" rowspan="1"><p>딕셔너리 타입의 객체</p></td></tr><tr><td colspan="1" rowspan="1"><p>parent=None</p></td><td colspan="1" rowspan="1"><p>부모 키의 값</p></td></tr><tr><td colspan="1" rowspan="1"><p>num=None</p></td><td colspan="1" rowspan="1"><p>리스트의 인덱스</p></td></tr></tbody></table><p><br>인수는 딕셔너리 타입의 객체를 읽는 objct 인수, 부모 키의 값을 읽는 parent 인수, 리스트의 인덱스 번호를 나타내는 num 인수로 구성되어 있습니다. 처음 함수를 읽을 때는 objct만 인수를 지정하여 사용합니다.<br></p><h4 id="hd834353ab5">동작</h4><p>함수의 호출 시에는 딕셔너리 타입의 최상층을 읽기 때문에, 부모 키나 리스트의 인덱스는 존재하지 않습니다. 따라서 메인 함수에서는 objct만 지정하여 실행합니다. 실행한 후에 for문과 items()로 딕셔너리를 키와 값으로 분해하여 개별적으로 값의 확인을 합니다.<br></p><h5 id="h814796f74c">키</h5><p>부모 키나 인덱스 번호가 있는 경우에는 부모 정보와 for로 읽어낸 자 키를 .으로 구분하여 결합하여 중첩 구조를 표현하고 있습니다.<br></p><h5 id="h1ef6b169c7">값</h5><p>값이 딕셔너리인지 리스트인지 문자열이나 숫자, 진위값인지에 따라 처리를 나눕니다. 딕셔너리의 경우에는 키를 추가하여 <code>conv_to_2d</code>를 읽어 더 깊은 계층의 딕셔너리 내용을 확인합니다. 이로써 N중의 for 동작을 실현합니다. 리스트의 경우에는 리스트의 인덱스 번호를 enumerate로 획득하면서 다시 딕셔너리인지 문자열 등인지 확인하고 있습니다. 리스트 안에 리스트가 있는 것은 고려하지 않았습니다. 리스트 안에 딕셔너리가 있으면 부모 키와 인덱스 번호를 추가하여 <code>conv_to_2d</code>를 재귀합니다. 재귀 함수의 값을 제네레이터 함수로서 획득하고 싶을 때는 재귀 호출의 앞에 <code>yield from</code>을 추가합니다.<br></p><h3 id="hb70ec3c7d5">STEP4 레코드의 등록</h3><p><code><br></code></p><p><code>weather_table</code>에 읽어낸 딕셔너리 레코드를 저장합니다. 경량으로 소량의 처리이지만 상대 서버에 부하를 주지 않도록 1초 대기합니다.<br></p><h3 id="h82952b0a95">STEP5 데이터 프레임의 생성과 변환</h3><p>for가 동작한 후에 <code>weather_table</code>을 Pandas에 읽어 들여 데이터 프레임으로 변환합니다. 리스트 타입 > 딕셔너리 타입의 이차원 구성으로 키의 구성이 다양해도 잘 테이블 변환할 수 있도록 되어 있습니다. 그 후 데이터 프레임으로 변환하면 일반적인 Pandas와 마찬가지로 필터링이나 변환을 할 수 있으므로, Excel 형식·CSV·TSV·Pickle·HTML 등 원하는 형식으로 변환할 수 있습니다.<br></p><h2 id="h043936e33f">출력 이미지</h2><p>※데이터 양의 관계로 열은 상당히 생략하였습니다.<br></p><table><tbody><tr><th colspan="1" rowspan="1"><p>pinpointLocations.name.0</p></th><th colspan="1" rowspan="1"><p>pinpointLocations.link.1</p></th><th colspan="1" rowspan="1"><p>pinpointLocations.name.1</p></th></tr><tr><td colspan="1" rowspan="1"><p>대무타시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/4020300</p></td><td colspan="1" rowspan="1"><p>구루메시</p></td></tr><tr><td colspan="1" rowspan="1"><p>나라시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/2920200</p></td><td colspan="1" rowspan="1"><p>다이와고다카시</p></td></tr><tr><td colspan="1" rowspan="1"><p>오사카시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/2714000</p></td><td colspan="1" rowspan="1"><p>사카이시</p></td></tr><tr><td colspan="1" rowspan="1"><p>코후시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/1920500</p></td><td colspan="1" rowspan="1"><p>야마나시시</p></td></tr><tr><td colspan="1" rowspan="1"><p>센다이구</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/1310200</p></td><td colspan="1" rowspan="1"><p>춘추구</p></td></tr><tr><td colspan="1" rowspan="1"><p>무로란시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/0121300</p></td><td colspan="1" rowspan="1"><p>토마코마시</p></td></tr><tr><td colspan="1" rowspan="1"><p>미야코지마시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/4737500</p></td><td colspan="1" rowspan="1"><p>다라마무라</p></td></tr><tr><td colspan="1" rowspan="1"><p>시모노세키시</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/3520200</p></td><td colspan="1" rowspan="1"><p>우베시</p></td></tr></tbody></table><p><br></p><h2 id="ha214098e44">요약</h2><p>중첩된 JSON도 재귀 함수도 이제 두렵지 않다. 분석이나 재귀 함수의 이해에 도움이 되었으면 좋겠습니다！</p>