import React from "react";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, ShieldCheck } from "lucide-react";

export const StatusBadge = ({ status, type = "status" }) => {
  if (!status) return null;
  const normalized = status.toUpperCase().replace(/\s+/g, "_");

  // Risk Level Badges
  if (type === "risk") {
    switch (normalized) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap flex-shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            High Risk
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap flex-shrink-0">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            Medium Risk
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            Low Risk
          </span>
        );
    }
  }

  // Investigation Status Badges
  switch (normalized) {
    case "CONFIRMED_FRAUD":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 whitespace-nowrap flex-shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          Confirmed Fraud
        </span>
      );
    case "CLEARED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap flex-shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          Cleared
        </span>
      );
    case "UNDER_INVESTIGATION":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap flex-shrink-0 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          Under Investigation
        </span>
      );
    case "OPEN":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap flex-shrink-0">
          Open
        </span>
      );
  }
};

export default StatusBadge;
