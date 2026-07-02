"use client";

import { useState } from "react";
import { Search, Mail, Phone, User, Filter, Plus, X } from "lucide-react";

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

export default function ContactsClient({ contacts: initialContacts }: ContactsClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<SourceTab>("all");

  // Modal and Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSource, setFormSource] = useState("MANUAL");
  const [formTags, setFormTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const response = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail || undefined,
          phone: formPhone || undefined,
          source: formSource,
          tags: tagsArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create contact");
      }

      const { contact } = await response.json();
      
      // Update local state instantly
      setContacts((prev) => [contact, ...prev]);
      
      // Reset form and close modal
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormSource("MANUAL");
      setFormTags("");
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-stamp-label text-on-surface-variant mb-2">
            CRM · CONTACTS
          </div>
          <h1 className="text-headline-md text-on-surface">Contacts</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Create Contact
        </button>
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

      {/* ─── Create Contact Modal ───────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-surface-container-low/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card-memo card-memo-blue w-full max-w-[480px] p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-primary-container" strokeWidth={1.5} />
              <span className="text-stamp-label text-on-surface-variant">
                NEW CRM RECORD
              </span>
            </div>

            <h2 className="text-headline-sm text-on-surface mb-2">Create Contact</h2>
            <p className="text-body-sm text-on-surface-variant mb-6">
              Add a new lead or customer to your tenant workspace directory.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-error-container/20 border border-error text-error text-body-sm rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateContact} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                  CONTACT NAME *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-2 text-body-md text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/40"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                  EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. rahul@techstartup.in"
                  className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-2 text-body-md text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                  PHONE NUMBER
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-2 text-body-md text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/40"
                />
              </div>

              {/* Source & Tags Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="source" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                    SOURCE CHANNEL
                  </label>
                  <select
                    id="source"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-hairline rounded px-2.5 py-1.5 text-body-sm text-on-surface outline-none focus:border-primary-container"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="INBOUND">Inbound</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tags" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. hot-lead, technical"
                    className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-1.5 text-body-sm text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/40"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-body-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="btn-primary flex items-center gap-1.5 text-body-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? "Creating..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
