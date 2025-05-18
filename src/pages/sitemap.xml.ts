import { getCollection } from "astro:content";

const collections = ["blog_ja", "blog_en", "blog_ko"] as const;

export async function GET(context: { site: { toString: () => any } }) {
    const allPostsAcrossLangs = await Promise.all(
        collections.map((collection) => getCollection(collection))
    ).then((collections) =>
        collections.flat().filter((post) => !post.data.draft)
    );
    const aggregatedData = {
        tags: new Set<string>(),
        categories: new Set<string>(),
        archives: new Set<string>(),
    };

    allPostsAcrossLangs.forEach((post) => {
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

    interface SitemapEntry {
        url: string;
        changefreq: string;
        priority: number;
        lastmod?: string;
    }

    const urls: SitemapEntry[] = [];

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

    urls.push({
        url: context.site.toString(),
        changefreq: "daily",
        priority: 1.0,
    });

    collections.forEach((collection) => {
        const langCode = collection.split("_")[1];
        urls.push({
            url: `${context.site}blog/${langCode}/`,
            changefreq: "daily",
            priority: 0.9,
        });
    });

    allPostsAcrossLangs.forEach((post) => {
        const langCode = post.collection.split("_")[1];
        urls.push({
            url: `${context.site}blog/${langCode}/${post.slug}/`,
            lastmod: post.data.date
                ? new Date(post.data.date).toISOString()
                : undefined,
            changefreq: "weekly",
            priority: 0.8,
        });
    });

    collections.forEach((collection) => {
        const langCode = collection.split("_")[1];
        Array.from(aggregatedData.tags).forEach((tag) => {
            const encodedTag = encodeURIComponent(tag);
            urls.push({
                url: `${context.site}blog/${langCode}/tags/${encodedTag}/`,
                changefreq: "weekly",
                priority: 0.7,
            });
        });
    });

    collections.forEach((collection) => {
        const langCode = collection.split("_")[1];
        Array.from(aggregatedData.categories).forEach((cat) => {
            const encodedCat = encodeURIComponent(cat);
            urls.push({
                url: `${context.site}blog/${langCode}/categories/${encodedCat}/`,
                changefreq: "weekly",
                priority: 0.7,
            });
        });
    });

    collections.forEach((collection) => {
        const langCode = collection.split("_")[1];
        Array.from(aggregatedData.archives).forEach((year) => {
            // 年は通常URLフレンドリーな文字列です
            urls.push({
                url: `${context.site}blog/${langCode}/archives/${year}/`,
                changefreq: "monthly", // 必要に応じて調整
                priority: 0.6, // 必要に応じて調整
            });
        });
    });
    collections.forEach((collection) => {
        const langCode = collection.split("_")[1];
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
    });

    urls.sort((a, b) => a.url.localeCompare(b.url));

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `
    <url>
        <loc>${url.url}</loc>
        ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('')}
</urlset>`;

    return new Response(xmlContent, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600'
        },
    });
}
