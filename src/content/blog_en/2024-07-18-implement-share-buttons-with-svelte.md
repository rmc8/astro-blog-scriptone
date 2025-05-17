---
title: "Implementing Share Buttons with Svelte"
slug: "implement-share-buttons-with-svelte"
description: "Explains how to implement share buttons for 7 SNS platforms using Svelte. Covers X, Bluesky, Hatena Bookmark, Pocket, Threads, Mastodon, and Misskey with a simple and lightweight implementation process, including detailed setup for each SNS."
date: 2024-07-18T00:43:36.910Z
preview: "https://pub-21c8df4785a6478092d6eb23a55a5c42.r2.dev/img/eyecatch/SharedButtons.webp"
draft: false
tags: ['SNS', 'Svelte', 'TypeScript']
categories: ['Programming']
---

I implemented share buttons for 7 tools using Svelte.

## Why I Implemented It

Originally, I didn't think share buttons were necessary. This site is updated very sporadically, and it doesn't have enough high-quality content to appear prominently in Google searches. Therefore, I didn't prioritize sharing and aimed to keep the site as streamlined as possible for curious visitors, avoiding unnecessary elements like share buttons. The main reason was that it didn't make much sense to invest the effort in implementation under these circumstances.

However, I've noticed that the web tools I've created for smartphone games on this site are being shared on X (Twitter) or personal Discord servers, even without share buttons. Given that, I decided there might be some value in adding buttons. By doing so, it could encourage a positive cycle of creating shareable content and helping users make the most of the site, so I finally got around to implementing it.

## Using the Framework

This site is built with Svelte and SvelteKit, so the explanation will focus on Svelte. Svelte is structured with TypeScript, HTML, and styles, and while it includes some unique Svelte syntax, it's relatively readable if you're familiar with web programming. Additionally, I'm using PostCSS as a supplement, but the main focus will be on implementing the buttons.

## Structure
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

## Code
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

## Explanation

### TypeScript

In the initial import statements, images from the img folder are loaded into Svelte. This allows us to obtain the paths for the img tags. The 'export' statements act like function parameters, receiving the page title and URL as string types from external sources. The received strings are passed through the encodeURIComponent function to ensure they are properly encoded for use in URLs. Additionally, for platforms like X and Bluesky, a newline character is encoded to include line breaks in the post text.

Next, URLs are constructed in the format required for sharing on each platform via HTTP requests. These will be explained in detail later. Finally, a list of objects (shareIcons) is created, containing the URL, icon path, and alt text, completing the preparation for sharing data.

### HTML

The HTML section handles the actual display of the icons with links. It uses a somewhat unique Svelte syntax, similar to a for-each loop, to iterate through shareIcons and define the SNS links, icons, and alt texts.

### CSS

The CSS mainly handles layout, color schemes, and effects to make the images appear white. This results in each SNS icon being displayed in white within a turquoise-like circle.

## How to Use It

Import the module like this: `import Share from 'path/to/Share.svelte';`. Then, pass the values in the format `<Share share_title={title} share_url={currentUrl} />` to automatically generate share buttons for each page. In Svelte, you can obtain the current page URL with code like this:

```svelte
import { page } from '$app/stores';
$: currentUrl = $page.url.href;
```

## Setup for Each SNS URL

This implementation covers share buttons for the following 7 SNS platforms:

* X (Twitter)
* Bluesky
* Hatena Bookmark
* Pocket
* Threads
* Mastodon
* Misskey

### X (Twitter)

X uses the format `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`. Changing the domain to X or 'tweet' to 'post' might work in web browsers but could cause issues with smartphone apps. As of July 2024, this format works fine during the transition phase.

### Bluesky

Bluesky is simpler: `https://bsky.app/intent/compose?text=${encodedText}`. However, it's still developing, and this link may not work perfectly with the app version. It works well on the web version. This format only works with `bsky.app`, so self-hosted instances may require a different approach.

### Hatena Bookmark

Hatena Bookmark uses `https://b.hatena.ne.jp/add?url=${encodedUrl}`. Changing 'add' to 'entry' also works, but 'add' transitions faster to the bookmark screen, making it more user-friendly.

### Pocket

Pocket uses `https://getpocket.com/edit?url=${encodedUrl}&title=${encodedTitle}`, which immediately saves the item when the link is clicked.

### Threads

Threads uses `https://www.threads.net/intent/post?text=${encodedText}`. As an SNS using ActivityPub like Mastodon, this format allows direct posting to Threads.

### Mastodon

Mastodon can be handled with `https://donshare.net/share.html?text=${encodedText}`. With various instances available, using a sharing hub service makes it easier to support.

### Misskey

Misskey, like Mastodon, has multiple instances, so a hub is used. The format `https://misskey-hub.net/share?text=${encodedTitle}&url=${encodedUrl}` creates a sharing text, and the destination instance is set on the link page for actual sharing.

## Summary

With Svelte, you can implement share buttons for multiple services in less than 100 lines of code, making it straightforward. This feature is highly useful for both site visitors and users who want to utilize the site. Since the code simply creates linked images, it's lightweight and convenient in Svelte. I hope this serves as a helpful reference for those looking to add sharing functionality to their pages.