"use client";

import { useState } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  Sparkles,
  Send,
  Search,
} from "lucide-react";

/* ─── Types ───────────────────────────────────────────────────────────── */

type Channel = "WHATSAPP" | "EMAIL" | "CALL";
type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
type SenderType = "CUSTOMER" | "AGENT" | "AI";
type Direction = "IN" | "OUT";

interface Message {
  direction: Direction;
  content: string;
  senderType: SenderType;
  time: string;
}

interface Conversation {
  id: string;
  contact: string;
  channel: Channel;
  aiSummary: string;
  sentiment: Sentiment;
  intent: string;
  recommendedNextAction: string;
  messages: Message[];
}

/* ─── Channel Icon Map ────────────────────────────────────────────────── */

const CHANNEL_ICON: Record<Channel, typeof MessageSquare> = {
  WHATSAPP: MessageSquare,
  EMAIL: Mail,
  CALL: Phone,
};

/* ─── Sentiment Styling ───────────────────────────────────────────────── */

const SENTIMENT_STYLE: Record<Sentiment, string> = {
  POSITIVE: "text-secondary border-secondary",
  NEUTRAL: "text-outline border-outline",
  NEGATIVE: "text-error border-error",
};

/* ─── Channel Badge Styling ───────────────────────────────────────────── */

const CHANNEL_BADGE_STYLE: Record<Channel, string> = {
  WHATSAPP: "text-secondary border-secondary",
  EMAIL: "text-primary-container border-primary-container",
  CALL: "text-on-tertiary-container border-on-tertiary-container",
};

/* ─── Sender Type Badge Styling ───────────────────────────────────────── */

const SENDER_STYLE: Record<SenderType, string> = {
  CUSTOMER: "text-on-surface-variant",
  AGENT: "text-primary-container",
  AI: "text-secondary",
};

/* ─── Demo Data ───────────────────────────────────────────────────────── */

