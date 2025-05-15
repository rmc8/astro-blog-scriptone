// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";

import mdx from "@astrojs/mdx";

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
});