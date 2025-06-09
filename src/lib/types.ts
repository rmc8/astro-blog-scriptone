import type { CollectionEntry } from "astro:content";
import type { SupportedLanguage } from "./constants";

// ブログ投稿の型
export type BlogPost = CollectionEntry<"blog_ja"> | CollectionEntry<"blog_en"> | CollectionEntry<"blog_ko">;
export type DiaryPost = CollectionEntry<"diary">;

// SEO関連の型
export interface SEOProps {
    title: string;
    description: string;
    url: string;
    type?: "website" | "article";
    locale?: SupportedLanguage;
    alternateLocales?: Array<{
        locale: SupportedLanguage;
        url: string;
    }>;
    image?: string;
    publishedTime?: Date;
    modifiedTime?: Date;
    tags?: string[];
    author?: string;
    section?: string;
}

// ページネーション関連の型
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    prevUrl?: string;
    nextUrl?: string;
}

// スキル関連の型
export interface Skill {
    name: string;
    iconPath: string;
    url: string;
    type: "Lang" | "Framework";
}

// ナビゲーション関連の型
export interface NavigationItem {
    text: string;
    href: string;
    current?: boolean;
}

// 検索関連の型
export interface SearchResult {
    post: BlogPost;
    relevance: number;
}

// 国際化関連の型
export interface LocalizedContent {
    [key: string]: string | LocalizedContent;
}

// コンテンツメタデータの型
export interface ContentMetadata {
    title: string;
    description?: string;
    date: Date;
    updatedDate?: Date;
    tags?: string[];
    categories?: string[];
    draft?: boolean;
    preview?: string;
    toc?: boolean;
}