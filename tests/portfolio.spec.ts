import { test, expect } from '@playwright/test';

test('loads the voxel scene and all four projects without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#world canvas')).toBeVisible();
  await expect(page.locator('#world-status')).toHaveClass(/is-ready/);
  await expect(page.locator('.project-card')).toHaveCount(4);
  await expect(page.getByText('Mobile developer by title,')).toBeVisible();
  expect(errors).toEqual([]);
});

test('all project dialogs have correct repository links and restore keyboard focus', async ({ page }) => {
  await page.goto('/');
  const repos = ['Rinku', 'SmartNotes', 'WhatsAppNoContact', 'kmp-record'];
  const names = ['Rinku', 'SmartNotes', 'ChatLaunch', 'KMP-Record'];
  for (let index = 0; index < repos.length; index++) {
    const card = page.locator('.project-card').nth(index);
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('#dialog-title')).toHaveText(names[index]);
    await expect(page.locator('#dialog-github')).toHaveAttribute('href', `https://github.com/theolm/${repos[index]}`);
    if (index === 2) {
      await expect(page.locator('#dialog-art img')).toBeVisible();
      await expect.poll(() => page.locator('#dialog-art img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    if (index === 3) await expect(page.locator('#dialog-extra')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(card).toBeFocused();
  }
});

test('reduced motion pauses the scene and uses a still demo image', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Resume scene animation' })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-project="chatlaunch"]').click();
  await expect(page.locator('#dialog-art img')).toHaveAttribute('src', '/images/chatlaunch-still.png');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Resume scene animation' }).click();
  await expect(page.getByRole('button', { name: 'Pause scene animation' })).toHaveAttribute('aria-pressed', 'false');
});

test('mobile layout has no horizontal overflow and project details fit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('[data-project="smartnotes"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const box = await page.getByRole('dialog').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.width).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Close project details' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('WebGL failure keeps the complete HTML portfolio functional', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('#world-status')).toContainText('The spirits are resting');
  await expect(page.locator('.project-card')).toHaveCount(4);
  await page.locator('[data-project="rinku"]').click();
  await expect(page.locator('#dialog-title')).toHaveText('Rinku');
  await expect(page.locator('#dialog-github')).toHaveAttribute('href', 'https://github.com/theolm/Rinku');
});

test('canvas monuments open project details by raycasting', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#world-status')).toHaveClass(/is-ready/);
  const canvas = page.locator('#world canvas');
  const rect = await canvas.boundingBox();
  let found = false;
  // Scan the known monument region instead of coupling tests to internal scene objects.
  for (const y of [.58, .64, .7]) {
    for (const x of [.35, .44, .53, .62]) {
      await page.mouse.move(rect!.x + rect!.width * x, rect!.y + rect!.height * y);
      if (await page.locator('#world-tooltip').evaluate(el => el.classList.contains('visible'))) {
        await page.mouse.click(rect!.x + rect!.width * x, rect!.y + rect!.height * y);
        found = true;
        break;
      }
    }
    if (found) break;
  }
  expect(found).toBe(true);
  await expect(page.getByRole('dialog')).toBeVisible();
});
