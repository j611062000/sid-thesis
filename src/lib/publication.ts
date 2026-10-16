export const themes = [
  'Technology',
  'Business',
  'Capital',
  'Infrastructure',
  'Investment',
] as const;
export type Theme = (typeof themes)[number];
export type Publication = {
  status: 'draft' | 'upcoming' | 'published';
  publishedAt?: Date;
};

export function isPublished(data: Publication, now = new Date()) {
  return (
    data.status === 'published' && !!data.publishedAt && data.publishedAt <= now
  );
}
export function isVisible(data: Publication, now = new Date()) {
  return data.status === 'upcoming' || isPublished(data, now);
}
export function readingMinutes(body: string) {
  const words = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}
export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
export function researchPath(id: string) {
  return `/research/${id}/`;
}
