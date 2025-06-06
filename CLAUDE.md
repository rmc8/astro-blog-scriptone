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

### Internationalization (i18n)
- Default locale: Japanese (`ja`)
- Supported locales: Japanese (`ja`), English (`en`), Korean (`ko`)
- i18n configuration in `astro.config.mjs` and `src/i18n/`
- Language-specific routing: `/blog/ja/[slug]`, `/blog/en/[slug]`, `/blog/ko/[slug]`
- UI translations in `src/i18n/ui.ts`

### Routing Structure
- Dynamic routes for blog posts: `src/pages/blog/[lang]/[slug].astro`
- Archive, category, and tag pages for each language
- Static pages: about, privacy policy, project sekai tools
- API endpoints in `src/pages/api/`

### Component Architecture
- Astro components for layout and blog functionality in `src/components/`
- Svelte components integrated via `@astrojs/svelte`
- Reusable blog components: Article, BlogList, CategoryTag, PostDate, etc.
- Common components: Header, Footer, SNSLink
- Specialized components for diary and project sekai sections

### Styling
- TailwindCSS v4 with Vite plugin integration
- Custom fonts: NotoSans (JP/KR) and SourceHanCode (JP)
- Global styles in `src/styles/`
- Component-specific styles using Astro's scoped CSS

### Content Features
- Markdown/MDX support with remark plugins
- Table of Contents generation via `remark-toc`
- Code block titles via `remark-flexible-code-titles`
- Frontmatter schema validation with categories, tags, dates
- Draft post support

### Build Configuration
- TypeScript with strict mode and path aliases (`@/*` → `./src/*`)
- Vercel adapter for deployment
- Sitemap generation with i18n support
- Site URL: https://rmc-8.com