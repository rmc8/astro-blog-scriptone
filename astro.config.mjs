// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import remarkFlexibleCodeTitles from "remark-flexible-code-titles";

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    i18n: {
        defaultLocale: "ja",
        locales: ["ja", "en", "ko"],
    },
    integrations: [svelte(), mdx()],
    adapter: vercel(),
    markdown: {
        remarkPlugins: [remarkToc, remarkFlexibleCodeTitles],
    },
});
