---
title: spotify-apicd
description: 
date: 2023-06-27T16:44:52.580Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/tunebrowser.webp
draft: false
tags: ['Python', 'JSON', 'API', 'Spotify']
categories: ['Programming']
---

# Spotify APIを使ってCDのジャケット画像を取得する

<p>PythonでSpotify APIを使って、CDのジャケット画像の取得を試みます。</p><h2 id="h9707d3a59a">概要</h2><p>Windows 10で管理しているミュージックディレクトリを使って、Spotify APIのQueryを作成して、CDのジャケット画像のURLを取得します。ジャケット画像を取得することで、プレイヤーソフトでジャケットが表示されるようになります。手作業だと手間がかかる作業ですが、大部分を自動取得できるようにします。</p><p>Repository: <a href="https://github.com/rmc8/cd_jacket_scraper_for_spotify">https://github.com/rmc8/cd_jacket_scraper_for_spotify</a></p><h2 id="h255e3e779e">APIを使う準備</h2><p>ここでは、APIを使うためのキーの取得と、Pythonのライブラリの導入をします。</p><h3 id="he3e7f8020b">APIキーの取得</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Developerページ</a>にログインします。Spotifyのアカウントでログインできます。アカウントがない場合には、Spotifyのアカウントを作成してください。</p><p>ログインできたら、［CREATE ANN APP］をクリックします。<br>「App name」には「CD Jacket scraper」などわかる名前を入力して、「App description」には「Get the CD jacket」などわかるような説明を入力します。その後、2つあるチェックボックスにチェックをします。チェックするとPermissionやGuidelineなどに同意することになります。入力内容に誤りがないことを確認して、［CREATE］ボタンをクリックします。</p><p>クリック後、APPが作成されダッシュボードが表示されます。ダッシュボード内にある、［SHO CLIENT SECRET］をクリックして、Client IDとClient SecretをWindowsの環境変数に登録します。</p><p>［FYI］<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">環境変数の設定</a></p><p>Client IDは、変数名を「SPOTIFY_CLIENT_ID」にして、変数値にダッシュボードに表示されている値を貼り付けます。同様に、Client Secretは、変数名を「SPOTIFY_SECRET_ID」にして、変数値にダッシュボードの値を貼り付けます。変数の登録が完了したら、変数を使用できる状態にするため、<strong>PCを一度再起動してください</strong>。</p><h3 id="h0f9c9e996f">Pythonのライブラリを導入する</h3><p>pipなどで下記ライブラリを導入してください。</p><ul><li>spotipy</li><li>requests</li><li>PySimpleGUI</li></ul><pre><code class="hljs">pip <span class="hljs-keyword">install</span> spotipy requests PySimpleGUI
</code></pre><h2 id="hfedbcd1844">大まかな動作内容</h2><p>プログラム（<a href="http://main.py">main.py</a>）を実行すると、インプットとなるディレクトリのファイルパスを選択するダイアログが表示されます。選択したディレクトリのパスをrootとして使い、<code>os.walk()</code>を使ってrootディレクトリの配下にあるディレクトリを探索します。ここでは以下のディレクトリ構造を例にします。</p><pre><code class="hljs">D:\
├─(K)NoW_NAME
│  ├─Freesia（TVアニメ「サクラクエスト」EDテーマ）
│  │  ├─<span class="hljs-number">1</span>-<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Freesia</span>.</span></span>flac
│  │  ├─<span class="hljs-number">2</span>-Blue <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Rose</span>.</span></span>flac
│  │  └─<span class="hljs-number">3</span>-<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">ASTER</span>.</span></span>flac
│  └─混沌の中で踊れ
│      ├─<span class="hljs-number">01</span> - Who am <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">I</span>.</span></span>flac
│      ├─<span class="hljs-number">02</span> - Night <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">SURFING</span>.</span></span>flac
│      └─<span class="hljs-number">08</span> - BAD <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">NICK</span>.</span></span>flac
├─sub_dir
│  ├─Art Blakey And THE JAZZ MESSENGERS
│  │  └─Impulse!
│  │      ├─<span class="hljs-number">01</span> - <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Alamode</span>.</span></span>flac
│  │      ├─<span class="hljs-number">02</span> - <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">Invitation</span>.</span></span>flac
│  │      └─<span class="hljs-number">06</span> - Gee Baby, Ain't I Good To <span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">You</span>.</span></span>flac
│  └─上北 健
│      └─SCOOP
│          ├─<span class="hljs-number">1</span>-<span class="hljs-literal">false</span> color.flac
│          ├─<span class="hljs-number">2</span>-<span class="hljs-module-access"><span class="hljs-module"><span class="hljs-identifier">DIARY</span>.</span></span>flac
│          └─<span class="hljs-number">9</span>-アイニイキル.flac
└─蟲師
    └─蟲師 オリジナルサウンドトラック 蟲音 全 Soundtrack 弐
        ├─<span class="hljs-number">01</span> - 夢路.flac
        ├─<span class="hljs-number">02</span> - 「天辺の糸」.flac
        └─<span class="hljs-number">24</span> - 「緑の座」（OnAir Ver）.flac
