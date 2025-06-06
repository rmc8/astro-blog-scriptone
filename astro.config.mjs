// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://rmc-8.com",
    vite: {
        plugins: [tailwindcss()],
    },
    i18n: {
        defaultLocale: "ja",
        locales: ["ja", "en", "ko"],
    },
    integrations: [
        svelte(),
        mdx(),
        sitemap({
            i18n: {
                defaultLocale: "ja",
                locales: { ja: "ja", en: "en", ko: "ko" },
            },
        }),
    ],
    output: "hybrid",
    adapter: vercel(),
    markdown: {
        remarkPlugins: [remarkToc, remarkFlexibleCodeTitles],
    },
});
