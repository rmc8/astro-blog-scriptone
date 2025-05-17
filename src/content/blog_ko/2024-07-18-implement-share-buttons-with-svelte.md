---
title: "【Svelte】공유 버튼의 구현"
slug: "implement-share-buttons-with-svelte"
description: "Svelte를 사용하여 7개의 SNS를 위한 공유 버튼을 구현하는 방법을 설명합니다. X, Bluesky, はてなブックマーク, Pocket, Threads, マストドン, Misskey에 대응한 간단하고 경량한 공유 기능의 구현 절차와 각 SNS의 설정 방법을 자세히 소개합니다."
date: 2024-07-18T00:43:36.910Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/SharedButtons.webp"
draft: false
tags: ['SNS', 'Svelte', 'TypeScript']
categories: ['Programming']
---

Svelte를 사용하여 7개의 도구를 위한 공유 버튼을 구현했습니다.

## 왜 구현했나

원래는 공유 버튼이 필요하지 않다고 생각했습니다. 본 사이트는 매우 세부적으로 업데이트되며, Google 검색에 걸릴 만큼 우수한 콘텐츠가 충분히 갖춰져 있지 않습니다. 그 때문에 공유를 그다지 중시하지 않고, 사이트를 방문한 호기심 많은 사람들이 편안하게 다룰 수 있도록 불필요한 요소를 제거하는 마음으로 공유 버튼을 만들지 않았습니다. 무엇보다 그런 상황에서 일부러 시간을 들여 구현하는 것이 잘 이해되지 않았다는 것이 가장 큰 이유일 것입니다.

그러나, 본 사이트에서 공개한 스마트폰용 게임을 위한 웹 도구가 공유 버튼 등이 없음에도 불구하고 X(Twitter)나 Discord의 개인 서버 등에 감사하게도 공유되고 있는 상황에서, 그렇다면 버튼을 만드는 데 약간의 가치가 있을 수 있다고 생각했습니다. 버튼을 만들어 이처럼 공유하고 싶어질 수 있는 콘텐츠를 만들거나, 사이트를 활용하는 선순환이 생길 수 있는 계기가 될 수 있으므로, 때가 되었다고 생각하고 무거운 마음을 들고 구현하기로 했습니다.

## 사용하는 프레임워크

본 사이트는 Svelte와 SvelteKit으로 구현되어 있으므로 Svelte에 의한 설명이 주가 됩니다. Svelte는 TypeScript, HTML, Style의 구성으로 모듈이 구성되어 있으며, 약간 독특한 Svelte의 구문을 포함하지만, 웹 프로그래밍에 익숙하다면 꽤 읽기 쉽습니다. 그 밖에 보조적으로 PostCSS를 사용하고 있지만, 버튼의 구현을 주로 설명합니다.

## 구성
```text
.
├── Share.svelte
└── img
    ├── bsky_share.webp
    ├── hatena_bookmark_share.webp
    ├── mastodon_share.webp
    ├── misskey_share.webp
    ├── pocket_share.webp
    ├── threads_share.webp
    └── x_share.webp
```