</code></pre><p>D:\をrootとしたときに、<code>Freesia（TVアニメ「サクラクエスト」EDテーマ）</code>, <code>混沌の中で踊れ</code>, <code>Impulse!</code>, … , <code>蟲師 オリジナルサウンドトラック 蟲音 全 Soundtrack 弐</code>と最下部のディレクトリにたどり着くまで検索します。この最下部のディレクトリが、アルバム名にあたり、最下部のディレクトリから1つ上位のディレクトリがアーティス名の構造となります。</p><p>この構造を用いて、アルバム名とアーティスト名でSpotify APIで検索して、画像URLを取得します。画像URLから画像を取得して、<code>fr"d:\\\\(.*\\\\)*{artist_name}\\\\{album_name}\\\\{album_name}\.jpg"</code> の形式で保存します。</p><h2 id="h800b32a212">コードの解説</h2><p><a href="http://main.py">main.py</a>のmain関数を使って順番に解説します。Pythonのバージョンは3.8以降を前提とします。</p><h3 id="hb355af6c11">rootディレクトリの取得</h3><p>search_dirに検索するディレクトリのファイルパスを格納します。関数は以下の通りです。</p><pre><code class="language-python hljs">def sel_input_dir():
    layout = [
        [sg.Text(<span class="hljs-string">"ディレクトリ"</span>), sg.InputText(key=<span class="hljs-string">"ret"</span>),
         sg.FolderBrowse(key=<span class="hljs-string">"dir"</span>)],
        [sg.Submit(), sg.<span class="hljs-keyword">Exit</span>()],
    ]
    <span class="hljs-keyword">window</span> = sg.<span class="hljs-keyword">Window</span>(<span class="hljs-string">"Input"</span>, layout)
    <span class="hljs-keyword">while</span> True:
        event, values = <span class="hljs-keyword">window</span>.<span class="hljs-keyword">read</span>()
        <span class="hljs-keyword">if</span> event == <span class="hljs-string">"Submit"</span>:
            <span class="hljs-keyword">ret</span> = values[<span class="hljs-string">"ret"</span>]
            <span class="hljs-keyword">break</span>
        elif event <span class="hljs-keyword">in</span> (sg.WINDOW_CLOSED, <span class="hljs-string">"Exit"</span>):
            <span class="hljs-keyword">ret</span> = None
            <span class="hljs-keyword">break</span>
    <span class="hljs-keyword">window</span>.<span class="hljs-keyword">close</span>()
    <span class="hljs-keyword">return</span> <span class="hljs-keyword">ret</span>
