import { cp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { checkSite } from './check-site.mjs';

// Build a disposable copy. Fixture content never enters src/ or the deployment artifact.
const root = process.cwd();
const fixtureRoot = path.join(root, '.qa/content-fixture');
await rm(fixtureRoot, { recursive: true, force: true });
await mkdir(fixtureRoot, { recursive: true });
for (const file of ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) await cp(path.join(root, file), path.join(fixtureRoot, file), { recursive: true });
await symlink(path.join(root, 'node_modules'), path.join(fixtureRoot, 'node_modules'), 'dir');
const content = path.join(fixtureRoot, 'src/content/research');
await cp('tests/fixtures/published.mdx', path.join(content, 'fixture-published.mdx'));
const sample = (status, date = '') => `---\ntitle: 'Fixture ${status}'\ndescription: 'Test content only.'\nstatus: ${status}\n${date}tags: [Technology]\n---\n\n## Test content\n\nNot for publication.\n`;
await writeFile(path.join(content, 'fixture-draft.mdx'), sample('draft'));
await writeFile(path.join(content, 'fixture-future.mdx'), sample('published', 'publishedAt: 2999-01-01\n'));
await writeFile(path.join(content, 'fixture-older.mdx'), sample('published', 'publishedAt: 2020-01-01\n'));
const build = spawnSync(process.execPath, [path.join(root, 'node_modules/astro/bin/astro.mjs'), 'build'], { cwd: fixtureRoot, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, encoding: 'utf8' });
if (build.status !== 0) { console.error(build.stdout, build.stderr); process.exit(1); }
const dist = path.join(fixtureRoot, 'dist');
await checkSite(dist);
const article = load(await readFile(path.join(dist, 'research/fixture-published/index.html'), 'utf8'));
assert.ok(article('.prose table').length, 'GFM tables');
assert.ok(article('.footnotes').length, 'Footnotes');
assert.ok(article('.katex').length >= 2, 'Inline and display math');
assert.ok(article('.katex-display').length, 'Display math');
assert.ok(article('pre code').length, 'Highlighted code');
assert.ok(article('aside[aria-label="Test annotation"]').length, 'MDX');
assert.ok(article('nav[aria-label="Table of contents"] a').length >= 4, 'Generated TOC');
assert.ok(article('.related a[href="/research/fixture-older/"]').length, 'Related articles');
const schema = JSON.parse(article('script[type="application/ld+json"]').text());
assert.equal(schema['@type'], 'Article');
assert.equal(schema.datePublished, '2020-01-02T00:00:00.000Z');
assert.equal(schema.dateModified, '2020-01-03T00:00:00.000Z');
const outline = await readFile(path.join(dist, 'research/the-economics-of-agentic-commerce/index.html'), 'utf8');
assert.ok(!outline.includes('datePublished'), 'Upcoming has no publication date');
assert.ok(!outline.includes('"@type":"Article"'), 'Upcoming has no Article schema');
const feed = load(await readFile(path.join(dist, 'rss.xml'), 'utf8'), { xml: true });
assert.deepEqual(feed('item link').map((_, el) => feed(el).text()).get(), ['https://sidthesis.com/research/fixture-published/', 'https://sidthesis.com/research/fixture-older/']);
for (const hidden of ['fixture-draft', 'fixture-future']) {
  await assert.rejects(readFile(path.join(dist, 'research', hidden, 'index.html')));
  for (const surface of ['index.html', 'research/index.html', 'research/tag/technology/index.html', 'sitemap-0.xml', 'rss.xml']) assert.ok(!(await readFile(path.join(dist, surface), 'utf8')).includes(hidden), `${hidden} absent from ${surface}`);
}
console.log('Verified MDX, equations, tables, footnotes, code, TOC, related articles, RSS order and publication visibility in an isolated build.');
