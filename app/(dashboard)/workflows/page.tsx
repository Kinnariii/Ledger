/**
 * Workflows — Ledger
 * ==================
 * Workflow automation management page.
 * Displays configured workflows with status, triggers,
 * run history, and creator attribution.
 *
 * Static display — no client-side interactivity needed.
 */
import {
  Workflow,
  Plus,
  Zap,
  Clock,
  Bot,
  User,
  Play,
  Pause,
  FileEdit,
} from "lucide-react";

const workflows = [
  {
    name: "Auto-qualify new leads",
    trigger: "Triggered when a new contact is created",
    status: "ACTIVE" as const,
    lastRun: "2 hours ago",
    nextRun: null,
    createdBy: "AI" as const,
    description:
      "Automatically scores new leads using AI analysis of contact data, conversation history, and business fit. Leads scoring above 70 are moved to QUALIFIED stage.",
  },
  {
    name: "Follow-up after 3 days of no response",
    trigger: "Triggered when no reply received for 72 hours",
    status: "ACTIVE" as const,
    lastRun: "Yesterday",
    nextRun: "Checking hourly",
    createdBy: "AI" as const,
    description:
      "Monitors all active conversations. If no response is received within 3 days, drafts and sends a personalized follow-up message via the original channel.",
  },
  {
    name: "Send welcome email on deal won",
    trigger: "Triggered when opportunity stage changes to WON",
    status: "DRAFT" as const,
    lastRun: null,
    nextRun: null,
    createdBy: "USER" as const,
    description:
      "Sends a branded welcome email with onboarding checklist when a deal is marked as won. Includes links to setup guides and scheduled kickoff call.",
  },
  {
    name: "Weekly pipeline summary",
    trigger: "Runs every Monday at 9:00 AM",
    status: "ACTIVE" as const,
    lastRun: "Jun 30, 9:00 AM",
    nextRun: "Jul 7, 9:00 AM",
    createdBy: "USER" as const,
    description:
      "Generates a comprehensive AI-powered pipeline summary including stage changes, at-risk deals, and recommended actions. Delivered via chat.",
  },
  {
    name: "Escalate negative sentiment",
    trigger: "Triggered on AI-detected negative sentiment",
    status: "PAUSED" as const,
    lastRun: "Jun 25",
    nextRun: null,
    createdBy: "AI" as const,
    description:
      "When AI detects negative sentiment in a customer conversation, creates an urgent task and sends a notification. Paused for threshold tuning.",
  },
];

const statusConfig = {
  ACTIVE: {
    cardClass: "card-memo-green",
    badgeClass: "text-secondary border-secondary",
    Icon: Play,
  },
  DRAFT: {
    cardClass: "card-memo-amber",
    badgeClass: "text-on-tertiary-container border-on-tertiary-container",
    Icon: FileEdit,
  },
  PAUSED: {
    cardClass: "",
    badgeClass: "text-outline border-outline",
    Icon: Pause,
  },
} as const;

// TEMP: replace with session tenantId once Phase B auth lands
const TEMP_TENANT_ID = "tenant-a";

export default function WorkflowsPage() {
  const activeCount = workflows.filter((w) => w.status === "ACTIVE").length;
  const draftCount = workflows.filter((w) => w.status === "DRAFT").length;
  const pausedCount = workflows.filter((w) => w.status === "PAUSED").length;

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-stamp-label text-on-surface-variant mb-2">
            WORKFLOWS · AUTOMATION
          </div>
          <h1 className="text-headline-md text-on-surface">
            Workflow Automation
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            5 workflows configured
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Create Workflow
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-index p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stamp-label text-on-surface-variant">
              ACTIVE
            </span>
            <Play className="w-4 h-4 text-secondary" strokeWidth={1.5} />
          </div>
          <div className="text-headline-sm text-secondary">{activeCount}</div>
        </div>
        <div className="card-index p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stamp-label text-on-surface-variant">
              DRAFT
            </span>
            <FileEdit
              className="w-4 h-4 text-on-tertiary-container"
              strokeWidth={1.5}
            />
          </div>
          <div className="text-headline-sm text-on-tertiary-container">
            {draftCount}
          </div>
        </div>
        <div className="card-index p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-stamp-label text-on-surface-variant">
              PAUSED
            </span>
            <Pause className="w-4 h-4 text-outline" strokeWidth={1.5} />
          </div>
          <div className="text-headline-sm text-outline">{pausedCount}</div>
        </div>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.map((workflow) => {
          const config = statusConfig[workflow.status];
          const pausedStyle =
            workflow.status === "PAUSED"
              ? { borderLeftColor: "var(--color-outline)" }
              : undefined;

          return (
            <div
              key={workflow.name}
              className={`card-memo ${config.cardClass} p-6`}
              style={pausedStyle}
            >
              {/* Top Section */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Workflow
                    className="w-5 h-5 text-on-surface-variant mt-0.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0">
                    <div className="text-body-md font-semibold text-on-surface">
                      {workflow.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Zap
                        className="w-3.5 h-3.5 text-on-surface-variant shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-body-sm text-on-surface-variant">
                        {workflow.trigger}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-4">
                  {/* Run Times */}
                  <div className="text-right space-y-1">
                    {workflow.lastRun && (
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock
                          className="w-3.5 h-3.5 text-on-surface-variant"
                          strokeWidth={1.5}
                        />
                        <span className="text-utility-mono text-on-surface-variant">
                          Last: {workflow.lastRun}
                        </span>
                      </div>
                    )}
                    {workflow.nextRun && (
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock
                          className="w-3.5 h-3.5 text-on-surface-variant"
                          strokeWidth={1.5}
                        />
                        <span className="text-utility-mono text-on-surface-variant">
                          Next: {workflow.nextRun}
                        </span>
                      </div>
                    )}
                    {!workflow.lastRun && !workflow.nextRun && (
                      <span className="text-utility-mono text-on-surface-variant">
                        Never run
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span className={`stamp-badge ${config.badgeClass}`}>
                    {workflow.status}
                  </span>
                </div>
              </div>

              {/* Hairline Divider */}
              <div className="border-t border-hairline mt-4 pt-4">
                {/* Footer */}
                <div className="flex items-start gap-3">
                  <span className="stamp-badge text-on-surface-variant border-on-surface-variant shrink-0">
                    {workflow.createdBy === "AI" ? (
                      <Bot
                        className="w-3 h-3 mr-1"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <User
                        className="w-3 h-3 mr-1"
                        strokeWidth={1.5}
                      />
                    )}
                    {workflow.createdBy === "AI"
                      ? "AI-CREATED"
                      : "USER-CREATED"}
                  </span>
                  <p className="text-body-sm text-on-surface-variant">
                    {workflow.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
