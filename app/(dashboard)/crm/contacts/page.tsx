"use client";

/**
 * CRM Contacts — Ledger
 * =====================
 * Full contacts management page with search, source filtering,
 * and a vertical list of contact cards.
 *
 * Hardcoded demo data from Tenant A seed (8 contacts).
 */
import { useState } from "react";
import { Search, Mail, Phone, User, Filter } from "lucide-react";

/* ─── Demo Data ──────────────────────────────────────────────────────────── */

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  source: "inbound" | "referral" | "whatsapp" | "manual";
  joined: string;
};

const CONTACTS: Contact[] = [
  { id: "contact-a1", name: "Rahul Sharma", phone: "+919876543210", email: "rahul@techstartup.in", tags: ["hot-lead", "ai-interested"], source: "inbound", joined: "2025-06-12" },
  { id: "contact-a2", name: "Priya Mehta", phone: "+919876543211", email: "priya@growthco.com", tags: ["enterprise", "decision-maker"], source: "referral", joined: "2025-06-15" },
  { id: "contact-a3", name: "Aditya Kumar", phone: "+919876543212", email: "aditya@retailchain.com", tags: ["retail", "new"], source: "whatsapp", joined: "2025-06-18" },
  { id: "contact-a4", name: "Sneha Reddy", phone: "+919876543213", email: "sneha@healthtech.io", tags: ["healthcare", "technical"], source: "inbound", joined: "2025-06-20" },
  { id: "contact-a5", name: "Vikram Singh", phone: "+919876543214", email: "vikram@logisticspro.com", tags: ["logistics", "enterprise"], source: "manual", joined: "2025-06-22" },
  { id: "contact-a6", name: "Meera Joshi", phone: "+919876543215", email: "meera@eduplatform.com", tags: ["education", "hot-lead"], source: "inbound", joined: "2025-06-24" },
  { id: "contact-a7", name: "Arjun Nair", phone: "+919876543216", email: "arjun@fintechapp.in", tags: ["fintech", "technical"], source: "referral", joined: "2025-06-26" },
  { id: "contact-a8", name: "Deepa Krishnan", phone: "+919876543217", email: "deepa@mediahouse.tv", tags: ["media", "content"], source: "whatsapp", joined: "2025-06-28" },
];

const SOURCE_TABS = ["all", "inbound", "referral", "whatsapp", "manual"] as const;
type SourceTab = (typeof SOURCE_TABS)[number];

/* ─── Tag Color Map ──────────────────────────────────────────────────────── */

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

/* ─── Date Formatter ─────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ─── Page Component ─────────────────────────────────────────────────────── */

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<SourceTab>("all");

  const filtered = CONTACTS.filter((c) => {
    const matchesSource = activeTab === "all" || c.source === activeTab;
    const query = search.toLowerCase();
    const matchesSearch =
      query === "" ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query);
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
                    <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                      <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {contact.email}
                    </span>
                    <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                      <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                      {contact.phone}
                    </span>
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
                <span className="text-utility-mono text-on-surface-variant uppercase">
                  {contact.source}
                </span>
                <span className="text-utility-mono text-on-surface-variant/60">
                  {formatDate(contact.joined)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
