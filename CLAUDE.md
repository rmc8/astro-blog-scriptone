# CLAUDE.md

**Speak in Japanese!**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build locally
- `npm run astro ...` - Run Astro CLI commands (e.g., `astro check`, `astro add`)

## Architecture Overview

This is an Astro-based multilingual blog site with Svelte components and TailwindCSS styling.

### Content Management System

- Content is managed through Astro's content collections in `src/content/`
- Three blog collections for different languages: `blog_ja`, `blog_en`, `blog_ko`
- Additional `diary` collection for diary entries
- Content schema defined in `src/content/config.ts` with frontmatter validation
- Over 140 content files across all collections

### Internationalization (i18n)

- Default locale: Japanese (`ja`)
- Supported locales: Japanese (`ja`), English (`en`), Korean (`ko`)
- i18n configuration in `astro.config.mjs` and `src/i18n/`
- Language-specific routing: `/blog/ja/[slug]`, `/blog/en/[slug]`, `/blog/ko/[slug]`
- UI translations in `src/i18n/ui.ts` with comprehensive navigation and UI text
- Language picker component in `src/components/i18n/LanguagePicker.astro`

### Routing Structure

- Dynamic routes for blog posts: `src/pages/blog/[lang]/[slug].astro`
- Archive, category, and tag pages for each language with pagination
- Static pages: about, privacy policy, project sekai tools
- API endpoints in `src/pages/api/` including OG image generation and Project Sekai tools
- Sitemap generation with multilingual support

### Component Architecture

- Astro components for layout and blog functionality in `src/components/`
- Svelte 5 components integrated via `@astrojs/svelte`
- Organized component structure:
    - `blog/` - Blog-specific components (Article, BlogList, CategoryTag, ToC, etc.)
    - `common/` - Shared components (Header, Footer, Pagination, ShareButtons, etc.)
    - `diary/` - Diary-specific components
    - `home/` - Homepage components (Contents, Me, Skills)
    - `i18n/` - Internationalization components
    - `prsk/` - Project Sekai specific components
    - `seo/` - SEO components (SEOHead, StructuredData)

### Styling

- TailwindCSS v4 with Vite plugin integration
- Custom fonts: NotoSans (JP/KR) and SourceHanCode (JP) in `public/fonts/`
- Global styles in `src/styles/` (font.css, global.css)
- Component-specific styles using Astro's scoped CSS
- Material Icons integration for UI elements

### Content Features

- Markdown/MDX support with @astrojs/mdx integration
- Table of Contents generation via `remark-toc`
- Code block titles via `remark-flexible-code-titles`
- Frontmatter schema validation with Zod including:
    - title, description, slug, date, updatedDate
    - tags, categories, preview, draft status, toc toggle
- Draft post support with conditional rendering
- Related posts functionality
- Full-text search capabilities

### Asset Management

- Skill icons collection in `public/skill/` (35+ technology icons)
- Custom site icons and branding assets
- Font optimization with WOFF2 format
- Robots.txt and ads.txt configuration

### Build Configuration

- TypeScript with strict mode and path aliases (`@/*` → `./src/*`)
- Vercel adapter for static deployment
- Sitemap generation with i18n support
- Site URL: https://rmc-8.com
- @astrojs/check for TypeScript validation
- Prettier with Astro and TailwindCSS plugins for code formatting

### Special Features

- Project Sekai (プロジェクトセカイ) tools and calculators
- OG image generation API
- Breadcrumb navigation with i18n support
- Post navigation (previous/next) functionality
- Share buttons for social media
- Pagination with proper i18n routing
