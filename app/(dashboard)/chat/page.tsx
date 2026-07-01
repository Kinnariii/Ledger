/**
 * AI Chat — Ledger
 * ================
 * Split-panel AI chat interface.
 *
 * Left panel (280px): Chat history list with "New Chat" button
 * Right panel (flex-1): Active conversation with message thread + command bar input
 *
 * All data is hardcoded demo data — no API calls.
 */
"use client";

import { useState } from "react";
import { Sparkles, Send, Plus, MessageSquare } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
  time: string;
}

interface Chat {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
}

/* ─── Hardcoded Demo Data ────────────────────────────────────────────── */

const chats: Chat[] = [
  {
    id: "aichat-a1",
    title: "Morning Briefing",
    timestamp: "Today, 9:00 AM",
    messages: [
      {
        role: "USER",
        content: "Good morning! What's my day looking like?",
        time: "9:00 AM",
      },
      {
        role: "ASSISTANT",
        content:
          "Good morning, Kinnari! Here's your Ledger briefing:\n\n📋 **3 tasks due this week:**\n- Prepare demo for Rahul Sharma (Thu 2pm)\n- Send revised proposal to Priya Mehta (Fri EOD)\n- Follow up with Aditya Kumar on POC\n\n💰 **Pipeline Update:**\n- 2 qualified opportunities worth ₹1L total\n- GrowthCo deal (₹1.25L) is in proposal stage — highest priority\n\n🔥 **AI Alert:** Rahul's demo is in 2 days and you haven't shared the prep materials yet. Want me to draft a pre-demo email?",
        time: "9:00 AM",
      },
    ],
  },
  {
    id: "aichat-a2",
    title: "Lead Qualification Help",
    timestamp: "Yesterday",
    messages: [
      {
        role: "USER",
        content: "Can you score the RetailChain lead for me?",
        time: "3:15 PM",
      },
      {
        role: "ASSISTANT",
        content:
          "I've analyzed Aditya Kumar's lead from RetailChain:\n\n**AI Score: 55/100** (Medium)\n\n**Positive signals:**\n- Clear pain point (demand forecasting)\n- Willing to start with POC\n- 200+ SKUs = meaningful scale\n\n**Risk factors:**\n- Budget is limited\n- Decision requires partner approval\n- Currently using Excel (low tech maturity)\n\n**Recommendation:** Send a focused POC proposal for top 50 SKUs at ₹2.5L. This de-risks the investment for them.",
        time: "3:15 PM",
      },
    ],
  },
  {
    id: "aichat-a3",
    title: "Email Draft for Priya",
    timestamp: "Jun 29",
    messages: [
      {
        role: "USER",
        content:
          "Draft a follow-up email to Priya about the enterprise proposal",
        time: "11:00 AM",
      },
      {
        role: "ASSISTANT",
        content:
          "Here's a draft follow-up email:\n\n**Subject:** Updated Enterprise CRM Proposal — Acme Digital Solutions\n\nHi Priya,\n\nThank you for your detailed questions about our CRM platform. As promised, here's the updated proposal addressing each point:\n\n1. **SSO:** Full SAML 2.0 support with Okta, Azure AD, and Google Workspace\n2. **API:** 10,000 records/min bulk import, with dedicated rate limits for enterprise\n3. **Pilot:** 30-day enterprise pilot for your team of 50, no commitment required\n\nI've attached the architecture diagram and API documentation. Happy to walk through any details on a call.\n\nBest regards,\nKinnari",
        time: "11:00 AM",
      },
    ],
  },
];

/* ─── Rich Text Renderer ─────────────────────────────────────────────── */

/**
 * Parses assistant message content into React elements.
 * Supports: **bold**, bullet points (- item), numbered lists (1. item),
 * and newline paragraph breaks.
 */
function renderMessageContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed === "") {
      // Empty line — paragraph break spacer
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // Detect bullet points
    const bulletMatch = trimmed.match(/^- (.+)$/);
    if (bulletMatch) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-on-surface-variant shrink-0">•</span>
          <span>{renderInlineFormatting(bulletMatch[1])}</span>
        </div>
      );
      return;
    }

    // Detect numbered list items
    const numberedMatch = trimmed.match(/^(\d+)\. (.+)$/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1">
          <span className="text-on-surface-variant shrink-0">
            {numberedMatch[1]}.
          </span>
          <span>{renderInlineFormatting(numberedMatch[2])}</span>
        </div>
      );
      return;
    }

    // Regular paragraph line
    elements.push(
      <div key={i}>{renderInlineFormatting(trimmed)}</div>
    );
  });

  return <>{elements}</>;
}

/**
 * Renders inline **bold** formatting within a line of text.
 */
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ─── Page Component ─────────────────────────────────────────────────── */

export default function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string>("aichat-a1");
  const [inputValue, setInputValue] = useState("");

  const activeChat = chats.find((c) => c.id === activeChatId) ?? chats[0];

  return (
    /* Break out of the parent layout padding to fill full height */
    <div className="-mx-12 -my-8 flex min-h-[calc(100vh-0px)]">
      {/* ─── Left Panel: Chat History ──────────────────────────────── */}
      <div className="w-[280px] shrink-0 border-r border-hairline bg-surface-container-low flex flex-col">
        {/* Panel Header */}
        <div className="p-4 pb-3 border-b border-hairline">
          <div className="text-stamp-label text-on-surface-variant mb-3">
            AI · AGENT
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2 text-body-sm">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-2">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-surface-container-lowest border-l-2 border-primary-container"
                    : "hover:bg-surface-container border-l-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isActive
                        ? "text-primary-container"
                        : "text-on-surface-variant"
                    }`}
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-body-md font-medium truncate ${
                        isActive ? "text-on-surface" : "text-on-surface-variant"
                      }`}
                    >
                      {chat.title}
                    </div>
                    <div className="text-utility-mono text-on-surface-variant mt-1">
                      {chat.timestamp}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right Panel: Active Chat ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-8 py-4 border-b border-hairline bg-surface-container-lowest flex items-center gap-2.5">
          <Sparkles
            className="w-4 h-4 text-primary-container"
            strokeWidth={1.5}
          />
          <span className="text-utility-mono text-on-surface">
            {activeChat.title}
          </span>
          <span className="text-utility-mono text-on-surface-variant ml-auto">
            {activeChat.timestamp}
          </span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {activeChat.messages.map((msg, idx) => {
            if (msg.role === "USER") {
              return (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-[70%]">
                    <div className="bg-surface-container-high rounded-lg p-3 ml-auto">
                      <p className="text-body-md text-on-surface">
                        {msg.content}
                      </p>
                    </div>
                    <div className="text-utility-mono text-on-surface-variant mt-1.5 text-right">
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            }

            // ASSISTANT message
            return (
              <div key={idx} className="flex justify-start">
                <div className="max-w-[70%]">
                  <div className="bg-surface-container-lowest rounded-lg p-3 card-index">
                    {/* Assistant identity header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-hairline">
                      <Sparkles
                        className="w-3.5 h-3.5 text-primary-container"
                        strokeWidth={1.5}
                      />
                      <span className="text-stamp-label text-primary-container">
                        LEDGER
                      </span>
                    </div>
                    {/* Message content */}
                    <div className="text-body-md text-on-surface space-y-0.5">
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                  <div className="text-utility-mono text-on-surface-variant mt-1.5">
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Command Bar (Input) ─────────────────────────────────── */}
        <div className="px-8 py-4">
          <div className="border border-on-surface bg-surface-container-lowest rounded-[var(--radius-default)] flex items-center gap-3 px-4 py-2.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Ledger anything..."
              className="flex-1 bg-transparent text-body-md text-on-surface placeholder:font-mono placeholder:text-[13px] placeholder:text-on-surface-variant placeholder:tracking-[0.05em] outline-none"
            />
            <button
              className="btn-primary !px-3 !py-2 flex items-center gap-1.5 text-body-sm shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] font-mono text-on-surface-variant tracking-[0.05em]">
              LEDGER AI · RESPONSES MAY BE INACCURATE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
