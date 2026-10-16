import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isVisible, isPublished, readingMinutes, formatDate } from '../src/lib/publication.ts';

const now = new Date('2026-10-16T00:00:00Z');
test('drafts, undated articles, and future publications stay out of public surfaces', () => {
  assert.equal(isVisible({ status: 'draft' }, now), false);
  assert.equal(isVisible({ status: 'published' }, now), false);
  assert.equal(isVisible({ status: 'published', publishedAt: new Date('2027-01-01') }, now), false);
});
test('upcoming outlines are public but never treated as published', () => {
  assert.equal(isVisible({ status: 'upcoming' }, now), true);
  assert.equal(isPublished({ status: 'upcoming' }, now), false);
  assert.equal(isPublished({ status: 'published', publishedAt: now }, now), true);
});
test('reading time is bounded and dates do not shift with the host timezone', () => {
  assert.equal(readingMinutes('word '.repeat(441)), 3);
  assert.equal(readingMinutes(''), 1);
  assert.equal(formatDate(new Date('2026-10-16T00:00:00Z')), '16 October 2026');
});
