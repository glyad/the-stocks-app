import { expect, type Page, test } from '@playwright/test';

const hasPaintedCanvas = async (page: Page) =>
  page.evaluate(() => {
    const canvases: HTMLCanvasElement[] = [];

    const visit = (root: ParentNode | ShadowRoot) => {
      root.querySelectorAll('*').forEach((element) => {
        if (element instanceof HTMLCanvasElement) {
          canvases.push(element);
        }

        if (element.shadowRoot) {
          visit(element.shadowRoot);
        }
      });
    };

    visit(document);

    return canvases.some((canvas) => {
      if (canvas.width === 0 || canvas.height === 0) return false;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return false;

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 3; index < data.length; index += 40) {
        if (data[index] !== 0) return true;
      }

      return false;
    });
  });

test('renders the desktop stock app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('stocks-app')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stocks' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1M' })).toBeVisible();
  await expect(page.locator('igc-financial-chart')).toBeVisible();
  await expect.poll(() => hasPaintedCanvas(page), { timeout: 10_000 }).toBe(true);
});
