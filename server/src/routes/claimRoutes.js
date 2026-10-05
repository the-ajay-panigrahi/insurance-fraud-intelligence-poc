const express = require("express");
const router = express.Router();
const Claim = require("../models/Claim");
const Provider = require("../models/Provider");
const Investigation = require("../models/Investigation");
const { analyzeRisk } = require("../riskEngine");
const { userAuth } = require("../auth");

// GET /api/dashboard - Summary stats and ranked claim queue
router.get("/dashboard", userAuth, async (req, res) => {
  try {
    const [allClaims, allProviders, allInvestigations] = await Promise.all([
      Claim.find().lean(),
      Provider.find().lean(),
      Investigation.find().lean(),
    ]);

    const investigationMap = new Map();
    allInvestigations.forEach((inv) => {
      investigationMap.set(inv.claimId, inv);
    });

    let highRiskCount = 0;
    let mediumRiskCount = 0;

    const scoredClaims = allClaims.map((claim) => {
      const risk = analyzeRisk(claim, allClaims, allProviders);
      if (risk.level === "HIGH") highRiskCount++;
      if (risk.level === "MEDIUM") mediumRiskCount++;

      const inv = investigationMap.get(claim.claimId);
      const investigationStatus = inv ? inv.status : "open";

      return {
        _id: claim._id,
        claimId: claim.claimId,
        customerId: claim.customerId,
        customerName: claim.customerName,
        policyType: claim.policyType,
        claimAmount: claim.claimAmount,
        policyCoverage: claim.policyCoverage,
        claimDate: claim.claimDate,
        providerId: claim.providerId,
        providerName: claim.providerName,
        paymentAccountId: claim.paymentAccountId,
        riskScore: risk.score,
        riskLevel: risk.level,
        riskLabel: risk.riskLabel,
        topReason: risk.topReason,
        investigationStatus,
      };
    });

    // Sort by risk score descending
    scoredClaims.sort((a, b) => b.riskScore - a.riskScore);

    const openInvestigations = allInvestigations.filter(
      (inv) => inv.status === "open" || inv.status === "under_investigation"
    ).length;

    const stats = {
      totalClaims: allClaims.length,
      highRisk: highRiskCount,
      mediumRisk: mediumRiskCount,
      lowRisk: allClaims.length - highRiskCount - mediumRiskCount,
      openInvestigations,
    };

    return res.status(200).json({ stats, claims: scoredClaims });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "Failed to load dashboard data." });
  }
});

// GET /api/claims/:claimId - Complete claim intelligence & investigation context
router.get("/claims/:claimId", userAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const [allClaims, allProviders] = await Promise.all([
      Claim.find().lean(),
      Provider.find().lean(),
    ]);

    const claim = allClaims.find((c) => c.claimId === claimId);
    if (!claim) {
      return res.status(404).json({ error: `Claim ${claimId} not found.` });
    }

    const risk = analyzeRisk(claim, allClaims, allProviders);

    // Customer filing history
    const customerHistory = allClaims
      .filter((c) => c.customerId === claim.customerId && c.claimId !== claim.claimId)
      .sort((a, b) => new Date(b.claimDate) - new Date(a.claimDate));

    // Provider profile & statistics
    const provider = allProviders.find((p) => p.providerId === claim.providerId) || {
      providerId: claim.providerId,
      name: claim.providerName,
      type: "general",
      averageClaimAmount: 0,
      claimCount: 0,
    };

    // Related claims sharing provider or payment account
    const relatedClaims = allClaims
      .filter(
        (c) =>
          c.claimId !== claim.claimId &&
          (c.providerId === claim.providerId || c.paymentAccountId === claim.paymentAccountId)
      )
      .map((c) => ({
        claimId: c.claimId,
        customerId: c.customerId,
        customerName: c.customerName,
        claimAmount: c.claimAmount,
        claimDate: c.claimDate,
        providerId: c.providerId,
        providerName: c.providerName,
        paymentAccountId: c.paymentAccountId,
        relationshipReason:
          c.paymentAccountId === claim.paymentAccountId && c.providerId === claim.providerId
            ? "Shared Provider & Payment Account"
            : c.paymentAccountId === claim.paymentAccountId
            ? "Shared Payment Account"
            : "Shared Provider",
      }));

    // Active or past investigation record
    const investigation = await Investigation.findOne({ claimId }).lean();

    return res.status(200).json({
      claim,
      risk,
      customerHistory,
      providerStats: provider,
      relatedClaims,
      investigation: investigation || {
        claimId,
        status: "open",
        notes: [],
        outcome: "",
      },
    });
  } catch (err) {
    console.error("Claim detail error:", err);
    return res.status(500).json({ error: "Failed to retrieve claim details." });
  }
});

