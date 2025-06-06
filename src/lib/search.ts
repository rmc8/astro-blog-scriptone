import type { CollectionEntry } from "astro:content";

type SupportedCollectionEntry =
    | CollectionEntry<"blog_ja">
    | CollectionEntry<"blog_en">
    | CollectionEntry<"blog_ko">;

export interface SearchResult {
    post: SupportedCollectionEntry;
    score: number;
    matches: {
        title: boolean;
        description: boolean;
        tags: string[];
        categories: string[];
    };
}

export function searchPosts(
    posts: SupportedCollectionEntry[],
    query: string,
    limit: number = 50
): SearchResult[] {
    if (!query || query.trim().length === 0) {
        return [];
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const publishedPosts = posts.filter(post => !post.data.draft);
    
    const results: SearchResult[] = [];

    for (const post of publishedPosts) {
        const title = post.data.title?.toLowerCase() || "";
        const description = post.data.description?.toLowerCase() || "";
        const tags = (post.data.tags || []).map(tag => tag.toLowerCase());
        const categories = (post.data.categories || []).map(cat => cat.toLowerCase());
        
        let score = 0;
        const matches = {
            title: false,
            description: false,
            tags: [] as string[],
            categories: [] as string[],
        };

        for (const term of searchTerms) {
            // タイトルでの検索（最高スコア）
            if (title.includes(term)) {
                score += 10;
                matches.title = true;
            }

            // 説明文での検索
            if (description.includes(term)) {
                score += 5;
                matches.description = true;
            }

            // タグでの検索
            for (const tag of tags) {
                if (tag.includes(term)) {
                    score += 3;
                    if (!matches.tags.includes(tag)) {
                        matches.tags.push(tag);
                    }
                }
            }

            // カテゴリーでの検索
            for (const category of categories) {
                if (category.includes(term)) {
                    score += 3;
                    if (!matches.categories.includes(category)) {
                        matches.categories.push(category);
                    }
                }
            }
        }

        if (score > 0) {
            results.push({ post, score, matches });
        }
    }

    // スコアでソートし、制限数まで返す
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

export function highlightText(text: string, query: string): string {
    if (!query || query.trim().length === 0) {
        return text;
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    let highlightedText = text;

    for (const term of searchTerms) {
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }

    return highlightedText;
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getSearchSuggestions(
    posts: SupportedCollectionEntry[],
    query: string,
    limit: number = 5
): string[] {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const suggestions = new Set<string>();

    for (const post of posts) {
        if (post.data.draft) continue;

        // タグからの提案
        for (const tag of post.data.tags || []) {
            if (tag.toLowerCase().includes(searchTerm)) {
                suggestions.add(tag);
            }
        }

        // カテゴリーからの提案
        for (const category of post.data.categories || []) {
            if (category.toLowerCase().includes(searchTerm)) {
                suggestions.add(category);
            }
        }

        // タイトルの単語からの提案
        const titleWords = post.data.title?.split(/\s+/) || [];
        for (const word of titleWords) {
            if (word.toLowerCase().includes(searchTerm) && word.length > 2) {
                suggestions.add(word);
            }
        }
    }

    return Array.from(suggestions).slice(0, limit);
}