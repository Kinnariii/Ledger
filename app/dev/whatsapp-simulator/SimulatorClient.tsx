"use client";

import { useState } from "react";
import { Send, Smartphone, User, Plus, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SimpleContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface SimulatorClientProps {
  initialContacts: SimpleContact[];
}

export default function SimulatorClient({ initialContacts }: SimulatorClientProps) {
  const [contacts] = useState<SimpleContact[]>(initialContacts);
  const [selectedContactId, setSelectedContactId] = useState<string>("custom");

  // Form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Handle contact selection change
  function handleContactChange(id: string) {
    setSelectedContactId(id);
    if (id === "custom") {
      setName("");
      setPhone("");
    } else {
      const contact = contacts.find((c) => c.id === id);
      if (contact) {
        setName(contact.name);
        setPhone(contact.phone || "");
      }
    }
  }

  // Submit simulated message
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setStatus({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    setStatus(null);

    // Format phone number to clean Meta wa_id format
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");

    // Meta Webhook JSON Payload
    const payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "entry-id-simulated",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "16505551111",
                  phone_number_id: "1234567890",
                },
                contacts: [
                  {
                    profile: {
                      name: name,
                    },
                    wa_id: cleanPhone,
                  },
                ],
                messages: [
                  {
                    from: cleanPhone,
                    id: `wamid.HBgLOTE5OTk5OTk5OTk5FQIAERgS${Math.random().toString(36).substring(7).toUpperCase()}`,
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: {
                      body: message,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch("/api/webhooks/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          text: `Message injected! Check the Unified Inbox to view the conversation.`,
        });
        setMessage("");
      } else {
        throw new Error(data.error || "Webhook failed to ingest simulated message.");
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "Failed to submit webhook request." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest p-6 md:p-12 font-sans selection:bg-primary-container selection:text-on-primary">
      <div className="max-w-[960px] mx-auto">
        {/* Navigation back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-stamp-label text-on-surface-variant hover:text-on-surface mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          BACK TO DASHBOARD
        </Link>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Left panel: Info & selector */}
          <div className="md:col-span-5 space-y-6">
            <div>
              <div className="text-stamp-label text-primary-container mb-2">
                DEV TOOLING · SIMULATOR
              </div>
              <h1 className="text-headline-md text-on-surface">WhatsApp Simulator</h1>
              <p className="text-body-md text-on-surface-variant mt-2 leading-relaxed">
                Simulate inbound Meta Cloud WhatsApp webhooks. This sends genuine message payloads to your webhook endpoint, triggering contact creation, Inbox logs, and the AI Lead Qualification workflow.
              </p>
            </div>

            {/* Quick Contact Picker */}
            <div className="card-index p-5">
              <label htmlFor="contact-select" className="text-utility-mono text-[10px] text-on-surface-variant block mb-2">
                SELECT TEST CUSTOMER
              </label>
              <select
                id="contact-select"
                value={selectedContactId}
                onChange={(e) => handleContactChange(e.target.value)}
                className="w-full bg-surface-container border border-hairline rounded px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary-container"
              >
                <option value="custom">-- New/Untracked Number --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || "No phone"})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-on-surface-variant/70 mt-3 leading-relaxed">
                Choose an existing CRM contact to simulate their reply, or pick "New/Untracked Number" to verify lead qualification scoring on fresh signups.
              </p>
            </div>
          </div>

          {/* Right panel: Phone device mockup */}
          <div className="md:col-span-7">
            <div className="card-memo card-memo-blue max-w-[480px] mx-auto p-6 md:p-8 relative">
              <div className="flex items-center gap-2 mb-6">
                <Smartphone className="w-5 h-5 text-primary-container animate-pulse" strokeWidth={1.5} />
                <span className="text-stamp-label text-on-surface-variant">
                  SIMULATED WEBHOOK CONSOLE
                </span>
              </div>

              {status && (
                <div
                  className={`mb-6 p-4 border rounded text-body-sm flex items-start gap-3 ${
                    status.type === "success"
                      ? "bg-secondary-container/20 border-secondary text-secondary-container-on"
                      : "bg-error-container/20 border-error text-error"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  ) : (
                    <AlertTriangle className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  )}
                  <span>{status.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="customer-name" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                    CUSTOMER DISPLAY NAME *
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    disabled={selectedContactId !== "custom"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyesh Shah"
                    className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-2 text-body-md text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/40 disabled:opacity-75 disabled:text-on-surface-variant/80"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="customer-phone" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                    SENDER WHATSAPP NUMBER *
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    required
                    disabled={selectedContactId !== "custom"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 99999 88888"
                    className="w-full bg-transparent border-b border-hairline focus:border-primary-container outline-none py-2 text-body-md text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/40 disabled:opacity-75 disabled:text-on-surface-variant/80"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label htmlFor="message-body" className="text-utility-mono text-[10px] text-on-surface-variant block mb-1.5">
                    MESSAGE CONTENT (TEXT BODY) *
                  </label>
                  <textarea
                    id="message-body"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type the message you want the customer to send..."
                    className="w-full bg-surface-container-lowest border border-hairline rounded p-3 text-body-sm text-on-surface outline-none focus:border-primary-container placeholder:text-utility-mono placeholder:text-on-surface-variant/30 resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !name.trim() || !phone.trim() || !message.trim()}
                  className="w-full btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                  {loading ? "Injecting Message..." : "Send Message to Webhook"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
