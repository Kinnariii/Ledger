/**
 * Utility: cn() — Tailwind class name merger
 * ===========================================
 * Combines clsx (conditional class joining) with tailwind-merge
 * (deduplication of conflicting Tailwind classes). This is the
 * standard pattern used by shadcn/ui components.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
