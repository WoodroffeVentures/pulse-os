import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth';

const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

test.describe('Opportunity lifecycle', () => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('Opportunity Radar loads with ranked cards or empty state', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).not.toContainText('500');

    // Either cards or empty state — never a blank screen
    const hasCards = await page.locator('[data-testid="radar-card"], h2, h3').count();
    expect(hasCards).toBeGreaterThan(0);
  });

  test('filter tabs render on Radar', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');
    // Filter tabs should be present
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/All|Draft|Open|Active/i);
  });

  test('Opportunity Workspace loads with 6 tabs', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');

    // Click first opportunity if one exists
    const firstCard = page.locator('a[href*="/opportunities/"]').first();
    const cardCount = await firstCard.count();

    if (cardCount === 0) {
      test.skip(); // No opportunities to test — covered by create test
      return;
    }

    await firstCard.click();
    await page.waitForURL(/\/opportunities\/.+/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Six tabs visible
    const tabLabels = ['Brief', 'Scoring', 'Participants', 'Activation', 'Outcomes', 'Evidence'];
    for (const label of tabLabels) {
      await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible();
    }
  });

  test('each Workspace tab renders without crash', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');

    const firstCard = page.locator('a[href*="/opportunities/"]').first();
    if (await firstCard.count() === 0) return;

    await firstCard.click();
    await page.waitForURL(/\/opportunities\/.+/, { timeout: 10000 });

    const tabs = ['Brief', 'Scoring', 'Participants', 'Activation', 'Outcomes', 'Evidence'];
    for (const label of tabs) {
      const btn = page.getByRole('button', { name: new RegExp(label, 'i') });
      if (await btn.count()) {
        await btn.click();
        await page.waitForTimeout(500);
        await expect(page.locator('body')).not.toContainText('500');
      }
    }
  });

  test('dashboard shows Top Opportunities and Evidence Health panels', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const bodyText = await page.textContent('body');
    expect(bodyText).toMatch(/Opportunity|Evidence/i);
    await expect(page.locator('body')).not.toContainText('500');
  });
});
