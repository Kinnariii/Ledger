"use client";

import { useState } from "react";
import { Search, Mail, Phone, User, Filter } from "lucide-react";

export type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  tags: string[];
  source: string | null;
  createdAt: Date;
};

interface ContactsClientProps {
  contacts: Contact[];
}

const SOURCE_TABS = ["all", "inbound", "referral", "whatsapp", "manual"] as const;
type SourceTab = (typeof SOURCE_TABS)[number];

function tagColor(tag: string): string {
  switch (tag) {
    case "hot-lead":
      return "text-error border-error";
    case "enterprise":
    case "ai-interested":
    case "fintech":
      return "text-primary-container border-primary-container";
    case "decision-maker":
    case "technical":
      return "text-on-surface-variant border-on-surface-variant";
    case "new":
    case "retail":
    case "healthcare":
    case "education":
      return "text-secondary border-secondary";
    case "logistics":
    case "media":
    case "content":
      return "text-on-tertiary-container border-on-tertiary-container";
    default:
      return "text-on-surface-variant border-on-surface-variant";
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ContactsClient({ contacts }: ContactsClientProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<SourceTab>("all");

  const filtered = contacts.filter((c) => {
    const matchesSource =
      activeTab === "all" || (c.source && c.source.toLowerCase() === activeTab);
    const query = search.toLowerCase();
    const matchesSearch =
      query === "" ||
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query));
    return matchesSource && matchesSearch;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-stamp-label text-on-surface-variant mb-2">
          CRM · CONTACTS
        </div>
        <h1 className="text-headline-md text-on-surface">Contacts</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          {filtered.length} contact{filtered.length !== 1 ? "s" : ""} in your workspace
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH CONTACTS..."
          className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-hairline rounded text-body-sm text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container transition-colors"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-on-surface-variant mr-1" strokeWidth={1.5} />
        {SOURCE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded text-stamp-label transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-primary-container text-on-primary border border-primary-container"
                : "bg-transparent text-on-surface-variant border border-hairline hover:bg-surface-container"
            }`}
          >
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Contact List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card-index p-8 text-center">
            <User className="w-8 h-8 text-on-surface-variant/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-body-md text-on-surface-variant">
              No contacts match your search.
            </p>
          </div>
        )}

        {filtered.map((contact) => (
          <div key={contact.id} className="card-index p-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Avatar Circle */}
                <div className="w-10 h-10 rounded-full bg-surface-container-high border border-hairline flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-on-surface-variant" strokeWidth={1.5} />
                </div>

                {/* Contact Details */}
                <div className="min-w-0 flex-1">
                  <div className="text-body-md font-semibold text-on-surface">
                    {contact.name}
                  </div>

                  {/* Email & Phone */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    {contact.email && (
                      <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                        <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                        <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {contact.phone}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`stamp-badge text-[9px] ${tagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Source + Date */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {contact.source && (
                  <span className="text-utility-mono text-on-surface-variant uppercase">
                    {contact.source}
                  </span>
                )}
                <span className="text-utility-mono text-on-surface-variant/60">
                  {formatDate(contact.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
