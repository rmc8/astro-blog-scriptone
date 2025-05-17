import type { CollectionEntry } from "astro:content";

type SupportedCollectionEntry =
    | CollectionEntry<"blog_ja">
    | CollectionEntry<"blog_en">
    | CollectionEntry<"blog_ko">;

type AggregationInput =
    | SupportedCollectionEntry[]
    | SupportedCollectionEntry[][];

export function getAggregatedData(postsArrays: AggregationInput) {
    const categories: string[] = [];
    const tags: string[] = [];
    // archives は Record<string, number> 型で初期化されています
    const archives: Record<string, number> = {};

    let collectionsToProcess: SupportedCollectionEntry[][];

    if (postsArrays.length > 0 && Array.isArray(postsArrays[0])) {
        collectionsToProcess = postsArrays as SupportedCollectionEntry[][];
    } else {
        collectionsToProcess = [postsArrays as SupportedCollectionEntry[]];
    }

    collectionsToProcess.forEach((collectionPosts) => {
        collectionPosts.forEach((post) => {
            if ("categories" in post.data && post.data.categories) {
                categories.push(...post.data.categories);
            }
            if ("tags" in post.data && post.data.tags) {
                tags.push(...post.data.tags);
            }
            if ("date" in post.data && post.data.date) {
                const year = new Date(post.data.date).getFullYear().toString();
                archives[year] = (archives[year] || 0) + 1;
            }
        });
    });

    const categoryCounts = categories.reduce(
        (acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    const tagCounts = tags.reduce(
        (acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return {
        categories: categoryCounts,
        tags: tagCounts,
        archives: archives,
    };
}
