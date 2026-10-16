import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { themes } from './lib/publication';

const research = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/research' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).max(300),
    status: z.enum(['draft', 'upcoming', 'published']).default('draft'),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.enum(themes)).min(1),
    featured: z.boolean().default(false),
    image: z.string().regex(/^\/(?!\/).+\.(png|jpg|jpeg|webp)$/).optional(),
    imageAlt: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.status === 'published' && !data.publishedAt) ctx.addIssue({ code: 'custom', message: 'Published articles require publishedAt.' });
    if (data.status !== 'published' && (data.publishedAt || data.updatedAt)) ctx.addIssue({ code: 'custom', message: 'Draft and upcoming entries must not have publication dates.' });
    if (data.updatedAt && data.publishedAt && data.updatedAt < data.publishedAt) ctx.addIssue({ code: 'custom', message: 'updatedAt must not precede publishedAt.' });
    if (data.image && !data.imageAlt) ctx.addIssue({ code: 'custom', message: 'Provide imageAlt for a custom social image.' });
  }),
});
export const collections = { research };
