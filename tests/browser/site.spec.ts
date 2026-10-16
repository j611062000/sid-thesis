import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/research/', '/about/', '/subscribe/', '/contact/', '/research/the-economics-of-agentic-commerce/', '/research/tag/technology/', '/research/tag/business/', '/research/tag/capital/', '/research/tag/infrastructure/', '/research/tag/investment/', '/404.html'];
test('every page is responsive, accessible, and has no broken asset requests', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400 && !response.url().endsWith('/404.html')) errors.push(`${response.status()} ${response.url()}`); });
  for (const route of pages) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations, `${route}: ${JSON.stringify(results.violations)}`).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test('theme persists, navigation and theme filters work', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute('aria-pressed', 'true');
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations).toEqual([]);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Research', exact: true }).click();
  await page.getByRole('navigation', { name: 'Filter research by theme' }).getByRole('link', { name: 'Infrastructure', exact: true }).click();
  await expect(page).toHaveURL(/\/research\/tag\/infrastructure\/$/);
  await expect(page.getByRole('link', { name: 'Infrastructure', exact: true }).first()).toHaveAttribute('aria-current', 'page');
});
test('navigation and research outlines work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await page.getByRole('link', { name: 'Explore the research outline' }).click();
  await expect(page.getByText('A question in progress.')).toBeVisible();
  await expect(page.locator('.theme-toggle')).toBeHidden();
  await context.close();
});
test('published article supports long-form features on screen', async ({ page }) => {
  await page.goto('http://127.0.0.1:4322/research/fixture-published/');
  await expect(page.locator('.katex-display')).toBeVisible();
  await expect(page.locator('.prose table')).toBeVisible();
  await expect(page.locator('.prose pre')).toBeVisible();
  await page.getByRole('navigation', { name: 'Table of contents' }).getByRole('link', { name: 'Equations' }).click();
  await expect(page).toHaveURL(/#equations$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});
