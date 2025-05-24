import { getCollection } from "astro:content";

interface SitemapEntry {
    url: string;
    changefreq: string;
    priority: number;
    lastmod?: string;
}
interface BlogPost {
    id: string;
    data: {
        title: string;
        description?: string;
        date?: string | Date;
        preview?: string;
        draft?: boolean;
        tags?: string[];
        categories?: string[];
    };
    body: string;
    collection: string;
    slug: string;
    render: () => Promise<{ Content: any }>;
}

export async function GET(context: { site: { toString: () => any } }) {
    const urls: SitemapEntry[] = [];
    function pushUrls(posts: BlogPost[], langCode: string) {
        const aggregatedData = {
            tags: new Set<string>(),
            categories: new Set<string>(),
            archives: new Set<string>(),
        };

        posts.forEach((post) => {
            if (post.data.tags)
                post.data.tags.forEach((tag) => aggregatedData.tags.add(tag));
            if (post.data.categories)
                post.data.categories.forEach((cat) =>
                    aggregatedData.categories.add(cat)
                );
            if (post.data.date) {
                const year = new Date(post.data.date).getFullYear().toString();
                aggregatedData.archives.add(year);
            }
        });

        // 実際の記事パスの追加
        posts.forEach((post) => {
            urls.push({
                url: `${context.site}blog/${langCode}/${post.slug}/`,
                lastmod: post.data.date
                    ? new Date(post.data.date).toISOString()
                    : undefined,
                changefreq: "weekly",
                priority: 0.8,
            });
        });

        // タグのURLを追加
        Array.from(aggregatedData.tags).forEach((tag) => {
            const encodedTag = encodeURIComponent(tag);
            urls.push({
                url: `${context.site}blog/${langCode}/tags/${encodedTag}/`,
                changefreq: "weekly",
                priority: 0.7,
            });
        });

        // カテゴリのURLを追加
        Array.from(aggregatedData.categories).forEach((cat) => {
            const encodedCat = encodeURIComponent(cat);
            urls.push({
                url: `${context.site}blog/${langCode}/categories/${encodedCat}/`,
                changefreq: "weekly",
                priority: 0.7,
            });
        });

        // アーカイブのURLを追加
        Array.from(aggregatedData.archives).forEach((year) => {
            urls.push({
                url: `${context.site}blog/${langCode}/archives/${year}/`,
                changefreq: "monthly",
                priority: 0.6,
            });
        });

        // タグとカテゴリの一覧ページを追加
        urls.push({
            url: `${context.site}blog/${langCode}/tags/`,
            changefreq: "weekly",
            priority: 0.8,
        });
        urls.push({
            url: `${context.site}blog/${langCode}/categories/`,
            changefreq: "weekly",
            priority: 0.8,
        });

        // 言語ごとのブログトップページを追加
        urls.push({
            url: `${context.site}blog/${langCode}/`,
            changefreq: "daily",
            priority: 0.9,
        });
    }

    // 固定ページの追加
    urls.push(
        {
            url: `${context.site}about/`,
            changefreq: "weekly",
            priority: 0.3,
        },
        {
            url: `${context.site}privacy_policy/`,
            changefreq: "weekly",
            priority: 0.7,
        },
        {
            url: `${context.site}project_sekai/`,
            changefreq: "weekly",
            priority: 0.3,
        },
        {
            url: `${context.site}project_sekai/event_point_calculator`,
            changefreq: "weekly",
            priority: 0.7,
        },
        {
            url: `${context.site}project_sekai/event_point_calculator_ex`,
            changefreq: "weekly",
            priority: 0.7,
        },
        {
            url: `${context.site}project_sekai/simple_efficiency_table_for_prsk_music`,
            changefreq: "weekly",
            priority: 0.5,
        }
    );

    // ブログ記事の追加
    const jaPosts: BlogPost[] = (await getCollection("blog_ja"))
        .flat()
        .filter((post) => !post.data.draft);
    const enPosts: BlogPost[] = (await getCollection("blog_en"))
        .flat()
        .filter((post) => !post.data.draft);
    const koPosts: BlogPost[] = (await getCollection("blog_ko"))
        .flat()
        .filter((post) => !post.data.draft);
    pushUrls(jaPosts, "ja");
    pushUrls(enPosts, "en");
    pushUrls(koPosts, "ko");

    // URLをアルファベット順に並び替え
    urls.sort((a, b) => a.url.localeCompare(b.url));

    // XML形式のコンテンツを生成
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (url) => `
    <url>
        <loc>${url.url}</loc>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`
    )
    .join("")}
</urlset>`;
    return new Response(xmlContent, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
        },
    });
}