// GET /api/claims/:claimId/relationships - Graph network representation
router.get("/claims/:claimId/relationships", userAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const allClaims = await Claim.find().lean();
    const claim = allClaims.find((c) => c.claimId === claimId);

    if (!claim) {
      return res.status(404).json({ error: `Claim ${claimId} not found.` });
    }

    const nodesMap = new Map();
    const edges = [];

    const addNode = (id, label, type, sublabel = "", isTarget = false, isSuspicious = false) => {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          type,
          data: {
            label,
            sublabel,
            type,
            isTarget,
            isSuspicious,
          },
        });
      }
    };

    const addEdge = (source, target, label, isAlert = false) => {
      const edgeId = `e-${source}-${target}-${label.replace(/\s+/g, "_")}`;
      if (!edges.some((e) => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source,
          target,
          label,
          animated: isAlert,
          style: {
            stroke: isAlert ? "#ef4444" : "#94a3b8",
            strokeWidth: isAlert ? 2.5 : 1.5,
          },
        });
      }
    };

    // 1. Target Claim & primary connections
    const targetClaimNodeId = `claim-${claim.claimId}`;
    const customerNodeId = `cust-${claim.customerId}`;
    const providerNodeId = `prov-${claim.providerId}`;
    const paymentNodeId = `acct-${claim.paymentAccountId}`;

    addNode(
      targetClaimNodeId,
      claim.claimId,
      "claim",
      `₹${claim.claimAmount.toLocaleString("en-IN")}`,
      true,
      true
    );
    addNode(customerNodeId, claim.customerName, "customer", claim.customerId);
    addNode(providerNodeId, claim.providerName, "provider", claim.providerId);
    addNode(paymentNodeId, claim.paymentAccountId, "payment", "Bank / Payout Acct");

    addEdge(customerNodeId, targetClaimNodeId, "Filed Claim");
    addEdge(targetClaimNodeId, providerNodeId, "Treated / Serviced");
    addEdge(targetClaimNodeId, paymentNodeId, "Payout Acct");

    // 2. Discover related claims sharing payment account (High suspicious ring indicator)
    const sharedAccountClaims = allClaims.filter(
      (c) => c.paymentAccountId === claim.paymentAccountId && c.claimId !== claim.claimId
    );

    sharedAccountClaims.forEach((relClaim) => {
      const relClaimNodeId = `claim-${relClaim.claimId}`;
      const relCustNodeId = `cust-${relClaim.customerId}`;

      addNode(
        relClaimNodeId,
        relClaim.claimId,
        "claim",
        `₹${relClaim.claimAmount.toLocaleString("en-IN")}`
      );
      addNode(relCustNodeId, relClaim.customerName, "customer", relClaim.customerId);

      addEdge(relCustNodeId, relClaimNodeId, "Filed Claim");
      addEdge(relClaimNodeId, paymentNodeId, "Shared Payout Acct", true);

      if (relClaim.providerId === claim.providerId) {
        addEdge(relClaimNodeId, providerNodeId, "Shared Provider", true);
      }
    });

    // 3. Other claims by the same provider (capped at 5 to keep graph clean and readable)
    const sameProviderClaims = allClaims
      .filter((c) => c.providerId === claim.providerId && c.claimId !== claim.claimId)
      .slice(0, 4);

    sameProviderClaims.forEach((relClaim) => {
      const relClaimNodeId = `claim-${relClaim.claimId}`;
      const relCustNodeId = `cust-${relClaim.customerId}`;

      addNode(
        relClaimNodeId,
        relClaim.claimId,
        "claim",
        `₹${relClaim.claimAmount.toLocaleString("en-IN")}`
      );
      addNode(relCustNodeId, relClaim.customerName, "customer", relClaim.customerId);

      addEdge(relCustNodeId, relClaimNodeId, "Filed Claim");
      addEdge(relClaimNodeId, providerNodeId, "Serviced By");
    });

    const nodes = Array.from(nodesMap.values());
    return res.status(200).json({ nodes, edges });
  } catch (err) {
    console.error("Relationships graph error:", err);
    return res.status(500).json({ error: "Failed to generate entity relationships." });
  }
});

module.exports = router;
