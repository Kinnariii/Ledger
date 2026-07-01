/**
 * Onboarding Page — Ledger
 * ========================
 * Pixel-accurate to Stitch screen: "Onboarding — Ledger" (b4d57998)
 *
 * Multi-step form: business name → business type → goals.
 * Stores answers in Tenant.onboardingData — this becomes AI context
 * so the agent can give domain-specific answers.
 *
 * Design: Memo-slip styling with left-border accent per step,
 * progress indicator using stamp-label typography.
 */
"use client";

import { useState } from "react";
import { BookOpen, ArrowRight, ArrowLeft, Sparkles, Building2, Target, CheckCircle2 } from "lucide-react";

// Onboarding step types
interface OnboardingData {
  businessName: string;
  businessType: string;
  industry: string;
  teamSize: string;
  goals: string[];
}

const BUSINESS_TYPES = [
  "Consulting & Services",
  "E-commerce & Retail",
  "SaaS & Technology",
  "Healthcare",
  "Education",
  "Financial Services",
  "Real Estate",
  "Manufacturing",
  "Media & Marketing",
  "Other",
];

const GOALS = [
  "Increase lead conversion",
  "Automate follow-ups",
  "Track deal pipeline",
  "Manage customer conversations",
  "WhatsApp business messaging",
  "AI-powered insights",
  "Team collaboration",
  "Workflow automation",
];

const TEAM_SIZES = ["Just me", "2-5", "5-15", "15-50", "50+"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    businessName: "",
    businessType: "",
    industry: "",
    teamSize: "",
    goals: [],
  });

  const totalSteps = 3;

  const toggleGoal = (goal: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const canAdvance = () => {
    switch (step) {
      case 0:
        return data.businessName.trim().length > 0;
      case 1:
        return data.businessType.length > 0 && data.teamSize.length > 0;
      case 2:
        return data.goals.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        window.location.href = "/dashboard";
      }
    } catch {
      // Error handling — in production, show a toast
      console.error("Onboarding submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[560px]">
        {/* Logo & Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-container rounded-[var(--radius-default)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-on-primary" strokeWidth={1.5} />
          </div>
          <span className="text-headline-sm text-on-surface">Ledger</span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-[var(--radius-default)] flex items-center justify-center text-stamp-label transition-colors ${
                  i < step
                    ? "bg-secondary text-on-secondary"
                    : i === step
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  i + 1
                )}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 h-px ${
                    i < step ? "bg-secondary" : "bg-hairline"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-auto text-stamp-label text-on-surface-variant">
            STEP {step + 1} OF {totalSteps}
          </span>
        </div>

        {/* ─── Step 0: Business Name ──────────────────────────────── */}
        {step === 0 && (
          <div className="card-memo card-memo-blue p-8">
            <div className="flex items-center gap-2 mb-6">
              <Building2
                className="w-5 h-5 text-primary-container"
                strokeWidth={1.5}
              />
              <span className="text-stamp-label text-on-surface-variant">
                YOUR BUSINESS
              </span>
            </div>

            <h1 className="text-headline-md text-on-surface mb-2">
              What&apos;s your business called?
            </h1>
            <p className="text-body-md text-on-surface-variant mb-8">
              Ledger will use this to personalize your workspace and
              AI assistant.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="businessName"
                  className="text-utility-mono text-on-surface-variant block mb-2"
                >
                  BUSINESS NAME
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={data.businessName}
                  onChange={(e) =>
                    setData({ ...data, businessName: e.target.value })
                  }
                  placeholder="e.g. Acme Digital Solutions"
                  className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-3 text-body-lg text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/50 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="industry"
                  className="text-utility-mono text-on-surface-variant block mb-2"
                >
                  INDUSTRY (OPTIONAL)
                </label>
                <input
                  id="industry"
                  type="text"
                  value={data.industry}
                  onChange={(e) =>
                    setData({ ...data, industry: e.target.value })
                  }
                  placeholder="e.g. Technology & AI Consulting"
                  className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-3 text-body-md text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/50 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 1: Business Type & Team Size ──────────────────── */}
        {step === 1 && (
          <div className="card-memo card-memo-green p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles
                className="w-5 h-5 text-secondary"
                strokeWidth={1.5}
              />
              <span className="text-stamp-label text-on-surface-variant">
                BUSINESS PROFILE
              </span>
            </div>

            <h1 className="text-headline-md text-on-surface mb-2">
              Tell us about your business
            </h1>
            <p className="text-body-md text-on-surface-variant mb-8">
              This helps Ledger tailor its AI recommendations to your industry.
            </p>

            {/* Business Type Grid */}
            <div className="mb-6">
              <span className="text-utility-mono text-on-surface-variant block mb-3">
                BUSINESS TYPE
              </span>
              <div className="grid grid-cols-2 gap-2">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setData({ ...data, businessType: type })}
                    className={`p-3 text-left text-body-sm rounded-[var(--radius-default)] border transition-colors ${
                      data.businessType === type
                        ? "border-primary-container bg-primary-fixed/20 text-on-surface"
                        : "border-hairline bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Size */}
            <div>
              <span className="text-utility-mono text-on-surface-variant block mb-3">
                TEAM SIZE
              </span>
              <div className="flex gap-2 flex-wrap">
                {TEAM_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setData({ ...data, teamSize: size })}
                    className={`px-4 py-2 text-body-sm rounded-[var(--radius-full)] border transition-colors ${
                      data.teamSize === size
                        ? "border-primary-container bg-primary-fixed/20 text-on-surface"
                        : "border-hairline bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Goals ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="card-memo card-memo-amber p-8">
            <div className="flex items-center gap-2 mb-6">
              <Target
                className="w-5 h-5 text-on-tertiary-container"
                strokeWidth={1.5}
              />
              <span className="text-stamp-label text-on-surface-variant">
                YOUR GOALS
              </span>
            </div>

            <h1 className="text-headline-md text-on-surface mb-2">
              What do you want to achieve?
            </h1>
            <p className="text-body-md text-on-surface-variant mb-8">
              Select all that apply. Ledger will prioritize features and
              AI insights based on your goals.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-4 text-left text-body-md rounded-[var(--radius-default)] border transition-colors flex items-center gap-3 ${
                    data.goals.includes(goal)
                      ? "border-primary-container bg-primary-fixed/20 text-on-surface"
                      : "border-hairline bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-[var(--radius-sm)] border flex items-center justify-center shrink-0 transition-colors ${
                      data.goals.includes(goal)
                        ? "border-primary-container bg-primary-container"
                        : "border-outline-variant"
                    }`}
                  >
                    {data.goals.includes(goal) && (
                      <CheckCircle2
                        className="w-3 h-3 text-on-primary"
                        strokeWidth={2}
                      />
                    )}
                  </div>
                  {goal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Navigation Buttons ─────────────────────────────────── */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary flex items-center gap-2 text-body-sm"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps - 1 ? (
            <button
              onClick={() => canAdvance() && setStep(step + 1)}
              disabled={!canAdvance()}
              className="btn-primary flex items-center gap-2 text-body-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance() || isSubmitting}
              className="btn-primary flex items-center gap-2 text-body-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Setting up workspace..."
              ) : (
                <>
                  Launch Ledger
                  <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Status line */}
        <div className="mt-8 flex items-center justify-between">
          <span className="text-stamp-label text-on-surface-variant">
            LEDGER · ONBOARDING
          </span>
          <span className="text-stamp-label text-on-surface-variant">
            {data.businessName || "NEW WORKSPACE"}
          </span>
        </div>
      </div>
    </main>
  );
}
