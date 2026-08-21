import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const galleryItem = (image: () => z.ZodTypeAny) => z.object({
  image: image(),
  alt: z.string().trim().min(1),
  caption: z.string().trim().min(1).optional(),
  layout: z.enum(['wide', 'half']),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().trim().min(1),
    summary: z.string().trim().min(1),
    year: z.number().int().min(2000).max(2100),
    order: z.number().int().positive(),
    client: z.string().trim().min(1).optional(),
    role: z.string().trim().min(1),
    capabilities: z.array(z.string().trim().min(1)).min(1),
    cover: image(),
    coverAlt: z.string().trim().min(1),
    question: z.string().trim().min(1),
    objective: z.string().trim().min(1),
    strategy: z.string().trim().min(1),
    outcome: z.string().trim().min(1),
    externalUrl: z.url().optional(),
    gallery: z.array(galleryItem(image)).min(3),
  }),
});

export const collections = { projects };
