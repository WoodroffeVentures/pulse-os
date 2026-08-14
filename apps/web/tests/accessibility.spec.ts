import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAs } from './helpers/auth';

const EMAIL = process.env.TEST_USER_EMAIL ?? '';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? '';

test.describe('Accessibility — public', () => {
  test('public root page has no critical axe violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    if (critical.length > 0) {
      console.log('Critical violations:', JSON.stringify(critical.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      })), null, 2));
    }
    expect(critical).toHaveLength(0);
  });
});

test.describe('Accessibility — authenticated', () => {
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('dashboard has no critical axe violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(critical).toHaveLength(0);
  });

  test('Opportunity Radar has no critical axe violations', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const critical = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
    expect(critical).toHaveLength(0);
  });
});

test.describe('Mobile 375px — public', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('public root has no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});

test.describe('Mobile 375px — authenticated', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test.skip(!EMAIL || !PASSWORD, 'TEST_USER_EMAIL / TEST_USER_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, EMAIL, PASSWORD);
  });

  test('dashboard has no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });

  test('Opportunity Radar has no horizontal overflow at 375px', async ({ page }) => {
    await page.goto('/opportunities');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });
});
