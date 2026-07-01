/**
 * StampBadge — Reusable Stamp Badge Component
 * =============================================
 * Bureau Documental design: slightly rotated pill badge.
 * Typography: stamp-label (IBM Plex Mono 11px, 700, ALL CAPS).
 * Border: 1.5px solid currentColor.
 * Shape: pill (border-radius: 9999px).
 *
 * Variants map to semantic colors from DESIGN.md:
 * - blue:    Stamp Blue (primary-container)
 * - green:   Ledger Green (secondary)
 * - amber:   Amber (tertiary accent)
 * - red:     Error
 * - outline: Neutral outline
 */

type StampBadgeVariant = "blue" | "green" | "amber" | "red" | "outline";

const VARIANT_CLASSES: Record<StampBadgeVariant, string> = {
  blue: "text-primary-container border-primary-container",
  green: "text-secondary border-secondary",
  amber: "text-on-tertiary-container border-on-tertiary-container",
  red: "text-error border-error",
  outline: "text-on-surface-variant border-on-surface-variant",
};

// Deterministic rotation based on text content to avoid layout shifts
function getRotation(text: string): string {
  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const deg = ((hash % 7) - 3); // Range: -3 to +3 degrees
  return `rotate(${deg}deg)`;
}

export default function StampBadge({
  children,
  variant = "outline",
  className = "",
}: {
  children: React.ReactNode;
  variant?: StampBadgeVariant;
  className?: string;
}) {
  const text = typeof children === "string" ? children : "";

  return (
    <span
      className={`stamp-badge ${VARIANT_CLASSES[variant]} ${className}`}
      style={{ transform: getRotation(text) }}
    >
      {children}
    </span>
  );
}
