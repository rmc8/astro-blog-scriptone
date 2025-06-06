import { getCollection } from "astro:content";
import { generateRssXml, getRssFeedInfo } from "@/lib/rss";

export async function GET() {
    const posts = await getCollection("blog_ko");
    const { title, description, language } = getRssFeedInfo("ko");
    
    const siteUrl = "https://rmc-8.com";
    const feedUrl = `${siteUrl}/blog/ko/rss.xml`;
    
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