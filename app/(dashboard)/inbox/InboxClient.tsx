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

export interface Message {
  id: string;
  direction: Direction;
  content: string;
  senderType: SenderType;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  channel: Channel;
  aiSummary: string | null;
  sentiment: Sentiment | null;
  intent: string | null;
  recommendedNextAction: string | null;
  contact: {
    name: string;
  };
  messages: Message[];
}

interface InboxClientProps {
  conversations: Conversation[];
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

type ChannelFilter = "ALL" | Channel;

const FILTER_TABS: { label: string; value: ChannelFilter; icon?: typeof MessageSquare }[] = [
  { label: "All", value: "ALL" },
  { label: "WhatsApp", value: "WHATSAPP", icon: MessageSquare },
  { label: "Email", value: "EMAIL", icon: Mail },
  { label: "Call", value: "CALL", icon: Phone },
];

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function InboxClient({ conversations }: InboxClientProps) {
  const [selectedId, setSelectedId] = useState<string>(
    conversations[0]?.id ?? ""
  );
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("ALL");

  const filtered =
    channelFilter === "ALL"
      ? conversations
      : conversations.filter((c) => c.channel === channelFilter);

  const selected =
    conversations.find((c) => c.id === selectedId) ?? conversations[0];

  return (
    <div className="-mx-12 -my-8">
      <div className="flex min-h-[calc(100vh-0px)]">
        {/* Left Panel — Conversation List */}
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
                          {conv.contact.name}
                        </span>
                        <span className="text-utility-mono text-on-surface-variant shrink-0 ml-2">
                          {lastMessage ? formatTime(lastMessage.createdAt) : ""}
                        </span>
                      </div>

                      {/* AI Summary Preview */}
                      <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-2">
                        {conv.aiSummary ?? "No summary available."}
                      </p>

                      {/* Sentiment Badge */}
                      {conv.sentiment && (
                        <span
                          className={`stamp-badge text-[9px] ${SENTIMENT_STYLE[conv.sentiment]}`}
                        >
                          {conv.sentiment}
                        </span>
                      )}
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

        {/* Right Panel — Conversation Detail */}
        {selected ? (
          <div className="flex-1 flex flex-col bg-surface min-w-0">
            {/* Detail Header */}
            <div className="px-8 py-5 border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-headline-sm text-on-surface">
                  {selected.contact.name}
                </h2>
                <span
                  className={`stamp-badge text-[9px] ${CHANNEL_BADGE_STYLE[selected.channel]}`}
                >
                  {selected.channel}
                </span>
              </div>
              {selected.intent && (
                <span className="text-utility-mono text-on-surface-variant">
                  {selected.intent}
                </span>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {/* AI Summary Card */}
              {selected.aiSummary && (
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

                  {selected.recommendedNextAction && (
                    <p className="text-body-sm text-on-surface-variant italic mb-3">
                      → {selected.recommendedNextAction}
                    </p>
                  )}

                  {selected.sentiment && (
                    <span
                      className={`stamp-badge text-[9px] ${SENTIMENT_STYLE[selected.sentiment]}`}
                    >
                      {selected.sentiment}
                    </span>
                  )}
                </div>
              )}

              {/* Message Timeline */}
              <div>
                <div className="text-stamp-label text-on-surface-variant mb-4">
                  CONVERSATION TIMELINE
                </div>

                <div className="space-y-4">
                  {selected.messages.map((msg) => {
                    const isOutgoing = msg.direction === "OUT";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg p-3 ${
                            isOutgoing
                              ? "bg-primary-fixed/20"
                              : "bg-surface-container"
                          }`}
                        >
                          <p className="text-body-sm text-on-surface whitespace-pre-line">
                            {msg.content}
                          </p>

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
                              {formatDate(msg.createdAt)}
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
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface">
            <p className="text-body-md text-on-surface-variant">
              Select a conversation to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
