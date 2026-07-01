/**
 * CommandBar — Bottom Input Bar
 * =============================
 * DESIGN.MD metaphor: "Strip of paper taped to the desk."
 * Full-width or centered wide container, 1px heavy border,
 * mono placeholder, fixed at bottom of its container.
 */
"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function CommandBar({
  placeholder = "Ask Ledger anything...",
  onSubmit,
  className = "",
}: {
  placeholder?: string;
  onSubmit?: (message: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim() && onSubmit) {
      onSubmit(value.trim());
      setValue("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-3 bg-surface-container-lowest border border-on-surface/20 rounded-[var(--radius-default)] px-4 py-3 ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-body-sm text-on-surface placeholder:text-utility-mono placeholder:text-on-surface-variant/50 outline-none"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="btn-primary px-3 py-1.5 flex items-center gap-1.5 text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>Send</span>
      </button>
    </form>
  );
}
