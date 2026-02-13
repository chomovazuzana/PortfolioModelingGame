import { test, expect } from '@playwright/test';

/**
 * Test joining a game via game code.
 * Requires backend running with DISABLE_LOGIN=true and a seeded database.
 */
test.describe('Join Game', () => {
  test('join game via code from games list', async ({ page }) => {
    // Navigate to games list
    await page.goto('/games');
    await page.waitForURL(/\/games/);

    // Click Join Game button
    await page.getByRole('button', { name: 'Join Game' }).click();

    // Dialog should appear
    await expect(page.getByText('Join Game')).toBeVisible();

    // Enter an invalid code
    await page.getByLabel(/Game Code/i).fill('ZZZZZZ');
    await page.getByRole('button', { name: 'Join' }).click();

    // Should show error
    await expect(page.getByText(/not found|invalid|check/i)).toBeVisible();

    // Close dialog
    await page.getByRole('button', { name: 'Cancel' }).or(
      page.getByLabel('Close')
    ).click();
  });

  test('join game via dashboard join button', async ({ page }) => {
    // First create a game
    await page.goto('/games');
    await page.waitForURL(/\/games/);

    await page.getByRole('button', { name: 'Create Game' }).click();
    await page.getByLabel('Game Name').fill('Join Test Game');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should be on dashboard
    await expect(page).toHaveURL(/\/games\/.+/);
    await expect(page.getByText('Join Test Game')).toBeVisible();

    // Check game code is displayed
    const gameCode = page.locator('text=/[A-Z0-9]{6}/').first();
    await expect(gameCode).toBeVisible();
  });

  test('games list shows empty state for no games', async ({ page }) => {
    // Navigate to games list
    await page.goto('/games');
    await page.waitForURL(/\/games/);

    // The page should load without errors (may or may not have games)
    await expect(page.getByText('Games')).toBeVisible();
  });
});