## 코드
```svelte
<script lang="ts">
 import xIcon from './img/x_share.webp';
 import blueskyIcon from './img/bsky_share.webp';
 import hatenaBookmarkIcon from './img/hatena_bookmark_share.webp';
 import threadsIcon from './img/threads_share.webp';
 import misskeyIcon from './img/misskey_share.webp';
 import mastodonIcon from './img/mastodon_share.webp';
 import pocketIcon from './img/pocket_share.webp';

 export let share_title: string;
 export let share_url: string;

 const newline: string = encodeURIComponent('\r\n');
 const encodedTitle: string = encodeURIComponent(share_title);
 const encodedUrl: string = encodeURIComponent(share_url);

 const BLUESKY_BASE_URL: string = `https://bsky.app/intent/compose?text=${encodedTitle}${newline}${encodedUrl}`;
 const X_BASE_URL: string = `https://twitter.com/intent/tweet?text=${encodedTitle}${newline}&url=${encodedUrl}`;
 const HATENA_BASE_URL: string = `https://b.hatena.ne.jp/add?url=${encodedUrl}`;
 const THREADS_BASE_URL: string = `https://www.threads.net/intent/post?text=${encodedTitle}${newline}${encodedUrl}`;
 const MISSKEY_BASE_URL: string = `https://misskey-hub.net/share?text=${encodedTitle}&url=${encodedUrl}`;
 const MASTODON_BASE_URL: string = `https://donshare.net/share.html?text=${encodedTitle}${newline}${encodedUrl}`;
 const POCKET_BASE_URL: string = `https://getpocket.com/edit?url=${encodedUrl}&title=${encodedTitle}`;

 interface ShareIcon {
  url: string;
  icon: string;
  alt: string;
 }

 const shareIcons: ShareIcon[] = [
  { url: X_BASE_URL, icon: xIcon, alt: 'Share on X' },
  { url: BLUESKY_BASE_URL, icon: blueskyIcon, alt: 'Share on Bluesky' },
  { url: HATENA_BASE_URL, icon: hatenaBookmarkIcon, alt: 'Share on Hatena Bookmark' },
  { url: POCKET_BASE_URL, icon: pocketIcon, alt: 'Save to Pocket' },
  { url: THREADS_BASE_URL, icon: threadsIcon, alt: 'Share on Threads' },
  { url: MASTODON_BASE_URL, icon: mastodonIcon, alt: 'Share on Mastodon' },
  { url: MISSKEY_BASE_URL, icon: misskeyIcon, alt: 'Share on Misskey' }
 ];
</script>

