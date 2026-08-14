import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

test.describe('Hospitality regression', () => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('properties page loads', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    // No crash — page renders
    await expect(page.locator('main, [role="main"], body')).toBeVisible();
    // No 500 error shown
    const text = await page.textContent('body');
    expect(text).not.toMatch(/500|Internal Server Error/i);
  });

  test('reservations page loads', async ({ page }) => {
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('front desk page loads', async ({ page }) => {
    await page.goto('/front-desk');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('housekeeping page loads', async ({ page }) => {
    await page.goto('/housekeeping');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('maintenance page loads', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('guests page loads', async ({ page }) => {
    await page.goto('/guests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });

  test('reviews page loads', async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');
  });
});
