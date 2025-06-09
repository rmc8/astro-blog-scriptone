import type { CollectionEntry } from "astro:content";
import { formatDateISO } from "./dateUtils";

export type BlogPost = CollectionEntry<"blog_ja"> | CollectionEntry<"blog_en"> | CollectionEntry<"blog_ko">;

/**
 * ブログ投稿の検索機能
 */
export function searchPosts(posts: BlogPost[], query: string): BlogPost[] {
    if (!query.trim()) return posts;
    
    const searchTerm = query.toLowerCase();
    return posts.filter(post => {
        const { title, description, tags = [], categories = [] } = post.data;
        
        return (
            title.toLowerCase().includes(searchTerm) ||
            (description && description.toLowerCase().includes(searchTerm)) ||
            tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            categories.some(category => category.toLowerCase().includes(searchTerm))
        );
    });
}

/**
 * カテゴリのHTML生成
 */
export function generateCategoryHTML(categories: string[], langCode: string): string {
    if (categories.length === 0) return '';
    
    return categories.map(category => 
        `<a href="/blog/${langCode}/categories/${category}" 
            style="background-color: rgba(var(--accent3), 0.9); color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 600; text-decoration: none; margin-right: 4px;">
            ${category}
        </a>`
    ).join('');
}

/**
 * タグのHTML生成
 */
export function generateTagHTML(tags: string[], langCode: string): string {
    if (tags.length === 0) return '';
    
    return tags.map(tag => 
        `<a href="/blog/${langCode}/tags/${tag}" 
            style="background-color: rgba(var(--accent3), 0.15); color: var(--accent7); padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 500; text-decoration: none; margin-right: 4px;">
            ${tag}
        </a>`
    ).join('');
}

/**
 * 検索結果のHTMLを生成
 */
export function generateSearchResultHTML(post: BlogPost, langCode: string): string {
    const { title, description, tags = [], categories = [], date } = post.data;
    const formattedDate = formatDateISO(date);
    
    return `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">
                <a href="/blog/${langCode}/${post.slug}" style="color: #2d3748; text-decoration: none;">
                    ${title}
                </a>
            </h3>
            <div style="color: #718096; font-size: 14px; margin-bottom: 8px;">
                📅 ${formattedDate}
            </div>
            ${description ? `<p style="margin: 8px 0; color: #4a5568; line-height: 1.5;">${description}</p>` : ''}
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
                ${generateCategoryHTML(categories, langCode)}
                ${generateTagHTML(tags, langCode)}
            </div>
        </div>
    `;
}