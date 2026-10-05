import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { claimsAPI, investigationAPI } from "../api";
import StatusBadge from "../components/StatusBadge";
import RiskIndicator from "../components/RiskIndicator";
import RelationshipGraph from "../components/RelationshipGraph";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Building2,
  User,
  CreditCard,
  Calendar,
  FileText,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

export const ClaimDetailPage = () => {
  const { claimId } = useParams();
  const [data, setData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [outcomeModal, setOutcomeModal] = useState(null); // 'cleared' | 'confirmed_fraud' | null
  const [outcomeText, setOutcomeText] = useState("");

  useEffect(() => {
    loadClaimData();
  }, [claimId]);

  const loadClaimData = async () => {
    try {
      setLoading(true);
      const [claimRes, graphRes] = await Promise.all([
        claimsAPI.getClaim(claimId),
        claimsAPI.getRelationships(claimId),
      ]);
      setData(claimRes);
      setGraphData(graphRes);
    } catch (err) {
      console.error("Error loading claim details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status, outcome = "") => {
    try {
      setActionLoading(true);
      const res = await investigationAPI.update(claimId, { status, outcome });
      setData((prev) => ({
        ...prev,
        investigation: res.investigation,
      }));
      setOutcomeModal(null);
      setOutcomeText("");
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update investigation status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e?.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSubmittingNote(true);
      const res = await investigationAPI.update(claimId, { note: newNote.trim() });
      setData((prev) => ({
        ...prev,
        investigation: res.investigation,
      }));
      setNewNote("");
    } catch (err) {
      console.error("Failed to add note:", err);
      alert("Failed to submit investigation note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading claim intelligence & relationships...</p>
      </div>
    );
  }

  if (!data?.claim) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Claim not found</h2>
        <Link to="/" className="text-rose-600 text-sm hover:underline mt-2 inline-block">
          Return to dashboard
        </Link>
      </div>
    );
  }

  const { claim, risk, customerHistory = [], providerStats, relatedClaims = [], investigation } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Triage Queue
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Claim Ref:</span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            {claim.claimId}
          </span>
        </div>
      </div>

      {/* Main Header / Risk Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Claim Intelligence File
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-indigo-600 capitalize">
              {claim.policyType} Insurance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {claim.customerName}{" "}
            <span className="text-slate-400 font-normal text-base">({claim.customerId})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {claim.description}
          </p>
        </div>

        {/* Risk Score Indicator */}
        <div className="flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-8">
          <RiskIndicator score={risk.score} size="lg" />
        </div>
      </div>

      {/* Section 1: Why Was This Claim Flagged? (Explainability Breakdown) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Why was this claim flagged?</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent evaluation of all 5 deterministic suspicious indicators
            </p>
          </div>
          <StatusBadge status={risk.level} type="risk" />
        </div>

        <div className="divide-y divide-slate-100">
          {risk.signals.map((signal) => (
            <div
              key={signal.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                signal.triggered ? "bg-rose-50/20" : "bg-white"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {signal.triggered ? (
                  <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold ${
                      signal.triggered ? "text-rose-900" : "text-slate-700"
                    }`}
                  >
                    {signal.name}
                  </h4>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      signal.triggered
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {signal.triggered ? `+${signal.points} pts` : "0 pts"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {signal.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Layout: Details on Left, Graph on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Claim, History, Provider, Related (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Claim & Policy Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Claim & Policy Profile
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Claim Amount</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{claim.claimAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Policy Coverage</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{claim.policyCoverage.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Policy Start Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(claim.policyStartDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Incident Date</span>
                <span className="font-semibold text-slate-800">
                  {new Date(claim.claimDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Incident Type</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {claim.incidentType.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Payout Account</span>
                <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {claim.paymentAccountId}
                </span>
              </div>
            </div>
          </div>

          {/* Provider Stats Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Billing Provider Profile
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                {providerStats?.type || "Provider"}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="font-bold text-slate-900 text-xs">{providerStats?.name}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Average Claim Bill</span>
                  <span className="font-semibold text-slate-800">
                    ₹{Math.round(providerStats?.averageClaimAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Claims Serviced</span>
                  <span className="font-semibold text-slate-800">{providerStats?.claimCount} total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Claimant Historical Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Prior Filing History ({customerHistory.length})
            </h3>
            {customerHistory.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No previous claims filed by this customer.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {customerHistory.map((past) => (
                  <div
                    key={past.claimId}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800 mr-2">{past.claimId}</span>
                      <span className="capitalize text-slate-600">{past.incidentType.replace(/_/g, " ")}</span>
                      <span className="text-slate-400 block text-[10px]">
                        {new Date(past.claimDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900 block">
                        ₹{past.claimAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {past.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coordinated / Related Claims */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-600" />
              Coordinated Network Connections ({relatedClaims.length})
            </h3>
            {relatedClaims.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No claims share provider or payment entities.</p>
            ) : (
              <div className="space-y-2">
                {relatedClaims.map((rel) => (
                  <div
                    key={rel.claimId}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/claims/${rel.claimId}`}
                          className="font-mono font-bold text-rose-700 hover:underline"
                        >
                          {rel.claimId}
                        </Link>
                        <span className="font-medium text-slate-800">{rel.customerName}</span>
                      </div>
                      <span className="text-rose-600 text-[10px] font-semibold mt-0.5 block">
                        {rel.relationshipReason}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900 block">
                        ₹{rel.claimAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rel.claimDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Relationship Graph Network (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Multi-Entity Relationship Graph</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive network revealing shared bank accounts and providers across claimants
                </p>
              </div>
            </div>
            <RelationshipGraph nodes={graphData.nodes} edges={graphData.edges} />
          </div>
        </div>
      </div>

      {/* Section 2: Human Investigation Panel & Case Management */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Human Investigation & Case File</h2>
              <StatusBadge status={investigation?.status || "open"} type="status" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated signals inform; human investigators decide and confirm case outcomes.
            </p>
          </div>

          {/* Action Decision Buttons */}
          <div className="flex items-center gap-2">
            {(!investigation || investigation.status === "open") && (
              <button
                id="btn-start-investigation"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("under_investigation")}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5" />
                Start Investigation
              </button>
            )}

            {investigation?.status === "under_investigation" && (
              <>
                <button
                  id="btn-clear-claim"
                  disabled={actionLoading}
                  onClick={() => setOutcomeModal("cleared")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Clear Claim
                </button>
                <button
                  id="btn-confirm-fraud"
                  disabled={actionLoading}
                  onClick={() => setOutcomeModal("confirmed_fraud")}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Confirm Fraud
                </button>
              </>
            )}

            {(investigation?.status === "cleared" || investigation?.status === "confirmed_fraud") && (
              <button
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("under_investigation")}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all"
              >
                Reopen Case
              </button>
            )}
          </div>
        </div>

        {/* Outcome Banner (if resolved) */}
        {investigation?.outcome && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              investigation.status === "confirmed_fraud"
                ? "bg-red-50 border-red-200 text-red-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            {investigation.status === "confirmed_fraud" ? (
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">
                Case Decision Recorded: {investigation.status.replace(/_/g, " ")}
              </p>
              <p className="text-xs mt-1 leading-relaxed">{investigation.outcome}</p>
            </div>
          </div>
        )}

        {/* Modal / Dialog for Recording Outcome */}
        {outcomeModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {outcomeModal === "confirmed_fraud" ? "Confirm Case as Fraud" : "Clear Claim"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Provide an explicit reason or evidence summary for this final determination.
              </p>
              <textarea
                rows={3}
                value={outcomeText}
                onChange={(e) => setOutcomeText(e.target.value)}
                placeholder="Enter justification (e.g. verified surveillance footage, confirmed shared account ring...)"
                className="w-full mt-3 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setOutcomeModal(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(outcomeModal, outcomeText)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white ${
                    outcomeModal === "confirmed_fraud"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Add Case Note
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="input-investigation-note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record analytical observation, phone call result, or document request..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              id="btn-add-note"
              disabled={submittingNote || !newNote.trim()}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Add Note
            </button>
          </div>
        </form>

        {/* Case Timeline */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Investigation Activity Timeline ({investigation?.notes?.length || 0})
          </h4>
          {(!investigation?.notes || investigation.notes.length === 0) ? (
            <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
          ) : (
            <div className="space-y-3" id="investigation-notes-list">
              {investigation.notes.map((note, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-semibold text-slate-700">{note.author}</span>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailPage;
