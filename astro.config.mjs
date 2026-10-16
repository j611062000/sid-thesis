import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://sidthesis.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/404/') })],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  devToolbar: { enabled: false },
});