</code></pre><p>PySimpleGUIでディレクトリのパスを取得するダイアログの表示とパスを返す処理を記載しています。layout変数で、GUIの構成を記して、window変数でWindowのタイトルと layoutを格納したWindowオブジェクトを取得します。</p><p>無限ループ内にwindowを読み出す処理を記載して、eventを感知する変数とInputボックス値を格納した辞書を取得します。if文で［Submit］・［Exit］・Windowを閉じるボタンを押されたか判定をして、Eventの種類に応じて処理を振り分けます。Windowを閉じたりExitしたりしたら、返り値にNoneを設定し、Submitが押されたときには、ディレクトリのパスを返り値に設定します。それぞれのケースで返り値の設定が完了したあと、無限ループを終了して、Windowを閉じてGUIの入力結果を返します。</p><p>なお、Noneを返された場合にはmain関数内の処理でプログラムを終了するようになっています。</p><pre><code class="language-python hljs">search_dir = sel_input_dir()
<span class="hljs-comment"># 中略</span>
<span class="hljs-keyword">if</span> search_dir is None:
    <span class="hljs-keyword">exit</span>()
</code></pre><h3 id="h4dee2b6890">Spotify APIに接続する</h3><p>spotify_auth関数を使って、Spotify APIに接続します。</p><pre><code class="language-python hljs">def spotify_auth():
    <span class="hljs-built_in">CLIENT_ID</span> = os.environ[<span class="hljs-string">"SPOTIFY_CLIENT_ID"</span>]
    <span class="hljs-built_in">CLIENT_SECRET</span> = os.environ[<span class="hljs-string">"SPOTIFY_SECRET_ID"</span>]
    client_credentials_manager = spotipy.oauth2.SpotifyClientCredentials(
        <span class="hljs-built_in">CLIENT_ID</span>, <span class="hljs-built_in">CLIENT_SECRET</span>
    )
    <span class="hljs-keyword">return</span> spotipy.Spotify(client_credentials_manager=client_credentials_manager)
</code></pre><p>環境変数から、Client IDとClient Secretの値を取得します。os.environを使うと、辞書形式で<code>{"変数名1": "変数値1", ... , "変数名N": "変数値N", }</code> のように値を読み出せます。Githubなど外部にアップロードしては困る値があるときに、環境変数などをつかって値を外だしするとセキュリティや値の変更など対応しやすくなります。API接続のコードの書き方は、ドキュメントに従って書けば特に考える必要もないと思われます。</p><p>Document: <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Welcome to Spotipy!</a></p><h3 id="h23dec6399e">ファイルを探索する</h3><p>get_cd_infoジェネレータで、ファイルパス・アーティスト名・アルバム名を取得します。</p><pre><code class="language-python hljs"><span class="hljs-keyword">def</span> <span class="hljs-title function_">get_cd_info</span>(<span class="hljs-params">path: <span class="hljs-built_in">str</span></span>) -&gt; <span class="hljs-type">Tuple</span>[<span class="hljs-built_in">str</span>, <span class="hljs-built_in">str</span>, <span class="hljs-built_in">str</span>]:
    <span class="hljs-string">"""
    Search to the lowest directory and return the name of the CD, the name of the artist and its file path.
    Args:
        path ([str]): File path to search
    Yields:
        [Tuple[str]]: dir_path, artist, cd_name
    """</span>
    <span class="hljs-keyword">for</span> root, dirs, _ <span class="hljs-keyword">in</span> os.walk(path):
        <span class="hljs-keyword">if</span> <span class="hljs-keyword">not</span> dirs:
            p = pathlib.Path(root)
            <span class="hljs-keyword">yield</span> root, p.parent.name, p.name
        <span class="hljs-keyword">for</span> <span class="hljs-built_in">dir</span> <span class="hljs-keyword">in</span> dirs:
            get_cd_info(<span class="hljs-string">f"<span class="hljs-subst">{path}</span>\\<span class="hljs-subst">{<span class="hljs-built_in">dir</span>}</span>"</span>)
