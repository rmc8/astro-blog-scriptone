import { getCollection } from "astro:content";
import { generateRssXml, getRssFeedInfo } from "@/lib/rss";

export async function GET() {
    const posts = await getCollection("blog_ja");
    const { title, description, language } = getRssFeedInfo("ja");
    
    const siteUrl = "https://rmc-8.com";
    const feedUrl = `${siteUrl}/blog/ja/rss.xml`;
    
    const rssXml = generateRssXml(
        title,
        description,
        siteUrl,
        feedUrl,
        posts,
        language
    );
    
    return new Response(rssXml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
        },
    });
}