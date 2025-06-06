import type { CollectionEntry } from "astro:content";

export function generateRssXml(
    title: string,
    description: string,
    siteUrl: string,
    feedUrl: string,
    posts: Array<CollectionEntry<"blog_ja"> | CollectionEntry<"blog_en"> | CollectionEntry<"blog_ko">>,
    language: string
): string {
    const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title><![CDATA[${title}]]></title>
<description><![CDATA[${description}]]></description>
<link>${siteUrl}</link>
<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
<language>${language}</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`;

    const rssItems = posts
        .filter(post => !post.data.draft)
        .sort((a, b) => {
            const dateA = a.data.date ? a.data.date.getTime() : 0;
            const dateB = b.data.date ? b.data.date.getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 20) // 最新20記事
        .map(post => {
            const postUrl = `${siteUrl}/blog/${getLanguageCode(language)}/${post.slug}`;
            const pubDate = post.data.date ? post.data.date.toUTCString() : new Date().toUTCString();
            const categories = post.data.categories || [];
            const tags = post.data.tags || [];
            const allCategories = [...categories, ...tags];
            
            return `<item>
<title><![CDATA[${post.data.title}]]></title>
<description><![CDATA[${post.data.description || ''}]]></description>
<link>${postUrl}</link>
<guid isPermaLink="true">${postUrl}</guid>
<pubDate>${pubDate}</pubDate>
${allCategories.map(cat => `<category><![CDATA[${cat}]]></category>`).join('\n')}
</item>`;
        })
        .join('\n');

    const rssFooter = `</channel>
</rss>`;

    return rssHeader + '\n' + rssItems + '\n' + rssFooter;
}

function getLanguageCode(language: string): string {
    switch (language) {
        case 'ja-JP':
        case 'ja':
            return 'ja';
        case 'en-US':
        case 'en':
            return 'en';
        case 'ko-KR':
        case 'ko':
            return 'ko';
        default:
            return 'ja';
    }
}

export function getRssFeedInfo(lang: string) {
    switch (lang) {
        case 'ja':
            return {
                title: 'Scriptone - ブログ',
                description: 'Scriptoneのブログ記事フィード',
                language: 'ja-JP'
            };
        case 'en':
            return {
                title: 'Scriptone - Blog',
                description: 'Scriptone blog posts feed',
                language: 'en-US'
            };
        case 'ko':
            return {
                title: 'Scriptone - 블로그',
                description: 'Scriptone 블로그 포스트 피드',
                language: 'ko-KR'
            };
        default:
            return {
                title: 'Scriptone - ブログ',
                description: 'Scriptoneのブログ記事フィード',
                language: 'ja-JP'
            };
    }
}