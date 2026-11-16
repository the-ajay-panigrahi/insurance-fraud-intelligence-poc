const { test } = require("@playwright/test");
const assert = require("node:assert/strict");
const claim = (id, name, score, level) => ({
  claimId: id,
  customerId: "CUST-" + id,
  customerName: name,
  providerId: "PROV-001",
  providerName: "Sample Auto Centre",
  paymentAccountId: "ACC-001",
  policyType: "auto",
  claimAmount: 240000,
  policyCoverage: 500000,
  policyStartDate: "2026-10-01",
  claimDate: "2026-10-05",
  incidentType: "collision",
  description:
    "Synthetic test claim for investigating shared provider and payout relationships.",
  riskScore: score,
  riskLevel: level,
  topReason: level === "HIGH" ? "Shared Payment Entity" : "Standard Processing",
  investigationStatus: "open",
});
const claims = [
  claim("CLM-003", "Vikram Malhotra", 85, "HIGH"),
  claim("CLM-002", "Sample Claimant", 50, "MEDIUM"),
  claim("CLM-001", "Asha Rao", 10, "LOW"),
];
const signals = [
  "Recent Policy Inception",
  "Disproportionate Claim Amount",
  "Frequent Claimant History",
  "Provider Billing Outlier",
  "Shared Payment Entity",
].map((name, i) => ({
  id: String(i),
  name,
  triggered: i !== 2,
  points: 20,
  explanation: "Synthetic rule explanation for this interface check.",
}));
test("redesigned investigation workflows with isolated API records", async ({
  page,
}) => {
  let signedIn = false;
  let inv = { status: "open", notes: [], outcome: "" };
  const user = {
    name: "Maya Chen",
    email: "analyst@demo-insurance.com",
    role: "analyst",
  };
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let status = 200,
      data = {};
    const body = route.request().postDataJSON();
    if (path.endsWith("/auth/me")) {
      status = signedIn ? 200 : 401;
      data = signedIn ? { user } : { error: "Unauthenticated" };
    } else if (path.endsWith("/auth/login")) {
      signedIn = body.password === "demo123";
      status = signedIn ? 200 : 401;
      data = signedIn ? { user } : { error: "Invalid credentials" };
    } else if (path.endsWith("/auth/logout")) signedIn = false;
    else if (path.endsWith("/dashboard"))
      data = {
        stats: {
          totalClaims: 3,
          highRisk: 1,
          mediumRisk: 1,
          lowRisk: 1,
          openInvestigations: 3,
        },
        claims,
      };
    else if (path.includes("/investigations/")) {
      if (body.note)
        inv.notes.push({
          text: body.note,
          author: user.name,
          createdAt: new Date().toISOString(),
        });
      if (body.status)
        inv = { ...inv, status: body.status, outcome: body.outcome || "" };
      data = { investigation: inv };
    } else if (path.endsWith("/relationships"))
      data = {
        nodes: [
          {
            id: "claim-1",
            type: "claim",
            data: {
              type: "claim",
              label: "CLM-003",
              sublabel: "₹2,40,000",
              isTarget: true,
            },
          },
          {
            id: "customer-1",
            type: "customer",
            data: {
              type: "customer",
              label: "Vikram Malhotra",
              sublabel: "CUST-003",
            },
          },
          {
            id: "payment-1",
            type: "payment",
            data: {
              type: "payment",
              label: "ACC-001",
              sublabel: "Payout account",
            },
          },
        ],
        edges: [
          {
            id: "e1",
            source: "customer-1",
            target: "claim-1",
            label: "Filed Claim",
          },
          {
            id: "e2",
            source: "claim-1",
            target: "payment-1",
            label: "Payout",
            animated: true,
          },
        ],
      };
    else if (path.includes("/claims/"))
      data = {
        claim: claims[0],
        risk: { score: 85, level: "HIGH", signals },
        customerHistory: [],
        providerStats: {
          type: "repair_shop",
          name: "Sample Auto Centre",
          averageClaimAmount: 180000,
          claimCount: 5,
        },
        relatedClaims: [
          { ...claims[1], relationshipReason: "Shared payout account" },
        ],
        investigation: inv,
      };
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#btn-demo-account").click();
  assert.equal(await page.locator("#email").inputValue(), user.email);
  await page.locator("#password").fill("wrong");
  await page.locator("#btn-sign-in").click();
  await page.getByText("Invalid credentials", { exact: true }).waitFor();
  await page.locator("#btn-demo-account").click();
  await page.locator("#btn-sign-in").click();
  await page.locator('[data-testid="claim-row-CLM-003"]').waitFor();
  await page
    .getByRole("button", { name: "High Risk (1)", exact: true })
    .click();
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByRole("button", { name: "All (3)", exact: true }).click();
  await page
    .getByPlaceholder("Search claim, claimant, provider...")
    .fill("Asha");
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByPlaceholder("Search claim, claimant, provider...").fill("");
  await page
    .locator('[data-testid="claim-row-CLM-003"]')
    .getByRole("button", { name: "Inspect" })
    .click();
  await page
    .getByText("Why was this claim flagged?", { exact: true })
    .waitFor();
  await page.locator(".react-flow__node").first().waitFor();
  assert.equal(await page.locator(".react-flow__node").count(), 3);
  await page.locator(".react-flow__controls-zoomin").click();
  await page
    .locator("#input-investigation-note")
    .fill("Sample note from isolated UI test.");
  await page.locator("#btn-add-note").click();
  await page
    .getByText("Sample note from isolated UI test.", { exact: true })
    .waitFor();
  await page.reload();
  await page
    .getByText("Sample note from isolated UI test.", { exact: true })
    .waitFor();
  await page.locator("#btn-start-investigation").click();
  await page.locator("#btn-clear-claim").click();
  await page
    .getByPlaceholder(
      "Enter justification (e.g. verified surveillance footage, confirmed shared account ring...)",
    )
    .fill("Synthetic test clearance.");
  await page.getByRole("button", { name: "Confirm Decision" }).click();
  await page.getByRole("button", { name: "Reopen Case" }).waitFor();
  await page.getByRole("button", { name: "Reopen Case" }).click();
  await page.locator("#btn-confirm-fraud").click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "detail overflow " + width,
    );
    await page.getByRole("link", { name: "Back to Triage Queue" }).click();
    await page.locator('[data-testid="claim-row-CLM-003"]').waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "dashboard overflow " + width,
    );
    await page
      .locator('[data-testid="claim-row-CLM-003"]')
      .getByRole("button", { name: "Inspect" })
      .click();
  }
  await page.locator("#btn-sign-out").click();
  await page.locator("#btn-demo-account").waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "Passed: auth errors/demo/login/logout, search/risk filters, details, React Flow nodes/zoom, notes/reload, investigation/decision/reopen/cancel, responsive layouts. All APIs mocked; no real records touched.",
  );
});
