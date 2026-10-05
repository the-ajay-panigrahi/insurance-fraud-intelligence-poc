/**
 * Deterministic Risk Engine for Insurance Fraud Intelligence POC
 * Evaluates 5 suspicious indicators. All scores represent risk signals only,
 * never an automated verdict of fraud.
 */

function analyzeRisk(claim, allClaims = [], providers = []) {
  const claimDate = new Date(claim.claimDate);
  const policyStartDate = new Date(claim.policyStartDate);

  // 1. Recent Policy: Inception within 90 days of incident
  const diffDays = Math.max(0, Math.floor((claimDate - policyStartDate) / (1000 * 60 * 60 * 24)));
  const recentPolicyTriggered = diffDays <= 90;
  const recentPolicySignal = {
    id: "recent_policy",
    name: "Recent Policy Inception",
    triggered: recentPolicyTriggered,
    points: recentPolicyTriggered ? 15 : 0,
    weight: 15,
    explanation: recentPolicyTriggered
      ? `Claim filed only ${diffDays} days after policy inception (threshold: <= 90 days)`
      : `Policy active for ${diffDays} days prior to incident (within normal bounds)`,
  };

  // 2. High Claim Amount: >= 70% of policy coverage OR >= 2.2x system baseline
  const totalProviderAmounts = providers.reduce((acc, p) => acc + (p.averageClaimAmount || 0), 0);
  const systemAvg = providers.length > 0 ? totalProviderAmounts / providers.length : 150000;
  const provider = providers.find((p) => p.providerId === claim.providerId);
  const providerAvg = provider?.averageClaimAmount || systemAvg;
  const coverageRatio = claim.policyCoverage > 0 ? claim.claimAmount / claim.policyCoverage : 0;
  const systemRatio = systemAvg > 0 ? claim.claimAmount / systemAvg : 1;
  const highClaimTriggered = coverageRatio >= 0.70 || systemRatio >= 2.2;
  const highClaimSignal = {
    id: "high_claim_amount",
    name: "Disproportionate Claim Amount",
    triggered: highClaimTriggered,
    points: highClaimTriggered ? 20 : 0,
    weight: 20,
    explanation: highClaimTriggered
      ? `Claim (₹${claim.claimAmount.toLocaleString("en-IN")}) is ${(coverageRatio * 100).toFixed(0)}% of policy coverage (${systemRatio.toFixed(1)}x system benchmark)`
      : `Claim amount is within standard coverage and provider baseline`,
  };

  // 3. Repeated Claims: Same customer has >= 3 claims in last 12 months
  const oneYearPrior = new Date(claimDate);
  oneYearPrior.setFullYear(oneYearPrior.getFullYear() - 1);
  const customerPastClaims = allClaims.filter(
    (c) =>
      c.customerId === claim.customerId &&
      new Date(c.claimDate) <= claimDate &&
      new Date(c.claimDate) >= oneYearPrior
  );
  const repeatedTriggered = customerPastClaims.length >= 3;
  const repeatedSignal = {
    id: "repeated_claims",
    name: "Frequent Claimant History",
    triggered: repeatedTriggered,
    points: repeatedTriggered ? 20 : 0,
    weight: 20,
    explanation: repeatedTriggered
      ? `Customer filed ${customerPastClaims.length} claims within a 12-month period (threshold: >= 3)`
      : `Claimant has ${customerPastClaims.length} claim(s) in the past 12 months`,
  };

  // 4. Provider Anomaly: Provider average claim > 1.5x system-wide average
  const providerAnomalyTriggered = providerAvg > 1.5 * systemAvg;
  const providerSignal = {
    id: "provider_anomaly",
    name: "Provider Billing Outlier",
    triggered: providerAnomalyTriggered,
    points: providerAnomalyTriggered ? 20 : 0,
    weight: 20,
    explanation: providerAnomalyTriggered
      ? `Provider avg billing (₹${Math.round(providerAvg).toLocaleString("en-IN")}) is ${(providerAvg / systemAvg).toFixed(1)}x system baseline`
      : `Provider billing pattern aligns with regional benchmark`,
  };

  // 5. Shared Entity: Same payment account used by a different customer
  const sharedAccountClaims = allClaims.filter(
    (c) => c.paymentAccountId === claim.paymentAccountId && c.customerId !== claim.customerId
  );
  const sharedEntityTriggered = sharedAccountClaims.length > 0;
  const otherCustomerIds = [...new Set(sharedAccountClaims.map((c) => c.customerId))];
  const sharedSignal = {
    id: "shared_entity",
    name: "Shared Payment Entity",
    triggered: sharedEntityTriggered,
    points: sharedEntityTriggered ? 25 : 0,
    weight: 25,
    explanation: sharedEntityTriggered
      ? `Payment account (${claim.paymentAccountId}) is linked to ${otherCustomerIds.length} other claimant(s): ${otherCustomerIds.join(", ")}`
      : `Payment account is uniquely linked to this claimant`,
  };

  const signals = [
    recentPolicySignal,
    highClaimSignal,
    repeatedSignal,
    providerSignal,
    sharedSignal,
  ];

  const rawScore = signals.reduce((sum, s) => sum + s.points, 0);
  const score = Math.min(100, Math.max(0, rawScore));

  const level = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const riskLabel =
    score >= 70
      ? "High Risk — Investigation Recommended"
      : score >= 40
      ? "Medium Risk — Review Recommended"
      : "Low Risk — Standard Processing";

  const triggeredSignals = signals.filter((s) => s.triggered).sort((a, b) => b.points - a.points);
  const topReason = triggeredSignals.length > 0 ? triggeredSignals[0].explanation : "Standard low-risk claim profile";

  return {
    score,
    level,
    riskLabel,
    topReason,
    signals,
    isSuspicious: score >= 40,
    evaluatedAt: new Date().toISOString(),
  };
}

module.exports = {
  analyzeRisk,
};