const conversations: Conversation[] = [
  {
    id: "conv-a1",
    contact: "Rahul Sharma",
    channel: "WHATSAPP",
    aiSummary:
      "Rahul inquired about AI chatbot pricing and integration timeline. Expressed urgency due to upcoming product launch. Positive tone throughout.",
    sentiment: "POSITIVE",
    intent: "pricing inquiry",
    recommendedNextAction:
      "Send detailed pricing breakdown and schedule a 30-min demo call.",
    messages: [
      {
        direction: "IN",
        content:
          "Hi, I saw your AI chatbot demos. We need something similar for our customer support. What would it cost for a startup?",
        senderType: "CUSTOMER",
        time: "Jun 28, 10:30 AM",
      },
      {
        direction: "OUT",
        content:
          "Hi Rahul! Great to hear from you. Our startup packages start at ₹3.5L for a basic WhatsApp-integrated chatbot. I can put together a detailed quote. When is your launch?",
        senderType: "AGENT",
        time: "Jun 28, 10:45 AM",
      },
      {
        direction: "IN",
        content:
          "Launch is mid-August. We need it handling at least 500 conversations/day. Can you do a demo this week?",
        senderType: "CUSTOMER",
        time: "Jun 28, 11:00 AM",
      },
      {
        direction: "OUT",
        content:
          "Absolutely! I have slots on Thursday 2pm or Friday 11am. Which works better? I'll prepare a demo with your branding.",
        senderType: "AGENT",
        time: "Jun 28, 11:15 AM",
      },
      {
        direction: "IN",
        content: "Thursday 2pm works perfectly. Looking forward to it!",
        senderType: "CUSTOMER",
        time: "Jun 28, 11:20 AM",
      },
    ],
  },
  {
    id: "conv-a2",
    contact: "Priya Mehta",
    channel: "EMAIL",
    aiSummary:
      "Priya from GrowthCo is evaluating enterprise CRM solutions. She requested a detailed proposal with SSO and API integration details. Decision expected by end of month.",
    sentiment: "POSITIVE",
    intent: "enterprise evaluation",
    recommendedNextAction:
      "Send revised proposal with SSO architecture diagram and API documentation.",
    messages: [
      {
        direction: "IN",
        content:
          "Subject: Re: Enterprise CRM Proposal\n\nHi team, We reviewed the initial proposal. A few questions: 1. Does the CRM support SAML SSO? 2. What's the API rate limit for bulk imports? 3. Can we get a pilot for our sales team of 50?\n\nPlease send an updated proposal by Friday.\n\nBest, Priya Mehta\nVP of Sales, GrowthCo",
        senderType: "CUSTOMER",
        time: "Jun 26, 9:00 AM",
      },
      {
        direction: "OUT",
        content:
          "Subject: Re: Re: Enterprise CRM Proposal\n\nHi Priya, Great questions! 1. Yes — SAML 2.0 SSO with Okta/Azure AD 2. 10,000 records/min via bulk API 3. Absolutely — we offer a 30-day enterprise pilot\n\nI'll have the updated proposal with architecture diagrams to you by Thursday EOD.\n\nBest, Kinnari",
        senderType: "AGENT",
        time: "Jun 26, 2:30 PM",
      },
    ],
  },
  {
    id: "conv-a3",
    contact: "Aditya Kumar",
    channel: "CALL",
    aiSummary:
      "Discovery call with Aditya about inventory management AI. He has 200+ SKUs and struggles with demand forecasting. Budget is limited but willing to start with a POC.",
    sentiment: "NEUTRAL",
    intent: "discovery call",
    recommendedNextAction:
      "Send POC proposal focused on top 50 SKUs with demand forecasting.",
    messages: [
      {
        direction: "IN",
        content:
          "[Call Transcript — 12 min]\n\nAditya: We have about 200 SKUs across 5 warehouses. The main pain point is demand forecasting — we either overstock or run out.\n\nKinnari: How are you doing forecasting today?\n\nAditya: Mostly Excel. Our team lead updates it weekly but it's always behind.\n\nKinnari: We could start with a POC on your top 50 SKUs. Our ML model typically improves forecast accuracy by 25-30% within the first month.\n\nAditya: That sounds promising. What would a POC cost?\n\nKinnari: For a 3-month POC covering 50 SKUs, we're looking at ₹2.5L including setup and training.\n\nAditya: Let me discuss with my partner and get back to you this week.",
        senderType: "CUSTOMER",
        time: "Jun 29, 3:00 PM",
      },
    ],
  },
  {
    id: "conv-a4",
    contact: "Meera Joshi",
    channel: "WHATSAPP",
    aiSummary:
      "Meera is interested in an AI tutoring platform for K-12 students. She needs multilingual support (Hindi + English). Very enthusiastic, wants to move fast.",
    sentiment: "POSITIVE",
    intent: "product inquiry",
    recommendedNextAction:
      "Share case study of similar EdTech implementation and propose a scoping call.",
    messages: [
      {
        direction: "IN",
        content:
          "Hey! I heard about your AI tutoring solution from a friend. We run an ed-tech platform and want to add AI-powered tutoring for our students.",
        senderType: "CUSTOMER",
        time: "Jun 30, 8:00 AM",
      },
      {
        direction: "OUT",
        content:
          "Hi Meera! That's exciting. We've built AI tutoring systems for a few ed-tech platforms. What subjects and grade levels are you targeting?",
        senderType: "AGENT",
        time: "Jun 30, 8:30 AM",
      },
      {
        direction: "IN",
        content:
          "Math and Science for grades 6-10. We need it to work in both Hindi and English. Is that possible?",
        senderType: "CUSTOMER",
        time: "Jun 30, 9:00 AM",
      },
      {
        direction: "OUT",
        content:
          "Yes! Multilingual is one of our strengths. Let me share a case study and we can set up a scoping call this week. 📚",
        senderType: "AI",
        time: "Jun 30, 9:15 AM",
      },
    ],
  },
];

/* ─── Filter Tabs ─────────────────────────────────────────────────────── */

type ChannelFilter = "ALL" | Channel;

const FILTER_TABS: { label: string; value: ChannelFilter; icon?: typeof MessageSquare }[] = [
  { label: "All", value: "ALL" },
  { label: "WhatsApp", value: "WHATSAPP", icon: MessageSquare },
  { label: "Email", value: "EMAIL", icon: Mail },
  { label: "Call", value: "CALL", icon: Phone },
];

