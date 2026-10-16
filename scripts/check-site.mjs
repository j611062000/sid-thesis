import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

export async function checkSite(directory = 'dist') {
  const root = path.resolve(directory);
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
  }
  const files = await walk(root);
  const html = files.filter((file) => file.endsWith('.html'));
  const documents = new Map();
  for (const file of html) documents.set(file, load(await readFile(file, 'utf8')));
  let checked = 0;
  for (const [file, $] of documents) {
    const pathname = '/' + path.relative(root, file).replace(/index\.html$/, '');
    const canonical = new URL(pathname, 'https://sidthesis.com');
    assert.equal($('html').attr('lang'), 'en', file);
    assert.equal($('h1').length, 1, `One h1: ${file}`);
    assert.equal($('main').length, 1, `One main: ${file}`);
    assert.ok($('meta[name="description"]').attr('content'), file);
    assert.equal($('link[rel="canonical"]').attr('href'), canonical.href, file);
    assert.equal($('meta[property="og:url"]').attr('content'), canonical.href, file);
    assert.ok($('meta[property="og:image"]').attr('content'), file);
    $('script[type="application/ld+json"]').each((_, element) => JSON.parse($(element).text()));
    const refs = [...$('a[href], link[href], img[src], script[src], meta[property="og:image"]')];
    for (const element of refs) {
      const href = $(element).attr('href') ?? $(element).attr('src') ?? $(element).attr('content');
      if (!href || href.startsWith('mailto:')) continue;
      const url = new URL(href, canonical);
      if (url.origin !== canonical.origin) continue;
      let target = path.join(root, decodeURIComponent(url.pathname));
      try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); }
      catch { assert.fail(`Broken link ${href} in ${pathname}`); }
      assert.ok(files.includes(target), `Missing asset ${href} in ${pathname}`);
      if (url.hash && documents.has(target)) {
        const doc = documents.get(target);
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok([...doc('[id]')].some((el) => doc(el).attr('id') === id), `Missing fragment ${href} in ${pathname}`);
      }
      checked++;
    }
  }
  const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
  const map = load(sitemap, { xml: true });
  assert.ok(map('loc').length >= 10, 'Sitemap contains the public pages');
  assert.ok(!sitemap.includes('/404'), '404 must not be indexed');
  for (const loc of map('loc')) {
    const url = new URL(map(loc).text());
    assert.equal(url.origin, 'https://sidthesis.com');
    assert.ok(files.includes(path.join(root, url.pathname, 'index.html')), `Sitemap target exists: ${url}`);
  }
  assert.ok((await readFile(path.join(root, 'robots.txt'), 'utf8')).includes('https://sidthesis.com/sitemap-index.xml'));
  const feed = load(await readFile(path.join(root, 'rss.xml'), 'utf8'), { xml: true });
  assert.equal(feed('channel > title').text(), 'Sid Thesis');
  console.log(`Verified ${html.length} pages, ${checked} internal links/assets, canonical metadata, JSON-LD, RSS and sitemap.`);
}
if (process.argv[1] === import.meta.filename) await checkSite(process.argv[2]);
