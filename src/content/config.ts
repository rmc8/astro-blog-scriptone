import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const blogSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    preview: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
});
const blog_ja = defineCollection({
    type: "content",
    schema: blogSchema,
});
const blog_en = defineCollection({
    type: "content",
    schema: blogSchema,
});
const blog_ko = defineCollection({
    type: "content",
    schema: blogSchema,
});

export const collections = {
    blog_ja,
    blog_en,
    blog_ko,
};
