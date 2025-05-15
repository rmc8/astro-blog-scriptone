---
title: Spotify API를 사용하여 CD 재킷 이미지를 가져오기
slug: spotify-apicd
description: ""
date: 2023-06-27T16:44:52.580Z
preview: https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/tunebrowser.webp
draft: false
tags: ['Python', 'JSON', 'API', 'Spotify']
categories: ['Programming']
---

# Spotify API를 사용하여 CD 재킷 이미지를 가져오기

<p>Python으로 Spotify API를 사용하여 CD 재킷 이미지의 가져오기를 시도합니다.</p><h2 id="h9707d3a59a">개요</h2><p>Windows 10에서 관리하는 뮤직 디렉터리를 사용하여 Spotify API의 Query를 생성하여 CD 재킷 이미지의 URL을 가져옵니다. 재킷 이미지를 가져오면 플레이어 소프트웨어에서 재킷이 표시되게 됩니다. 수동 작업은 시간이 많이 걸리지만, 대부분을 자동으로 가져오도록 합니다.</p><p>Repository: <a href="https://github.com/rmc8/cd_jacket_scraper_for_spotify">https://github.com/rmc8/cd_jacket_scraper_for_spotify</a></p><h2 id="h255e3e779e">API 사용 준비</h2><p>여기서는 API 사용을 위한 키의 획득과 Python 라이브러리의 도입을 합니다.</p><h3 id="he3e7f8020b">API 키 획득</h3><p><a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">Developer 페이지</a>에 로그인합니다. Spotify 계정으로 로그인할 수 있습니다. 계정이 없는 경우 Spotify 계정을 생성하세요.</p><p>로그인 후, [CREATE AN APP]을 클릭합니다.<br>‘App name’에는 ‘CD Jacket scraper’와 같은 이해하기 쉬운 이름을 입력하고, ‘App description’에는 ‘Get the CD jacket’와 같은 설명을 입력합니다. 그 후, 두 개의 체크박스에 체크합니다. 체크하면 Permission이나 Guideline에 동의하는 것입니다. 입력 내용을 확인한 후, [CREATE] 버튼을 클릭합니다.</p><p>클릭 후, 앱이 생성되고 대시보드가 표시됩니다. 대시보드 내에 있는 [SHOW CLIENT SECRET]을 클릭하여 Client ID와 Client Secret을 Windows의 환경 변수에 등록합니다.</p><p>[FYI]<a href="https://draft.blogger.com/blog/post/edit/3231669075263956300/6625944576452608577#">환경 변수 설정</a></p><p>Client ID는 변수명을 ‘SPOTIFY_CLIENT_ID’로 하고, 변수 값에 대시보드에 표시된 값을 붙여넣습니다. 마찬가지로 Client Secret은 변수명을 ‘SPOTIFY_SECRET_ID’로 하고, 변수 값에 대시보드의 값을 붙여넣습니다. 변수 등록이 완료되면, 변수를 사용할 수 있도록 <strong>PC를 한 번 재시작하세요</strong>.</p><h3 id="h0f9c9e996f">Python 라이브러리 도입</h3><p>pip 등을 사용하여 아래 라이브러리를 도입하세요.</p><ul><li>spotipy</li><li>requests</li><li>PySimpleGUI</li></ul><pre><code class=