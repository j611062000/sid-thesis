import rss from '@astrojs/rss';
import { site } from '../config';
import { getPublishedResearch } from '../lib/research';
import { researchPath } from '../lib/publication';
export async function GET() {
  return rss({
    title: site.name,
    description: site.tagline,
    site: site.url,
    items: (await getPublishedResearch()).map(({ id, data }) => ({
      title: data.title,
      description: data.description,
      pubDate: data.publishedAt!,
      link: researchPath(id),
      categories: data.tags,
    })),
    customData: '<language>en</language>',
  });
}
