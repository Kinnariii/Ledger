/**
 * CRM Opportunities Pipeline — Ledger
 * =====================================
 * Kanban-style pipeline view showing opportunities across 5 stages.
 * Each card shows contact, value (₹ Indian numbering), AI score badge,
 * and AI next-best-action when available.
 *
 * Demo data: 6 opportunities from Tenant A seed.
 */
"use client";

import { Target, Sparkles, TrendingUp } from "lucide-react";

/* ─── Indian Number Formatting ─────────────────────────────────────────── */
function formatINR(amount: number): string {
  const s = amount.toString();
  // Split into last 3 digits and remaining groups of 2
  if (s.length <= 3) return `₹${s}`;
  const last3 = s.slice(-3);
  const remaining = s.slice(0, -3);
  const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `₹${grouped},${last3}`;
}

/* ─── Types ────────────────────────────────────────────────────────────── */
type Stage = "NEW" | "QUALIFIED" | "PROPOSAL" | "WON" | "LOST";

interface Opportunity {
  title: string;
  contact: string;
  stage: Stage;
  value: number;
  aiScore: number;
  aiNextBestAction: string | null;
}

/* ─── Hardcoded Demo Data ──────────────────────────────────────────────── */
const opportunities: Opportunity[] = [
  {
    title: "AI Chatbot for TechStartup.in",
    contact: "Rahul Sharma",
    stage: "QUALIFIED",
    value: 45000,
    aiScore: 85,
    aiNextBestAction:
      "Schedule a live demo showing WhatsApp integration capabilities.",
  },
  {
    title: "Enterprise CRM Integration for GrowthCo",
    contact: "Priya Mehta",
    stage: "PROPOSAL",
    value: 125000,
    aiScore: 92,
    aiNextBestAction:
      "Send revised proposal with updated pricing tier for 50+ users.",
  },
  {
    title: "Inventory AI for RetailChain",
    contact: "Aditya Kumar",
    stage: "NEW",
    value: 30000,
    aiScore: 55,
    aiNextBestAction: null,
  },
  {
    title: "Patient Triage AI for HealthTech",
    contact: "Sneha Reddy",
    stage: "WON",
    value: 85000,
    aiScore: 98,
    aiNextBestAction:
      "Begin implementation kickoff. Schedule onboarding call.",
  },
  {
    title: "Route Optimization ML for LogisticsPro",
    contact: "Vikram Singh",
    stage: "LOST",
    value: 60000,
    aiScore: 40,
    aiNextBestAction: "Follow up in Q3 when budget cycle resets.",
  },
  {
    title: "AI Tutoring Platform for EduPlatform",
    contact: "Meera Joshi",
    stage: "QUALIFIED",
    value: 55000,
    aiScore: 78,
    aiNextBestAction: null,
  },
];

/* ─── Stage Configuration ──────────────────────────────────────────────── */
const stages: { key: Stage; label: string; color: string; bgTint: string }[] = [
  {
    key: "NEW",
    label: "NEW",
    color: "text-outline border-outline",
    bgTint: "bg-surface-container-low",
  },
  {
    key: "QUALIFIED",
    label: "QUALIFIED",
    color: "text-primary-container border-primary-container",
    bgTint: "bg-primary-fixed/10",
  },
  {
    key: "PROPOSAL",
    label: "PROPOSAL",
    color: "text-on-tertiary-container border-on-tertiary-container",
    bgTint: "bg-tertiary-fixed/10",
  },
  {
    key: "WON",
    label: "WON",
    color: "text-secondary border-secondary",
    bgTint: "bg-secondary-fixed/10",
  },
  {
    key: "LOST",
    label: "LOST",
    color: "text-error border-error",
    bgTint: "bg-error-container/10",
  },
];

/* ─── AI Score Badge ───────────────────────────────────────────────────── */
function scoreBadgeClasses(score: number): string {
  if (score >= 80) return "text-secondary border-secondary";
  if (score >= 60) return "text-on-tertiary-container border-on-tertiary-container";
  return "text-outline border-outline";
}

/* ─── Component ────────────────────────────────────────────────────────── */
export default function OpportunitiesPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-stamp-label text-on-surface-variant mb-2">
          CRM · PIPELINE
        </div>
        <h1 className="text-headline-md text-on-surface">Opportunities</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          6 opportunities across your pipeline
        </p>
      </div>

      {/* Pipeline Summary Row */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp
            className="w-4 h-4 text-primary-container"
            strokeWidth={1.5}
          />
          <span className="text-utility-mono text-on-surface-variant">
            TOTAL PIPELINE
          </span>
          <span className="text-utility-mono text-on-surface">
            {formatINR(
              opportunities
                .filter((o) => o.stage !== "LOST")
                .reduce((sum, o) => sum + o.value, 0)
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target
            className="w-4 h-4 text-secondary"
            strokeWidth={1.5}
          />
          <span className="text-utility-mono text-on-surface-variant">
            WON
          </span>
          <span className="text-utility-mono text-secondary">
            {formatINR(
              opportunities
                .filter((o) => o.stage === "WON")
                .reduce((sum, o) => sum + o.value, 0)
            )}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageOpps = opportunities.filter(
            (o) => o.stage === stage.key
          );
          const stageTotal = stageOpps.reduce((sum, o) => sum + o.value, 0);

          return (
            <div
              key={stage.key}
              className="min-w-[220px] flex-1 flex flex-col"
            >
              {/* Column Header */}
              <div
                className={`card-index p-3 mb-3 border-t-2 ${stage.color.split(" ").find((c) => c.startsWith("border-"))}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-stamp-label ${stage.color.split(" ").find((c) => c.startsWith("text-"))}`}
                  >
                    {stage.label}
                  </span>
                  <span
                    className={`stamp-badge text-[9px] ${stage.color}`}
                  >
                    {stageOpps.length}
                  </span>
                </div>
                <div className="text-utility-mono text-on-surface">
                  {formatINR(stageTotal)}
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {stageOpps.length === 0 && (
                  <div className="card-index p-4 text-center">
                    <span className="text-body-sm text-on-surface-variant">
                      No opportunities
                    </span>
                  </div>
                )}
                {stageOpps.map((opp) => (
                  <div key={opp.title} className="card-index p-4">
                    {/* Title */}
                    <div className="text-body-md font-semibold text-on-surface mb-1">
                      {opp.title}
                    </div>

                    {/* Contact */}
                    <div className="text-body-sm text-on-surface-variant mb-3">
                      {opp.contact}
                    </div>

                    {/* Value + AI Score Row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-utility-mono text-on-surface">
                        {formatINR(opp.value)}
                      </span>
                      <span
                        className={`stamp-badge text-[9px] ${scoreBadgeClasses(opp.aiScore)}`}
                      >
                        <Sparkles
                          className="w-3 h-3 mr-1"
                          strokeWidth={1.5}
                        />
                        {opp.aiScore}
                      </span>
                    </div>

                    {/* AI Next Best Action */}
                    {opp.aiNextBestAction && (
                      <div className="card-memo card-memo-blue p-2 mt-2">
                        <div className="flex items-start gap-1.5">
                          <Sparkles
                            className="w-3 h-3 text-primary-container shrink-0 mt-0.5"
                            strokeWidth={1.5}
                          />
                          <span className="text-body-sm text-on-surface-variant">
                            {opp.aiNextBestAction}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
