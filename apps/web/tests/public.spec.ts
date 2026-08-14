import { test, expect } from '@playwright/test';

test.describe('Public page', () => {
  test('loads and shows PULSE proposition', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PULSE|Pulse/i);
    // Page renders without crash
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(100);
  });

  test('redirects unauthenticated users away from app routes', async ({ page }) => {
    await page.goto('/dashboard');
    // Should land on login/auth page, not dashboard
    await page.waitForURL(/\/(login|sign-in|auth|$)/, { timeout: 10000 });
    const url = page.url();
    expect(url).not.toContain('/dashboard');
  });

  test('redirects unauthenticated users from opportunities', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForURL(/\/(login|sign-in|auth|$)/, { timeout: 10000 });
    expect(page.url()).not.toContain('/opportunities');
  });
});