</code></pre><p>引数pathで探索するディレクトリのPathを受け取り、<code>os.walk()</code>で探索をします。for文では、rootでディレクトリのPath、dirsでroot内にあるディレクトリのリストを受け取っています。アンダースコアは未使用ですが、root内にあるファイルのリストを取得できます。</p><p>dirsリストに値があるかif文で判定します。dirsリストに値がない場合、最下層のディレクトリであると判断できます。空リストをif文にかけると<code>False</code>になるので、<code>not</code>を使って<code>True</code>にします。その後、if文内でPathlibを使ってディレクトリ名（アルバム名）と親ディレクトリの名前（アーティスト名）を抽出して、<code>yield</code>でディレクトリのパスとまとめて返します。</p><p>ディレクトリがあるときは、for文で順番にディレクトリを読み出して、get_cd_infoジェネレータに下位のディレクトリを引数に設定して呼び出します。</p><p>for文ではファイルのリストをアンダースコアにして未使用の状態ですが、yieldの前に<code>[".flac", ".mp3", ".wav", ".dsf"]</code>など、音声ファイルが入っている場合にのみyieldで値を返すようも書き換えられます。この処理を加えると、大量のディレクトリを探索しても誤って画像を取得することを防げます。</p><h3 id="h8a1c72474e">画像のファイルパスを生成する</h3><p>ジェネレータから取得した値を使って、画像の保存先のパスを生成します。最下部のディレクトリまで探索するので、path変数に<code>D:\(K)NoW_NAME\Freesia（TVアニメ「サクラクエスト」EDテーマ）</code>のようにアーティスト名とアルバム名を含んだ状態で値が格納されます。f文字列を使って、<code>{path}\{アルバム名}.jpg</code>の形式で画像のファイルパスを生成します。<code>os.path.exists</code>で画像のファイルパスが存在している場合には、処理済みとして次のパスを取得し、存在しない場合にはAPIで画像のURLの取得を試みます。</p><h3 id="h5e654fe9be">アルバム名からノイズを除去する</h3><p>アルバム名には（通常盤）・（限定盤）・［Disk1］・［Disk-2］・［DISK 3］などAPIで検索の妨げになるワードが含まれることがあります。CDのデータベースでアルバム名や曲名など取得すると、ディスクや盤の違いを判別するためにこのような情報が付与されます。正規表現を用いて、ノイズを除去します。</p><pre><code class="language-python hljs">album = re.sub(<span class="hljs-string">r"\s*(\[|\(|（|【){1}.*(\]|\)|）|】)"</span>, <span class="hljs-string">""</span>, album)
album = re.sub(<span class="hljs-string">r"\s*(Disk|DISK){1}(\s|\-)*[0-9]{1,2}"</span>, <span class="hljs-string">""</span>, album)
</code></pre><h3 id="hb42a6fe730">Spotify Search APIで検索する</h3><p>Spotify Search APIを使って2回検索します。1回目はアーティスト名＋アルバム名で検索します。フィルターが強くなりすぎる場合もあるため、2回目はアルバム名のみで検索をします。</p><pre><code class="language-python hljs"><span class="hljs-keyword">for</span> try_num in <span class="hljs-built_in">range</span>(<span class="hljs-number">2</span>):
    <span class="hljs-keyword">sleep</span>(<span class="hljs-number">1</span>)
 # 中略（正規表現）
    query = album <span class="hljs-keyword">if</span> try_num <span class="hljs-keyword">else</span> <span class="hljs-keyword">f</span><span class="hljs-string">'"{artist}"&amp;"{album}"'</span>
    q_type = <span class="hljs-string">"album"</span> <span class="hljs-keyword">if</span> try_num <span class="hljs-keyword">else</span> <span class="hljs-string">"artist,album"</span>
    <span class="hljs-keyword">res</span> = <span class="hljs-keyword">sp</span>.<span class="hljs-built_in">search</span>(query, limit=<span class="hljs-number">1</span>, offset=<span class="hljs-number">0</span>, <span class="hljs-built_in">type</span>=q_type)
    <span class="hljs-built_in">items</span> = <span class="hljs-keyword">res</span>[<span class="hljs-string">"albums"</span>][<span class="hljs-string">"items"</span>]
    <span class="hljs-keyword">if</span> (img_url := _get_img_url(<span class="hljs-built_in">items</span>)) <span class="hljs-keyword">is</span> None:
     <span class="hljs-keyword">if</span> try_num:
      <span class="hljs-keyword">print</span>(<span class="hljs-keyword">f</span><span class="hljs-string">"[SKIP] {img_path}"</span>)
        <span class="hljs-keyword">continue</span>
