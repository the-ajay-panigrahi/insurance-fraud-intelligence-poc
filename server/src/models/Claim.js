const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    policyId: {
      type: String,
      required: true,
    },
    policyStartDate: {
      type: Date,
      required: true,
    },
    policyType: {
      type: String,
      required: true,
      enum: ["auto", "health", "property", "life"],
    },
    policyCoverage: {
      type: Number,
      required: true,
    },
    claimDate: {
      type: Date,
      required: true,
    },
    claimAmount: {
      type: Number,
      required: true,
    },
    incidentType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    providerName: {
      type: String,
      required: true,
    },
    paymentAccountId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      default: "open",
      enum: ["open", "under_review", "approved", "denied"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);
