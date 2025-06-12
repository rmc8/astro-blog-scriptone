# CLAUDE.md

**Speak in Japanese!**

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Information

- **Project Name**: certain-crater
- **Framework**: Astro v5.7.13 (Latest major version)
- **Site URL**: https://rmc-8.com

## Development Commands

- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site to ./dist/
- `npm run preview` - Preview production build locally
- `npm run astro ...` - Run Astro CLI commands (e.g., `astro check`, `astro add`)

## Architecture Overview

This is an Astro v5-based multilingual blog site with Svelte 5 components and TailwindCSS v4 styling.

### Content Management System

- Content is managed through Astro's content collections in `src/content/`
- Three blog collections for different languages: `blog_ja`, `blog_en`, `blog_ko`
- Additional `diary` collection for diary entries
- Content schema defined in `src/content/config.ts` with frontmatter validation
- **145+ content files** across all collections including:
  - Technical articles on programming, data science, hardware projects
  - Product reviews and tutorials
  - Multilingual content with Korean translations
  - MDX support for interactive components (e.g., data visualization charts)

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
- API endpoints in `src/pages/api/` including:
  - OG image generation (`/api/og.ts`)
  - Project Sekai tools (`/api/project_sekai/`)
  - **moodeSKy OAuth API** (`/api/moodesky/oauth/client-metadata.json.ts`)
- **OAuth callback pages**: moodeSKy OAuth authentication flow (`/moodesky/oauth/callback.astro`)
- Sitemap generation with multilingual support

### Component Architecture

- Astro components for layout and blog functionality in `src/components/`
- Svelte 5.30.2 components integrated via `@astrojs/svelte`
- Organized component structure:
    - `blog/` - Blog-specific components (Article, BlogList, CategoryTag, ToC, RelatedPosts, SearchPage, etc.)
    - `common/` - Shared components (Header, Footer, Pagination, ShareButtons, Breadcrumb, PostNavigation, etc.)
    - `diary/` - Diary-specific components (Article, DiaryList, PostDate)
    - `home/` - Homepage components (Contents, Me, Skills)
    - `i18n/` - Internationalization components (LanguagePicker)
    - `prsk/` - Project Sekai specific components (Profile, Tools)
    - `seo/` - SEO components (SEOHead, StructuredData)
- **Dynamic content components** in `src/content/blog_ja/component/` for interactive features

### Styling

- TailwindCSS v4.1.7 with @tailwindcss/vite plugin integration
- Configuration in `tailwind.config.js` (applyBaseStyles: false)
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

- Output: Static site generation (`output: "static"`)
- TypeScript v5.8.3 with strict mode and path aliases (`@/*` → `./src/*`)
- Vercel adapter (@astrojs/vercel v8.0.4) for deployment
- Sitemap generation with i18n support
- Site URL: https://rmc-8.com
- @astrojs/check for TypeScript validation
- Prettier with Astro and TailwindCSS plugins for code formatting
- Integrations:
  - @astrojs/mdx v4.1.1 for MDX support
  - @astrojs/sitemap v3.3.1 for sitemap generation
  - @astrojs/svelte v7.3.2 for Svelte 5 integration
  - @astrojs/vercel v8.0.4 for Vercel deployment

### Special Features

- Project Sekai (プロジェクトセカイ) tools and calculators
- OG image generation API
- **moodeSKy OAuth Server**: Bluesky OAuth 2.0 + DPoP authentication server
  - Client metadata endpoint: `https://rmc-8.com/api/moodesky/oauth/client-metadata.json`
  - OAuth callback page: `https://rmc-8.com/moodesky/oauth/callback`
  - Custom scheme support: `mooodysky://oauth/callback`
  - Cross-platform mobile app authentication
- Breadcrumb navigation with i18n support
- Post navigation (previous/next) functionality
- Share buttons for social media
- Pagination with proper i18n routing

### Dependencies

- **Core Framework**: Astro v5.7.13
- **UI Framework**: Svelte v5.30.2
- **CSS Framework**: TailwindCSS v4.1.7
- **Language**: TypeScript v5.8.3
- **Markdown Processing**:
  - remark-toc v9.0.0
  - remark-flexible-code-titles v1.3.0
- **Development Tools**:
  - prettier v3.4.2
  - prettier-plugin-astro v0.14.1
  - prettier-plugin-tailwindcss v0.6.11

## Project Structure

```
src/
├── components/          # Reusable Astro/Svelte components
│   ├── blog/           # Blog-specific components
│   ├── common/         # Shared UI components  
│   ├── diary/          # Diary functionality
│   ├── home/           # Homepage components
│   ├── i18n/           # Internationalization
│   ├── prsk/           # Project Sekai tools
│   └── seo/            # SEO and structured data
├── content/            # Content collections
│   ├── blog_ja/        # Japanese blog posts (40+ articles)
│   ├── blog_en/        # English blog posts (40+ articles) 
│   ├── blog_ko/        # Korean blog posts (40+ articles)
│   ├── diary/          # Personal diary entries
│   └── config.ts       # Content schema definitions
├── i18n/              # Translation utilities
├── layouts/           # Page layout templates
├── lib/               # Utility functions and data
│   ├── collections/   # Content collection helpers
│   ├── constants.ts   # Site configuration
│   ├── seo.ts         # SEO utilities
│   └── types.ts       # TypeScript definitions
├── pages/             # File-based routing
│   ├── api/           # API endpoints
│   │   ├── moodesky/oauth/  # moodeSKy OAuth server
│   │   ├── og.ts      # OG image generation
│   │   └── project_sekai/   # Project Sekai APIs
│   ├── blog/[lang]/   # Dynamic blog routes
│   ├── diary/         # Diary pages
│   ├── moodesky/oauth/ # OAuth callback pages
│   └── project_sekai/ # Project Sekai tools
└── styles/            # Global CSS styles
```

## Task Management & Development Tools

### Todoist Integration

- **MCP Todoist Integration**: Task management via Claude Code MCP (Model Context Protocol)
- **Project**: moyousky development tasks tracked in Todoist
- **OAuth Implementation Tasks**: Comprehensive task tracking for moodeSKy OAuth server implementation
- **Priority System**: Tasks categorized by priority (1-4) with detailed descriptions
- **Progress Tracking**: Real-time task status updates (pending, in_progress, completed)

### moodeSKy OAuth Implementation

- **Purpose**: OAuth 2.0 + DPoP authentication server for moodeSKy Flutter app
- **Implementation Status**: ✅ Web server implementation completed
- **Integration**: Uses rmc-8.com domain for OAuth authentication flow
- **Flutter Integration**: Requires `auth_provider.dart` configuration update
- **Security**: Follows Bluesky OAuth specification with DPoP (Demonstration of Proof-of-Possession)

### Related Projects

- **moodeSKy**: Flutter-based Bluesky client application
- **Repository**: Managed separately from this blog site
- **Authentication Flow**: 
  1. moodeSKy app → Bluesky OAuth
  2. Bluesky → rmc-8.com callback
  3. rmc-8.com → moodeSKy app redirect
  4. Token exchange completion

## Important Instructions

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
