import type { CollectionEntry } from "astro:content";

type SupportedCollectionEntry =
    | CollectionEntry<"blog_ja">
    | CollectionEntry<"blog_en">
    | CollectionEntry<"blog_ko">;

export function getRelatedPosts(
    currentPost: SupportedCollectionEntry,
    allPosts: SupportedCollectionEntry[],
    maxPosts: number = 6
): SupportedCollectionEntry[] {
    const currentTags = currentPost.data.tags || [];
    const currentCategories = currentPost.data.categories || [];
    
    const otherPosts = allPosts.filter(post => post.slug !== currentPost.slug);
    
    const postsWithScores = otherPosts.map(post => {
        let score = 0;
        const postTags = post.data.tags || [];
        const postCategories = post.data.categories || [];
        
        const sharedTags = currentTags.filter(tag => postTags.includes(tag));
        const sharedCategories = currentCategories.filter(category => postCategories.includes(category));
        
        score += sharedTags.length * 10;
        score += sharedCategories.length * 5;
        
        return { post, score };
    });
    
    postsWithScores.sort((a, b) => {
        if (a.score !== b.score) {
            return b.score - a.score;
        }
        return Math.random() - 0.5;
    });
    
    return postsWithScores.slice(0, maxPosts).map(item => item.post);
}