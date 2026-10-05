const express = require("express");
const router = express.Router();
const Investigation = require("../models/Investigation");
const { userAuth } = require("../auth");

// PATCH /api/investigations/:claimId - Update status, add note, or record outcome
router.patch("/:claimId", userAuth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, note, outcome } = req.body;

    let investigation = await Investigation.findOne({ claimId });
    if (!investigation) {
      investigation = new Investigation({
        claimId,
        status: status || "open",
        notes: [],
        outcome: outcome || "",
      });
    }

    if (status) {
      investigation.status = status;
    }

    if (outcome !== undefined) {
      investigation.outcome = outcome;
    }

    if (note && typeof note === "string" && note.trim().length > 0) {
      investigation.notes.push({
        text: note.trim(),
        author: req.user?.name || "Fraud Analyst",
        createdAt: new Date(),
      });
    }

    investigation.updatedAt = new Date();
    await investigation.save();

    return res.status(200).json({
      message: "Investigation updated successfully",
      investigation,
    });
  } catch (err) {
    console.error("Investigation update error:", err);
    return res.status(500).json({ error: "Failed to update investigation." });
  }
});

module.exports = router;
