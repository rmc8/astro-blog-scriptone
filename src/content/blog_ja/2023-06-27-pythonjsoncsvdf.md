---
title: PythonでネストしたJSON(辞書型)をcsvやdfに変換する方法
slug: pythonjsoncsvdf
description:  ""
date: 2023-06-27T16:36:48.821Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/python_logo.webp
draft: false
tags: ['JSON', 'Python', 'API']
categories: ['Programming']
---

# PythonでネストしたJSON(辞書型)をcsvやdfに変換する方法

<p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/1170695230331030502?hl=ja#">お天気WebサービスのAPI</a>よりJSONを取得して、入れ子になっているJSONの値を再帰関数を使い根こそぎ取得して、ExcelやCSV、Pandasのデータフレーム等に変換するコードを書きました。簡単に解説をします。<br></p><h2 id="hcf2b66e679">コード</h2><pre><code class="hljs"><span class="hljs-keyword">import</span> time

<span class="hljs-keyword">import</span> requests <span class="hljs-keyword">as</span> req
<span class="hljs-keyword">import</span> pandas <span class="hljs-keyword">as</span> pd

<span class="hljs-keyword">def</span> <span class="hljs-title function_">conv_to_2d</span>(<span class="hljs-params">objct, parent=<span class="hljs-literal">None</span>, num=<span class="hljs-literal">None</span></span>):
    <span class="hljs-keyword">for</span> key, vals <span class="hljs-keyword">in</span> objct.items():
        <span class="hljs-comment"># keyの設定</span>
        <span class="hljs-keyword">if</span> parent <span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-literal">None</span> <span class="hljs-keyword">and</span> num <span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-literal">None</span>:
            abs_key = <span class="hljs-string">"{}.{}.{}"</span>.<span class="hljs-built_in">format</span>(parent, key, num)
        <span class="hljs-keyword">elif</span> parent <span class="hljs-keyword">is</span> <span class="hljs-keyword">not</span> <span class="hljs-literal">None</span>:
            abs_key = <span class="hljs-string">"{}.{}"</span>.<span class="hljs-built_in">format</span>(parent, key)
        <span class="hljs-keyword">else</span>:
            abs_key = key

        <span class="hljs-comment"># valsのタイプごとに処理を分岐</span>
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
        time.speep(<span class="hljs-number">1</span>)
    df = pd.DataFrame(weather_table)
    df.to_excel(<span class="hljs-string">"sample.xlsx"</span>, index=<span class="hljs-literal">False</span>)

<span class="hljs-keyword">if</span> __name__ == <span class="hljs-string">"__main__"</span>:
    main()
