const { test, expect } = require('@playwright/test');

test.describe('Insurance Fraud Intelligence & Investigation Flow', () => {
  test('Complete lifecycle: Login -> Dashboard -> High-Risk Claim -> Explainability -> Graph -> Investigate -> Note -> Reload Persistence', async ({ page }) => {
    // 1. Navigate to /login
    await page.goto('/login');
    await expect(page).toHaveTitle(/Insurance Fraud Intelligence/i);

    // 2. Click "Use Demo Account" and verify credentials pre-fill
    const demoBtn = page.locator('#btn-demo-account');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    await expect(page.locator('#email')).toHaveValue('analyst@demo-insurance.com');
    await expect(page.locator('#password')).toHaveValue('demo123');

    // 3. Submit login
    await page.locator('#btn-sign-in').click();

    // 4. Assert dashboard loads with stats and claims queue
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Claims Risk Screening');
    await expect(page.getByText('Total Screened Claims')).toBeVisible();
    await expect(page.getByText('High Risk Claims', { exact: true })).toBeVisible();

    // 5. Verify claims table rendered and locate high-risk claim CLM-003
    const highRiskClaimRow = page.locator('[data-testid="claim-row-CLM-003"]');
    await expect(highRiskClaimRow).toBeVisible();

    // 6. Click on the high-risk claim to view intelligence detail
    await highRiskClaimRow.click();
    await page.waitForURL('/claims/CLM-003');

    // 7. Verify claim details and transparent explainability reasons
    await expect(page.locator('h1')).toContainText('Vikram Malhotra');
    await expect(page.getByText('Why was this claim flagged?')).toBeVisible();
    await expect(page.getByText('Recent Policy Inception')).toBeVisible();
    await expect(page.getByText('Disproportionate Claim Amount')).toBeVisible();
    await expect(page.getByText('Shared Payment Entity')).toBeVisible();

    // 8. Verify Multi-Entity Relationship Graph is mounted
    await expect(page.getByText('Entity Connection Map')).toBeVisible();
    const reactFlowElement = page.locator('.react-flow');
    await expect(reactFlowElement).toBeVisible();

    // 9. Start investigation or reopen case if already completed
    const reopenBtn = page.getByRole('button', { name: 'Reopen Case' });
    const startInvBtn = page.locator('#btn-start-investigation');

    if (await reopenBtn.isVisible()) {
      await reopenBtn.click();
    } else if (await startInvBtn.isVisible()) {
      await startInvBtn.click();
    }
    await expect(page.getByText('Under Investigation').first()).toBeVisible();

    // 10. Add analytical case note
    const testNote = `Automated E2E Audit Note [${Date.now()}]: Flagged shared payout account ACCT-7890 connection with CLM-020.`;
    await page.locator('#input-investigation-note').fill(testNote);
    await page.locator('#btn-add-note').click();

    // 11. Assert note appears in the timeline
    await expect(page.locator('#investigation-notes-list')).toContainText(testNote);

    // 12. Reload page and assert persistence in MongoDB
    await page.reload();
    await expect(page.getByText('Under Investigation').first()).toBeVisible();
    await expect(page.locator('#investigation-notes-list')).toContainText(testNote);
  });
});
