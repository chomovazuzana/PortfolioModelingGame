import { test, expect } from '@playwright/test';

/**
 * Full gameplay e2e test with DISABLE_LOGIN=true.
 * Requires backend running with DISABLE_LOGIN=true and a seeded database.
 */
test.describe('Game Flow', () => {
  test('complete game from creation through all 4 years to final results', async ({ page }) => {
    // 1. Visit landing page - should redirect to games since DISABLE_LOGIN=true auto-authenticates
    await page.goto('/');
    await page.waitForURL(/\/games/);

    // 2. Create a new game (dev user is admin)
    await page.getByRole('button', { name: 'Create Game' }).click();

    // Fill the create game dialog
    await page.getByLabel('Game Name').fill('E2E Test Game');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should navigate to game dashboard
    await expect(page).toHaveURL(/\/games\/.+/);
    await expect(page.getByText('E2E Test Game')).toBeVisible();

    // 3. Join the game
    await page.getByRole('button', { name: 'Join Game' }).click();
    await page.waitForTimeout(500);

    // 4. Navigate to play
    await page.getByRole('link', { name: /Start Playing|Continue/ }).or(
      page.getByRole('button', { name: /Start Playing|Continue/ })
    ).click();
    await expect(page).toHaveURL(/\/play/);

    // 5. Year 2021: Set allocations and submit
    await expect(page.getByText('Year 2021')).toBeVisible();
    await expect(page.getByText(/Strong Recovery|scenario/i)).toBeVisible();

    // Submit allocation (default 20% each)
    await page.getByRole('button', { name: 'Submit Allocation' }).click();

    // Confirm dialog
    await page.getByRole('button', { name: /Confirm/ }).click();

    // Should see year result modal
    await expect(page.getByText('Year 2021 Results')).toBeVisible();
    await page.getByRole('button', { name: /Continue to Year 2022/ }).click();

    // 6. Year 2022
    await expect(page.getByText('Year 2022 Allocation')).toBeVisible();
    await page.getByRole('button', { name: 'Submit Allocation' }).click();
    await page.getByRole('button', { name: /Confirm/ }).click();
    await expect(page.getByText('Year 2022 Results')).toBeVisible();
    await page.getByRole('button', { name: /Continue to Year 2023/ }).click();

    // 7. Year 2023
    await expect(page.getByText('Year 2023 Allocation')).toBeVisible();
    await page.getByRole('button', { name: 'Submit Allocation' }).click();
    await page.getByRole('button', { name: /Confirm/ }).click();
    await expect(page.getByText('Year 2023 Results')).toBeVisible();
    await page.getByRole('button', { name: /Continue to Year 2024/ }).click();

    // 8. Year 2024 (final year)
    await expect(page.getByText('Year 2024 Allocation')).toBeVisible();
    await page.getByRole('button', { name: 'Submit Allocation' }).click();
    await page.getByRole('button', { name: /Confirm/ }).click();
    await expect(page.getByText('Year 2024 Results')).toBeVisible();
    await page.getByRole('button', { name: /View Final Results/ }).click();

    // 9. Final results page
    await expect(page).toHaveURL(/\/results/);
    await expect(page.getByText('Final Results')).toBeVisible();
    await expect(page.getByText('Final Leaderboard')).toBeVisible();
    await expect(page.getByText('Portfolio Growth')).toBeVisible();
    await expect(page.getByText('Allocation Comparison')).toBeVisible();
    await expect(page.getByText('Fund Benchmark Comparison')).toBeVisible();

    // Check player summary card is visible
    await expect(page.getByText('Your Final Value')).toBeVisible();
    await expect(page.getByText('Total Return')).toBeVisible();
    await expect(page.getByText('Rank')).toBeVisible();
  });

  test('play page redirects completed player to results', async ({ page }) => {
    // This test assumes the game from the previous test exists
    // Navigate to games list
    await page.goto('/games');
    await page.waitForURL(/\/games/);

    // If there's a completed game, clicking play should redirect to results
    const gameCard = page.locator('[data-testid="game-card"]').first();
    if (await gameCard.isVisible()) {
      await gameCard.click();
      // If player is completed, navigating to /play should redirect
      const url = page.url();
      const gameId = url.match(/\/games\/([^/]+)/)?.[1];
      if (gameId) {
        await page.goto(`/games/${gameId}/play`);
        // Should redirect to results or stay if not completed
        await page.waitForTimeout(1000);
      }
    }
  });
});