</code></pre><p><br></p><h2 id="h6ae61e96eb">処理内容</h2><h3 id="hdf531bb9c1">STEP1 URLの設定</h3><p>main関数を動作させることでプログラム全体を動かすため、main関数より順番に処理を追っていきます。<code>http://weather.livedoor.com/forecast/webservice/json/v1?city=</code>の=の後にcity_idを入力すると、city_idに対応した都市のお天気情報を取得することができます。city_idを入力したリストを作り、url_list変数では内包表記を使ってurlにcity_idを埋め込んだurlのリストを生成しています。<br></p><h3 id="h6c99723043">STEP2 JSONの取得</h3><p>for文の外にレスポンスを格納するための空リスト<code>weather_table</code>を生成します。url_listをfor文にかけてget_json関数でJSONを取得します。get_json関数ではurlを引数にとり、requestsでHTTPリクエストGETメソッドでAPIよりレスポンスを取得します。取得したレスポンスをjsonとして読み込ませてmain関数に値を返します。<br></p><h3 id="h92917775bb">STEP3 JSONの二次元化</h3><p>本投稿の主題です。取得したJSONを再帰関数を使ってキーと値のセットを取得します。<code>conv_to_2d</code>が今回記述した関数です。<code>conv_to_2d</code>はジェネレータ関数としても動作して順番にキーと値のセットを取得できるので辞書内包表記で辞書レコードを生成します。再帰関数とは、関数aの中で自身(関数a)を呼び出す処理のことを指します。<br></p><h4 id="hc3cb2d1b9d">再帰関数を採用する理由</h4><p>今回、再帰関数を使用する理由は、ほかのJSONの利用も考えデータ量がどれだけあるか不明、ネスト（入れ子）がどれだけあるか不明であることを一旦は想定して、正しい形式のJSONであれば変換できることを前提にしたいと思います。その時にN重のforにかける必要があり、その処理を実現する方法として再帰関数が最適であることが再帰関数を利用する理由です。<br></p><h4 id="he873b16ad8">再帰関数の停止条件</h4><p>conv_to_2d関数からconv_to_2d関数を呼び出しをするため無条件にこれを実行すると無限にconv_to_2dが呼び出されて処理が終わらない（エラー）となります。そのため何かしらの条件で関数を止めさせる必要がありますが、今回は読み出すべきJSONの値がなくなるまでが停止条件です。yieldで値を返しながらすべての値を返し終わるのを待つほうが処理のフローはシンプルそうなのでreturnを使わずに書きました。<br></p><h4 id="h2bbd84fdd4">引数と関数の使用方法</h4><table><tbody><tr><th colspan="1" rowspan="1"><p>引数</p></th><th colspan="1" rowspan="1"><p>説明</p></th></tr><tr><td colspan="1" rowspan="1"><p>objct</p></td><td colspan="1" rowspan="1"><p>辞書型のオブジェクト</p></td></tr><tr><td colspan="1" rowspan="1"><p>parent=None</p></td><td colspan="1" rowspan="1"><p>親のキーの値</p></td></tr><tr><td colspan="1" rowspan="1"><p>num=None</p></td><td colspan="1" rowspan="1"><p>リストのインデックス</p></td></tr></tbody></table><p><br>引数は辞書型のオブジェクトを読み出すobjct引数、親のキーの値を読み出すparent引数、リストのインデックス番号を示すnum引数で構成されています。一番最初に関数を読み出すときにはobjctだけに引数を指定して使用します。<br></p><h4 id="hd834353ab5">動作</h4><p>関数の呼び出し時は辞書型の最上層を読み出すため、親のキーやリストのインデックスは存在しません。そのため、メイン関数ではobjctだけを指定して実行します。実行したのちにfor文とitems()で辞書をキーと値に分解して個別に値の確認をします。<br></p><h5 id="h814796f74c">キー</h5><p>親キーやインデックス番号がある場合には親情報とforで読みだした子キーを.で区切りつつ結合してネスト構造を表現しています。<br></p><h5 id="h1ef6b169c7">値</h5><p>値が辞書かリストか文字列や数値、真偽値であるかで処理を分けます。辞書の場合にはキーを添えて<code>conv_to_2d</code>を読み出しさらに深い階層の辞書の内容を確認します。これによりN重のfor動作を実現します。リストの場合にはリストのインデックス番号をenumerateで取得しつつ再度辞書か文字列等かであるかをチェックしています。リスト内にリストがあることは考慮していません。リスト内に辞書があれば親キーとインデックス番号を添えて<code>conv_to_2d</code>を再帰します。再帰関数の値をジェネレータ関数として取得したいときには再帰呼び出しの手前に<code>yield from</code>を添えます。<br></p><h3 id="hb70ec3c7d5">STEP4 レコードの登録</h3><p><code><br></code></p><p><code>weather_table</code>に読みだした辞書レコードを格納します。軽量で少量の処理ですが相手サーバーに負荷をかけないように1秒待機します。<br></p><h3 id="h82952b0a95">STEP5 データフレームの生成と変換</h3><p>forが動作し終わったのちに<code>weather_table</code>をPandasに読み込ませてデータフレームに変換します。リスト型＞辞書型の二次元構成でキーの構成がバラバラでもうまいことテーブル変換ができるようになっています。あとはデータフレームに変換すれば通常のPandasと同様にフィルタリングや変換ができるので、Excel形式・CSV・TSV・Pickle・HTMLなど好きな形式に変換できます。<br></p><h2 id="h043936e33f">出力イメージ</h2><p>※データ量の都合で列はかなり端折っております。<br></p><table><tbody><tr><th colspan="1" rowspan="1"><p>pinpointLocations.name.0</p></th><th colspan="1" rowspan="1"><p>pinpointLocations.link.1</p></th><th colspan="1" rowspan="1"><p>pinpointLocations.name.1</p></th></tr><tr><td colspan="1" rowspan="1"><p>大牟田市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/4020300</p></td><td colspan="1" rowspan="1"><p>久留米市</p></td></tr><tr><td colspan="1" rowspan="1"><p>奈良市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/2920200</p></td><td colspan="1" rowspan="1"><p>大和高田市</p></td></tr><tr><td colspan="1" rowspan="1"><p>大阪市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/2714000</p></td><td colspan="1" rowspan="1"><p>堺市</p></td></tr><tr><td colspan="1" rowspan="1"><p>甲府市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/1920500</p></td><td colspan="1" rowspan="1"><p>山梨市</p></td></tr><tr><td colspan="1" rowspan="1"><p>千代田区</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/1310200</p></td><td colspan="1" rowspan="1"><p>中央区</p></td></tr><tr><td colspan="1" rowspan="1"><p>室蘭市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/0121300</p></td><td colspan="1" rowspan="1"><p>苫小牧市</p></td></tr><tr><td colspan="1" rowspan="1"><p>宮古島市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/4737500</p></td><td colspan="1" rowspan="1"><p>多良間村</p></td></tr><tr><td colspan="1" rowspan="1"><p>下関市</p></td><td colspan="1" rowspan="1"><p>http://weather.livedoor.com/area/forecast/3520200</p></td><td colspan="1" rowspan="1"><p>宇部市</p></td></tr></tbody></table><p><br></p><h2 id="ha214098e44">まとめ</h2><p>ネストのJSONも再帰関数もこれでこわくない。分析や再帰関数の理解に役立てたらうれしいです！</p>  

