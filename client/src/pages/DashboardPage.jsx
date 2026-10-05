import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { claimsAPI } from "../api";
import StatusBadge from "../components/StatusBadge";
import RiskIndicator from "../components/RiskIndicator";
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const DashboardPage = () => {
  const [data, setData] = useState({ stats: {}, claims: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await claimsAPI.getDashboard();
      setData(res);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = (data.claims || []).filter((claim) => {
    const matchesFilter =
      selectedFilter === "ALL" ||
      claim.riskLevel === selectedFilter ||
      (selectedFilter === "INVESTIGATION" &&
        (claim.investigationStatus === "open" || claim.investigationStatus === "under_investigation"));

    const query = search.toLowerCase().trim();
    const matchesSearch =
      !query ||
      claim.claimId.toLowerCase().includes(query) ||
      claim.customerName.toLowerCase().includes(query) ||
      claim.providerName.toLowerCase().includes(query) ||
      claim.paymentAccountId.toLowerCase().includes(query) ||
      claim.topReason.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Running fraud screening engine...</p>
      </div>
    );
  }

  const { stats = {} } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title & Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Claims Risk Screening & Triage
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated intelligence triage ranking claims based on multi-entity suspicious indicators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Triage Stream
          </span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Screened Claims
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalClaims || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">100% evaluated via rules</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              High Risk
            </p>
            <p className="text-2xl font-extrabold text-rose-700 mt-1">
              {stats.highRisk || 0}
            </p>
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              Investigation Recommended
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Medium Risk
            </p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">
              {stats.mediumRisk || 0}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Review Recommended</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Active Investigations
            </p>
            <p className="text-2xl font-extrabold text-blue-700 mt-1">
              {stats.openInvestigations || 0}
            </p>
            <p className="text-[11px] text-blue-500 font-medium mt-1">Open / Under Review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {[
            { id: "ALL", label: `All (${data.claims?.length || 0})` },
            { id: "HIGH", label: `High Risk (${stats.highRisk || 0})` },
            { id: "MEDIUM", label: `Medium Risk (${stats.mediumRisk || 0})` },
            { id: "LOW", label: "Low Risk" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search claim, claimant, provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Triage Claims Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Claimant</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Primary Suspicious Indicator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No claims match your current filter and search criteria.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr
                    key={claim.claimId}
                    data-testid={`claim-row-${claim.claimId}`}
                    onClick={() => navigate(`/claims/${claim.claimId}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono whitespace-nowrap">
                      {claim.claimId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{claim.customerName}</div>
                      <div className="text-[10px] text-slate-400">{claim.customerId}</div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px]">
                        {claim.policyType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      ₹{claim.claimAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <RiskIndicator score={claim.riskScore} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={claim.riskLevel} type="risk" />
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-slate-600 text-[11px] font-medium" title={claim.topReason}>
                        {claim.topReason}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={claim.investigationStatus} type="status" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/claims/${claim.claimId}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-600 group-hover:bg-rose-50 transition-colors"
                      >
                        Inspect
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
