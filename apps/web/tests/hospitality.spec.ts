import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

// Matches Next.js error page markers — not bare '500' which can appear in prices/rates
const SERVER_ERROR = /Internal Server Error|Application error|unhandled error/i;

test.describe('Hospitality regression', () => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('properties page loads', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });

  test('reservations page loads', async ({ page }) => {
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });

  test('front desk page loads', async ({ page }) => {
    await page.goto('/front-desk');
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });

  test('housekeeping page loads', async ({ page }) => {
    await page.goto('/housekeeping');
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });

  test('maintenance page loads', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });

  test('guests page loads', async ({ page }) => {
    await page.goto('/guests');
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });

  test('reviews page loads', async ({ page }) => {
    await page.goto('/reviews');
    await page.waitForLoadState('networkidle');
    const text = await page.textContent('body');
    expect(text).not.toMatch(SERVER_ERROR);
  });
});