<div class="share_block">
 <h2>Share</h2>
 <div class="share-icons-container">
  <div class="share-icons-scroll">
   {#each shareIcons as { url, icon, alt }}
    <a href={url} target="_blank" rel="noopener noreferrer" class="share-icon-link">
     <div class="share-icon-wrapper">
      <img src={icon} {alt} class="share-icon" />
     </div>
    </a>
   {/each}
  </div>
 </div>
</div>

<style lang="postcss">
 .share-icons-container {
  @apply relative w-full overflow-hidden mt-8 mb-8;
 }
 .share-icons-scroll {
  @apply flex space-x-4 overflow-x-auto pb-4 -mb-4;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
 }
 .share-icons-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
 }
 .share-icon-wrapper {
  @apply w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-[#0aadb9] hover:bg-[#089aa5] transition-all duration-300 ease-in-out;
 }
 .share-icon {
  @apply w-6 h-6 object-contain transition-transform duration-300 ease-in-out;
  filter: brightness(0) invert(1) brightness(1.2);
 }
 .share-icon-link:hover .share-icon {
  @apply transform scale-110;
 }
 @media (max-width: 640px) {
  .share-icon-wrapper {
   @apply w-10 h-10;
  }
  .share-icon {
   @apply w-5 h-5;
  }
 }
</style>
```

## 설명

### TypeScript

처음 import 문에서 img 폴더 안에 있는 이미지를 Svelte 안에 불러옵니다. import를 통해 img 태그용 이미지의 경로를 얻을 수 있는 메커니즘입니다. export는 함수로 예를 들면 인수이며, 외부에서 페이지의 제목과 페이지의 URL을 string 타입으로 받는 구성입니다. 받은 문자열은 URL로서 안전하게 하기 위해 encodeURIComponent 함수에 전달하여 특수한 문자열 등을 인코딩합니다. 그 밖에, X나 Bluesky를 위한 게시물 텍스트 안에 개행을 포함하기 위해 개행용 문자열을 인코딩합니다.

그 후, HTTP 요청으로 각 플랫폼에서 공유가 가능한 형식으로 URL을 만듭니다. 이는 개별적으로 후술에서 설명합니다. 그 후, URL, ICON의 경로, 대체 텍스트를 포함하는 객체의 리스트(shareIcons)를 만들어 공유용 데이터의 준비가 완료됩니다.

### HTML

HTML에서는 링크를 포함한 아이콘을 실제로 표시하는 처리를 하고 있습니다. 약간 독특한 Svelte 구문이 있지만, for each 문과 같은 것으로 shareIcons를 순서대로 읽어 SNS의 링크, 아이콘, 이미지의 대체 텍스트를 정의합니다.

### CSS

CSS에서는 주로 레이아웃이나 이미지 색상 설정, 이미지를 흰색으로 만드는 처리를 하고 있습니다. 이로 인해 터코이즈 같은 원 안에 각 SNS의 아이콘이 흰색으로 표시되는 상태가 됩니다.

## 호출 방법

`import Share from 'Share.svelte의 경로';`와 같은 형식으로 만든 모듈을 호출합니다. 그 후, `<Share share_title={title} share_url={currentUrl} />`의 형식으로 값을 전달하여 각 페이지별 공유 버튼이 자동으로 만들어집니다. Svelte라면 아래와 같은 코드로 그 페이지의 URL을 얻을 수 있습니다.

```svelte
import { page } from '$app/stores';
$: currentUrl = $page.url.href;
```

## 각 SNS의 URL 설정 방법

이번에 다음과 같은 7개의 SNS 등을 대상으로 공유 버튼을 만들었습니다.

* X(Twitter)
* Bluesky
* はてなブックマーク
* Pocket
* Threads
* マストドン
* Misskey

### X(Twitter)

X는 `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`의 형식으로 작동합니다. 도메인을 X로 하거나, tweet의 부분을 post로 변경하면 웹 브라우저에서는 작동해도 스마트폰 버전의 앱에서 작동하지 않는 등의 불편이 발생할 수 있습니다. 아직, 전환 단계이므로 실제 작동에 맞춰 링크를 설정할 수 있으면 좋지만, 2024년 7월 시점에서는 이 형식으로 괜찮습니다.

### Bluesky

Bluesky는 좀 더 간단하며 `https://bsky.app/intent/compose?text=${encodedText}`의 형식으로 작동합니다. 그러나, Bluesky는 발전 중이며 앱 버전에서는 이 링크로 작동이 불완전합니다. 잘 작동하거나 작동하지 않을 수 있으며, 현 시점에서는 사용자 측에서 할 수 있는 것도 많지 않습니다. 한편, 웹 버전만으로는 이로 문제없이 작동합니다. 이 형식으로는 `bsky.app`만 작동하므로, 셀프 호스팅 등의 경우에는 다른 메커니즘이 필요합니다.

### はてなブックマーク

はてなブックマーク는 `https://b.hatena.ne.jp/add?url=${encodedUrl}`의 형식으로 작동합니다. add의 부분을 entry로 변경해도 작동하지만, add 쪽이 더 빨리 북마크 화면으로 이동하므로 다루기 쉽습니다.

### Pocket

Pocket는 `https://getpocket.com/edit?url=${encodedUrl}&title=${encodedTitle}`의 형식으로 작동합니다. 링크를 클릭하면 즉시 스톡되는 듯한 작동을 합니다.

### Threads

Threads는 `https://www.threads.net/intent/post?text=${encodedText}`의 형식으로 작동합니다. マストドン과 같은 ActivityPub가 채택된 SNS지만, Threads에 직접 게시하려면 이로 간단히 대응할 수 있습니다.

### マストドン

マストドンは `https://donshare.net/share.html?text=${encodedText}`로 대응할 수 있습니다. 다양한 인스턴스가 있지만, 공유용 허브 서비스를 활용하여 マストドン으로의 공유도 쉽게 대응할 수 있습니다.

### Misskey

Misskey도 マストドン처럼 다양한 인스턴스가 있으므로 허브를 사이에 끼웁니다. `https://misskey-hub.net/share?text=${encodedTitle}&url=${encodedUrl}`의 형식으로 URL을 만들어 공유용 텍스트를 만들고, 링크 목적지에서 공유 대상의 인스턴스를 설정하여 실제 공유가 이루어집니다.

## 요약

Svelte로 공유용 버튼을 만들면 100줄 미만의 매우 적은 코드로 다수의 서비스에 대한 공유 버튼을 쉽게 구현할 수 있습니다. 웹 페이지를 방문하는 사람과 사이트를 활용하고 싶은 사람 모두에게 매우 유용한 기능이라고 생각합니다. 코드도 단순히 링크가 붙은 이미지를 만드는 기능뿐이므로 Svelte라면 매우 경량하고 편리한 기능이 될 것입니다. 페이지의 공유 기능을 추가하고 싶은 분의 참고가 되었으면 합니다.