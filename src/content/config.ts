import { z, defineCollection } from "astro:content";

const blogSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    slug: z.string().optional(),
    date: z.date(),
    updatedDate: z.date().optional(),
    preview: z.string().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    toc: z.boolean().default(true),
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
const diary = defineCollection({
    type: "content",
    schema: blogSchema,
});

export const collections = {
    blog_ja,
    blog_en,
    blog_ko,
    diary,
};
