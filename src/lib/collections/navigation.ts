import type { CollectionEntry } from "astro:content";

type SupportedCollectionEntry =
    | CollectionEntry<"blog_ja">
    | CollectionEntry<"blog_en">
    | CollectionEntry<"blog_ko">
    | CollectionEntry<"diary">;

interface PostNavigationResult<T extends SupportedCollectionEntry> {
    prevPost: T | null;
    nextPost: T | null;
}

/**
 * 指定された記事の前後の記事を取得する
 * @param currentPost 現在の記事
 * @param allPosts 全記事のリスト（日付順にソート済み）
 * @returns 前後の記事
 */
export function getPostNavigation<T extends SupportedCollectionEntry>(
    currentPost: T,
    allPosts: T[]
): PostNavigationResult<T> {
    // 日付順でソート（新しい順）
    const sortedPosts = allPosts.sort((a, b) => {
        const dateA = a.data.date ? new Date(a.data.date) : new Date(0);
        const dateB = b.data.date ? new Date(b.data.date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });

    const currentIndex = sortedPosts.findIndex(post => {
        if (currentPost.collection === "diary") {
            return post.data.date?.toISOString().slice(0, 10) === 
                   currentPost.data.date?.toISOString().slice(0, 10);
        }
        return post.slug === currentPost.slug;
    });

    if (currentIndex === -1) {
        return { prevPost: null, nextPost: null };
    }

    // 新しい順でソートされているため、indexが小さいほど新しい記事
    const nextPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
    const prevPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

    return { prevPost, nextPost };
}