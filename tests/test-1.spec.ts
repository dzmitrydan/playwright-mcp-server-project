import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://cloud.google.com/products/calculator');

  await expect(page.locator('c-wiz').filter({ hasText: 'personAlready have a Google' }).locator('img')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Welcome to Google Cloud\'s pricing calculator');
  await expect(page.locator('body')).toContainText('Add and configure products to get a cost estimate to share with your team.');

  await expect(page.locator('body')).toContainText('Watch now');
  await page.getByRole('link', { name: 'Watch now' }).click();

  await page.locator('iframe[title="Google Cloud pricing calculator"]').contentFrame().locator('video').waitFor({ state: 'visible' });
  await page.getByLabel('Close modal').click();
  
  await page.getByRole('button', { name: 'Open currency selector' }).click();
  await page.getByRole('menuitemradio', { name: 'Polish Zloty (PLN)' }).click();

  await page.getByRole('button', { name: 'Add to estimate' }).nth(1).click();
  await page.getByRole('button', { name: 'Compute Engine A secure and' }).click();
  
  await expect(page.getByLabel('Open currency selector')).toContainText('PLN');
  await expect(page.locator('body')).toContainText('zł');
});