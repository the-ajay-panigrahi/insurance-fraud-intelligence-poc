const { test, expect } = require('@playwright/test');

test.describe('Insurance Fraud Intelligence & Investigation Platform', () => {

  // Helper function to log in as demo analyst before tests
  const loginAsAnalyst = async (page) => {
    await page.goto('/login');
    const demoBtn = page.locator('#btn-demo-account');
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();
    await page.locator('#btn-sign-in').click();
    await page.waitForURL('/');
  };

  test('Test 1: Authentication & Role Verification - Analyst logs in with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Insurance Fraud Intelligence/i);

    // Verify demo account button pre-fills credentials
    await page.locator('#btn-demo-account').click();
    await expect(page.locator('#email')).toHaveValue('analyst@demo-insurance.com');
    await expect(page.locator('#password')).toHaveValue('demo123');

    // Sign in and verify redirect to triage queue
    await page.locator('#btn-sign-in').click();
    await page.waitForURL('/');

    // Verify analyst identity is displayed in the navigation bar
    await expect(page.getByText('Maya Chen (Lead Fraud Analyst)')).toBeVisible();
    await expect(page.getByText('Claims Queue')).toBeVisible();
  });

  test('Test 2: Dashboard Triage Screening - Displays KPI stats and filters claims by risk tier', async ({ page }) => {
    await loginAsAnalyst(page);

    // 1. Verify KPI Summary Stat Cards
    await expect(page.getByText('Total Screened Claims')).toBeVisible();
    await expect(page.getByText('High Risk Claims', { exact: true })).toBeVisible();
    await expect(page.getByText('Medium Risk Claims', { exact: true })).toBeVisible();
    await expect(page.getByText('Active Case Files')).toBeVisible();

    // 2. Verify Filter Tabs and Row Filtering
    const allTab = page.getByRole('button', { name: /All \(/i });
    const highRiskTab = page.getByRole('button', { name: /High Risk \(/i });
    const mediumRiskTab = page.getByRole('button', { name: /Medium Risk \(/i });
    const lowRiskTab = page.getByRole('button', { name: /Low Risk \(/i });

    await expect(allTab).toBeVisible();
    await expect(highRiskTab).toBeVisible();

    // Filter by High Risk
    await highRiskTab.click();
    await expect(page.locator('[data-testid="claim-row-CLM-003"]')).toBeVisible();

    // Filter by Low Risk
    await lowRiskTab.click();
    await expect(page.locator('[data-testid="claim-row-CLM-001"]')).toBeVisible();
    await expect(page.locator('[data-testid="claim-row-CLM-003"]')).not.toBeVisible();

    // 3. Test Search Filtering
    await allTab.click();
    const searchInput = page.getByPlaceholder('Search claim, claimant, provider...');
    await searchInput.fill('Vikram Malhotra');
    await expect(page.locator('[data-testid="claim-row-CLM-003"]')).toBeVisible();
    await expect(page.locator('[data-testid="claim-row-CLM-001"]')).not.toBeVisible();
  });

  test('Test 3: Explainable Risk Intelligence - High-risk claim transparently breaks down all signals', async ({ page }) => {
    await loginAsAnalyst(page);

    // Open target high-risk claim CLM-003
    await page.locator('[data-testid="claim-row-CLM-003"]').click();
    await page.waitForURL('/claims/CLM-003');

    // Assert claimant and claim summary details
    await expect(page.locator('h1')).toContainText('Vikram Malhotra');
    await expect(page.getByText('Why was this claim flagged?')).toBeVisible();

    // Verify all 5 deterministic suspicious indicators are transparently evaluated
    await expect(page.getByText('Recent Policy Inception')).toBeVisible();
    await expect(page.getByText('Disproportionate Claim Amount')).toBeVisible();
    await expect(page.getByText('Frequent Claimant History')).toBeVisible();
    await expect(page.getByText('Provider Billing Outlier')).toBeVisible();
    await expect(page.getByText('Shared Payment Entity')).toBeVisible();

    // Verify servicing provider section heading is cleanly formatted
    await expect(page.getByText('Servicing Provider Profile')).toBeVisible();
    await expect(page.getByText('Auto Collision & Repair Facility')).toBeVisible();
  });

  test('Test 4: Multi-Entity Fraud Ring Visualizer - Graph renders connected claimants and shared bank accounts', async ({ page }) => {
    await loginAsAnalyst(page);
    await page.goto('/claims/CLM-003');

    // Verify graph container is mounted
    await expect(page.getByText('Entity Connection Map (Fraud Ring Visualizer)')).toBeVisible();
    const reactFlowElement = page.locator('.react-flow');
    await expect(reactFlowElement).toBeVisible();

    // Verify connected claims sharing the bank account or garage are listed
    await expect(page.getByText('Linked Claims (Shared Account or Provider)')).toBeVisible();
    await expect(page.getByText('Sunita Verma').first()).toBeVisible();
    await expect(page.getByText('Arjun Kapoor').first()).toBeVisible();
  });

  test('Test 5: Investigator Case Actions - Analyst updates case status, adds audit note, and verifies MongoDB persistence', async ({ page }) => {
    await loginAsAnalyst(page);
    await page.goto('/claims/CLM-003');

    // Start or reopen investigation if needed
    const reopenBtn = page.getByRole('button', { name: 'Reopen Case' });
    const startInvBtn = page.locator('#btn-start-investigation');

    if (await reopenBtn.isVisible()) {
      await reopenBtn.click();
    } else if (await startInvBtn.isVisible()) {
      await startInvBtn.click();
    }

    // Verify status updates to Under Investigation
    await expect(page.getByText('Under Investigation').first()).toBeVisible();

    // Enter and submit a realistic forensic investigator note
    const auditNote = `SIU Audit Record [${Date.now()}]: Verified Western Express Highway toll booth telemetry. FastFix flatbed tow truck crossed Dahisar toll 3 hours prior to reported crash time. Staged accident confirmed.`;
    await page.locator('#input-investigation-note').fill(auditNote);
    await page.locator('#btn-add-note').click();

    // Assert note is immediately visible in the activity timeline
    await expect(page.locator('#investigation-notes-list')).toContainText(auditNote);

    // Reload the page from MongoDB and verify full persistence
    await page.reload();
    await expect(page.getByText('Under Investigation').first()).toBeVisible();
    await expect(page.locator('#investigation-notes-list')).toContainText(auditNote);
  });

  test('Test 6: False Positive Control - Legitimate high-value surgical claim is cleared as Low Risk', async ({ page }) => {
    await loginAsAnalyst(page);

    // Open legitimate high-value claim CLM-030 (Dr. Arvind Nambiar, ₹11,50,000 heart surgery)
    await page.goto('/claims/CLM-030');

    // Verify claimant identity
    await expect(page.locator('h1')).toContainText('Dr. Arvind Nambiar');

    // Verify sum insured is high but risk score remains low (<40)
    await expect(page.getByText('₹11,50,000').first()).toBeVisible();
    await expect(page.getByText('Low Risk', { exact: true }).first()).toBeVisible();

    // Verify provider is accredited hospital
    await expect(page.getByText('Metro General Super-Specialty Hospital').first()).toBeVisible();
    await expect(page.getByText('Multi-Specialty Hospital')).toBeVisible();
  });

});
