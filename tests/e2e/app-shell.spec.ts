import { expect, test } from '@playwright/test';

test('renders the desktop stock app shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('stocks-app')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stocks' })).toBeVisible();
  await expect(page.getByRole('button', { name: '1M' })).toBeVisible();
  await expect(page.locator('igc-financial-chart')).toBeVisible();
});
