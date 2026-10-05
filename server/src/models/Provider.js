const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    providerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["hospital", "repair_shop", "clinic", "contractor", "other"],
    },
    averageClaimAmount: {
      type: Number,
      default: 0,
    },
    claimCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Provider", providerSchema);
