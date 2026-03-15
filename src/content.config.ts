import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    order: z.number().default(999),
    type: z.enum(['story', 'gallery']).default('gallery'),
    categories: z.array(z.string()).default([]),
    coverImage: z.string().optional().nullable(),
    photos: z.array(z.string()).default([]),
    description: z.string().optional().nullable(),
    footnotes: z.string().optional().nullable(),
  }),
});

export const collections = { stories };