</code></pre><p>for文で2回検索する処理を書き、<code>try_num</code>変数で検索Queryの切り替えをできるようにします。<code>{Trueのときの値} if {条件式・値} else {Falseの時の値}</code>の形式でクエリの切り替え処理を書きます。if文の条件式の値（int型）が<code>0</code>であれば<code>False</code>となり、それ以外であれば<code>True</code>となります。その挙動をつかい、1回目の処理では<code>query</code>変数にアーティスト名とアルバム名をセットします。日本語の検索をできるようにダブルクォーテーションで囲い、複数検索に対応するため&amp;をつかって検索の語句を結びます。リトライの際は単に<code>album</code>変数をつかいアルバム名だけで検索できるようにします。同様に<code>q_type</code>変数で、artist+albumで検索するように設定して、リトライの際にはalbumのみで検索する設定をします。</p><p>APIの使用方法は日本語で検索しても正確でないものも、情報が不十分なものも含まれています。不明点がある場合には、公式のドキュメントを調べたり、英語でも検索したりすることもお勧めします。</p><p>Document: <a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Web API Reference</a></p><p>Queryなど設定が完了したら、searchを使い検索します。limit引数で取得する検索結果の件数、offset引数で1番目の値の取得位置の調整ができます。Searchすると以下のようなResponseを得られます。</p><pre><code class="language-json hljs">{
   <span class="hljs-string">"albums"</span>:{
      <span class="hljs-string">"href"</span>:<span class="hljs-string">"https://api.spotify.com/v1/search?query=Kiss+The+Sun&amp;type=album&amp;offset=0&amp;limit=1"</span>,
      <span class="hljs-string">"items"</span>:[
         {
            <span class="hljs-string">"album_type"</span>:<span class="hljs-string">"album"</span>,
            <span class="hljs-string">"artists"</span>:[
               {
                  <span class="hljs-string">"external_urls"</span>:{
                     <span class="hljs-string">"spotify"</span>:<span class="hljs-string">"https://open.spotify.com/artist/2RJ0cQlHOmiZ7JuHBwgUbV"</span>
                  },
                  <span class="hljs-string">"href"</span>:<span class="hljs-string">"https://api.spotify.com/v1/artists/2RJ0cQlHOmiZ7JuHBwgUbV"</span>,
                  <span class="hljs-string">"id"</span>:<span class="hljs-string">"2RJ0cQlHOmiZ7JuHBwgUbV"</span>,
                  <span class="hljs-string">"name"</span>:<span class="hljs-string">"Vampires Everywhere!"</span>,
                  <span class="hljs-string">"type"</span>:<span class="hljs-string">"artist"</span>,
                  <span class="hljs-string">"uri"</span>:<span class="hljs-string">"spotify:artist:2RJ0cQlHOmiZ7JuHBwgUbV"</span>
               }
            ],
            <span class="hljs-string">"available_markets"</span>:[
               <span class="hljs-string">"JP"</span>,
               <span class="hljs-string">"US"</span>
            ],
            <span class="hljs-string">"external_urls"</span>:{
               <span class="hljs-string">"spotify"</span>:<span class="hljs-string">"https://open.spotify.com/album/6gyVPhElDPStV68cCFQlY5"</span>
            },
            <span class="hljs-string">"href"</span>:<span class="hljs-string">"https://api.spotify.com/v1/albums/6gyVPhElDPStV68cCFQlY5"</span>,
            <span class="hljs-string">"id"</span>:<span class="hljs-string">"6gyVPhElDPStV68cCFQlY5"</span>,
            <span class="hljs-string">"images"</span>:[
               {
                  <span class="hljs-string">"height"</span>:<span class="hljs-number">640</span>,
                  <span class="hljs-string">"url"</span>:<span class="hljs-string">"https://i.scdn.co/image/ab67616d0000b2738fa44d0ead2ee4635e5b4d16"</span>,
                  <span class="hljs-string">"width"</span>:<span class="hljs-number">640</span>
               },
               {
                  <span class="hljs-string">"height"</span>:<span class="hljs-number">300</span>,
                  <span class="hljs-string">"url"</span>:<span class="hljs-string">"https://i.scdn.co/image/ab67616d00001e028fa44d0ead2ee4635e5b4d16"</span>,
                  <span class="hljs-string">"width"</span>:<span class="hljs-number">300</span>
               },
               {
                  <span class="hljs-string">"height"</span>:<span class="hljs-number">64</span>,
                  <span class="hljs-string">"url"</span>:<span class="hljs-string">"https://i.scdn.co/image/ab67616d000048518fa44d0ead2ee4635e5b4d16"</span>,
                  <span class="hljs-string">"width"</span>:<span class="hljs-number">64</span>
               }
            ],
            <span class="hljs-string">"name"</span>:<span class="hljs-string">"Kiss the Sun Goodbye"</span>,
            <span class="hljs-string">"release_date"</span>:<span class="hljs-string">"2010-07-16"</span>,
            <span class="hljs-string">"release_date_precision"</span>:<span class="hljs-string">"day"</span>,
            <span class="hljs-string">"total_tracks"</span>:<span class="hljs-number">12</span>,
            <span class="hljs-string">"type"</span>:<span class="hljs-string">"album"</span>,
            <span class="hljs-string">"uri"</span>:<span class="hljs-string">"spotify:album:6gyVPhElDPStV68cCFQlY5"</span>
         }
      ],
      <span class="hljs-string">"limit"</span>:<span class="hljs-number">1</span>,
      <span class="hljs-string">"next"</span>:<span class="hljs-comment">"https://api</span>
.spotify.<span class="hljs-keyword">com</span>/v1/<span class="hljs-built_in">search</span>?query=Kiss+The+Sun&amp;<span class="hljs-built_in">type</span>=album&amp;offset=<span class="hljs-number">1</span>&amp;limit=<span class="hljs-number">1</span><span class="hljs-comment">",</span>
      <span class="hljs-string">"offset"</span>:<span class="hljs-number">0</span>,
      <span class="hljs-string">"previous"</span>:<span class="hljs-string">"None"</span>,
      <span class="hljs-string">"total"</span>:<span class="hljs-number">134</span>
   }
}
</code></pre><p>画像がある場合、jsonの0番目のアイテムのimagesキーに画像のURLがあります。_get_img_urlを使いURLの取得を試み、URLの取得ができれば画像を保存する処理をします。URLの取得に失敗したときは、検索条件を緩和して画像の取得をリトライします。</p><p>短時間にたくさんのRequestをしてサーバーに負担をかけてしまわないように、<code>sleep(1)</code>でRequestの間隔を1秒あけるようにしています。</p><h3 id="heafdbac5d0">画像を保存する</h3><p>URLの取得が成功したら、requestsでgetを実行して画像の取得をします。その後、requestsのResponseをディレクトリ内に書き込むことで画像を保存できます。画像を保存した後は、for文をbreakさせて再処理を実行しないようにします。</p><h2 id="hbdef663b6a">実行後のイメージ</h2><p>実行前は以下のようにほとんどジャケットが画像がない状態でした。</p><p>実行後は8割強ほど画像が取得できました。</p><h2 id="ha214098e44">まとめ</h2><p>100行足らずのコードで、500を超えるアーティストで多量のCDジャケットを取得できました。手作業ではとても時間がかかり飽きる作業ですが、コードを書いて実行するだけで大部分の画像取得作業を自動で完了させられます。<br>Pythonを書く手間も習得のコストも大きくはかからないので、CD画像の取得に役立てたら幸いです。</p>

