import { getCollection } from 'astro:content';
import { isVisible, isPublished } from './publication';
export async function getResearch() {
  const now = new Date();
  return (
    await getCollection('research', ({ data }) => isVisible(data, now))
  ).sort(
    (a, b) =>
      (b.data.publishedAt?.getTime() ?? 0) -
        (a.data.publishedAt?.getTime() ?? 0) || a.id.localeCompare(b.id),
  );
}
export async function getPublishedResearch() {
  return (await getResearch()).filter(({ data }) => isPublished(data));
}
