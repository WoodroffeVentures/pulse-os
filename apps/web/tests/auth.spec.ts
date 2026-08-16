import { test, expect } from '@playwright/test';

// Requires env vars: TEST_USER_EMAIL, TEST_USER_PASSWORD
const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

test.describe('Authentication', () => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');

  test('login → dashboard → org context resolves', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Password' }).click();
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');

    // Org name appears in desktop sidebar (not loading state)
    // Two <aside> elements exist (desktop + mobile drawer) — target the visible desktop one
    await expect(page.locator('aside.hidden.md\\:flex')).not.toContainText('…');
  });

  test('session persists after refresh', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Password' }).click();
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('logout redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Password' }).click();
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Click sign-out button in sidebar
    await page.click('button:has-text("Sign out")');
    await page.waitForURL(/\/(login|sign-in|auth|$)/, { timeout: 10000 });
    expect(page.url()).not.toContain('/dashboard');
  });
});
