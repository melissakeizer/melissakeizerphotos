import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().nullable(),
    date: z.string().optional().nullable(),
    order: z.number().default(999),
    // Every post declares its presentation: a narrative story or a photo gallery.
    // Narrative stories can use a hero; galleries always open with metadata and photos.
    type: z.enum(['story', 'gallery']).default('gallery'),
    galleryLayout: z.enum(['fitted-grid', 'horizontal']).optional(),
    categories: z.array(z.string()).default([]),
    coverImage: z.string().optional().nullable(),
    photos: z.array(z.string()).default([]),
    description: z.string().optional().nullable(),
    footnotes: z.string().optional().nullable(),
    coverStyle: z.enum(['full', 'split']).default('full'),
    theme: z.enum(['light', 'dark']).default('light'),
  }),
});

export const collections = { stories };
