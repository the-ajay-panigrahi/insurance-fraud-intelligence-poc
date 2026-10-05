import React from "react";

export const RiskIndicator = ({ score, size = "md", showLabel = false }) => {
  const getColors = () => {
    if (score >= 70) {
      return {
        bg: "bg-rose-50",
        border: "border-rose-300",
        text: "text-rose-700",
        ring: "ring-rose-500/20",
        label: "High Risk — Investigation Recommended",
        badgeBg: "bg-rose-600",
      };
    }
    if (score >= 40) {
      return {
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-700",
        ring: "ring-amber-500/20",
        label: "Medium Risk — Review Recommended",
        badgeBg: "bg-amber-500",
      };
    }
    return {
      bg: "bg-emerald-50",
      border: "border-emerald-300",
      text: "text-emerald-700",
      ring: "ring-emerald-500/20",
      label: "Low Risk — Standard Processing",
      badgeBg: "bg-emerald-500",
    };
  };

  const colors = getColors();

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          {score}
        </span>
        {showLabel && (
          <span className={`text-xs font-semibold ${colors.text}`}>{score >= 70 ? "High" : score >= 40 ? "Medium" : "Low"}</span>
        )}
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className="flex items-center gap-4">
        <div
          className={`relative flex items-center justify-center w-20 h-20 rounded-2xl ${colors.bg} border-2 ${colors.border} shadow-sm ring-4 ${colors.ring}`}
        >
          <div className="text-center">
            <span className={`text-2xl font-extrabold tracking-tight ${colors.text}`}>{score}</span>
            <span className="block text-[10px] uppercase font-bold text-slate-400">/ 100</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors.badgeBg}`} />
            <h3 className={`text-lg font-bold ${colors.text}`}>{colors.label}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic rule score based on 5 suspicious indicator signals
          </p>
        </div>
      </div>
    );
  }

  // Default md size
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-sm ${colors.bg} ${colors.text} border ${colors.border}`}
      >
        {score}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${colors.text}`}>{colors.label}</span>
      )}
    </div>
  );
};

export default RiskIndicator;