/* ═══════════════════════════════════════════════════════════════════════ */

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string>("conv-a1");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ALL");

  const filtered =
    channelFilter === "ALL"
      ? conversations
      : conversations.filter((c) => c.channel === channelFilter);

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0];

  return (
    <div className="-mx-12 -my-8">
      {/* ─── Page Container ─────────────────────────────────────────── */}
      <div className="flex min-h-[calc(100vh-0px)]">
        {/* ─── Left Panel — Conversation List ────────────────────────── */}
        <div className="w-[360px] shrink-0 border-r border-hairline flex flex-col bg-surface-container-lowest">
          {/* Header */}
          <div className="px-5 pt-6 pb-4">
            <div className="text-stamp-label text-on-surface-variant mb-2">
              INBOX · UNIFIED
            </div>
            <h1 className="text-headline-md text-on-surface">Inbox</h1>
          </div>

          {/* Search Bar */}
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 px-3 py-2 border border-hairline rounded-[var(--radius-default)] bg-surface">
              <Search className="w-4 h-4 text-on-surface-variant shrink-0" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="SEARCH CONVERSATIONS..."
                className="flex-1 bg-transparent text-utility-mono text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>
          </div>

          {/* Channel Filter Tabs */}
          <div className="px-5 pb-3 flex gap-1">
            {FILTER_TABS.map((tab) => {
              const isActive = channelFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setChannelFilter(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-default)] text-utility-mono transition-colors ${
                    isActive
                      ? "bg-primary-fixed/20 text-primary-container border border-primary-container"
                      : "text-on-surface-variant border border-transparent hover:bg-surface-container"
                  }`}
                >
                  {tab.icon && (
                    <tab.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => {
              const isSelected = conv.id === selectedId;
              const Icon = CHANNEL_ICON[conv.channel];
              const lastMessage = conv.messages[conv.messages.length - 1];

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-5 py-4 border-b border-hairline transition-colors ${
                    isSelected
                      ? "border-l-2 border-l-primary-container bg-surface-container-low"
                      : "hover:bg-surface-container-low/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Channel Icon */}
                    <div className="mt-0.5 shrink-0">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? "text-primary-container" : "text-on-surface-variant"
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body-md font-medium text-on-surface truncate">
                          {conv.contact}
                        </span>
                        <span className="text-utility-mono text-on-surface-variant shrink-0 ml-2">
                          {lastMessage.time.split(", ")[1] ?? lastMessage.time}
                        </span>
                      </div>

                      {/* AI Summary Preview */}
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-2">
                        {conv.aiSummary}
                      </p>

                      {/* Sentiment Badge */}
                      <span
                        className={`stamp-badge text-[9px] ${SENTIMENT_STYLE[conv.sentiment]}`}
                      >
                        {conv.sentiment}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-body-sm text-on-surface-variant">
                  No conversations in this channel.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Right Panel — Conversation Detail ────────────────────── */}
        <div className="flex-1 flex flex-col bg-surface min-w-0">
          {/* Detail Header */}
          <div className="px-8 py-5 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-headline-sm text-on-surface">
                {selected.contact}
              </h2>
              <span
                className={`stamp-badge text-[9px] ${CHANNEL_BADGE_STYLE[selected.channel]}`}
              >
                {selected.channel}
              </span>
            </div>
            <span className="text-utility-mono text-on-surface-variant">
              {selected.intent}
            </span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* AI Summary Card */}
            <div className="card-memo card-memo-blue p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles
                  className="w-4 h-4 text-primary-container"
                  strokeWidth={1.5}
                />
                <span className="text-stamp-label text-primary-container">
                  AI ANALYSIS
                </span>
              </div>

              <p className="text-body-md text-on-surface mb-3">
                {selected.aiSummary}
              </p>

              <p className="text-body-sm text-on-surface-variant italic mb-3">
                → {selected.recommendedNextAction}
              </p>

              <span
                className={`stamp-badge text-[9px] ${SENTIMENT_STYLE[selected.sentiment]}`}
              >
                {selected.sentiment}
              </span>
            </div>

            {/* Message Timeline */}
            <div>
              <div className="text-stamp-label text-on-surface-variant mb-4">
                CONVERSATION TIMELINE
              </div>

              <div className="space-y-4">
                {selected.messages.map((msg, i) => {
                  const isOutgoing = msg.direction === "OUT";

                  return (
                    <div
                      key={i}
                      className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isOutgoing
                            ? "bg-primary-fixed/20"
                            : "bg-surface-container"
                        }`}
                      >
                        {/* Message Content */}
                        <p className="text-body-sm text-on-surface whitespace-pre-line">
                          {msg.content}
                        </p>

                        {/* Footer: sender type + timestamp */}
                        <div
                          className={`flex items-center gap-3 mt-2 ${
                            isOutgoing ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span
                            className={`text-utility-mono text-[10px] ${SENDER_STYLE[msg.senderType]}`}
                          >
                            {msg.senderType}
                          </span>
                          <span className="text-utility-mono text-[10px] text-on-surface-variant">
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="px-8 py-4 border-t border-hairline">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 border border-hairline rounded-[var(--radius-default)] bg-surface-container-lowest">
                <input
                  type="text"
                  placeholder="TYPE A REPLY..."
                  className="flex-1 bg-transparent text-utility-mono text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                />
              </div>
              <button className="btn-primary flex items-center gap-2 px-4 py-3">
                <Send className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-body-sm font-medium">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
