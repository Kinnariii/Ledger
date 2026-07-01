/**
 * Login Page — Ledger
 * ===================
 * Pixel-accurate to Stitch screen: "Login — Ledger" (2c1c7b8b)
 *
 * Design decisions from DESIGN.MD:
 * - Warm paper background (#fff8f3) with subtle grain texture
 * - Centered card with hairline border — index-card aesthetic
 * - Newsreader serif headline for authority
 * - IBM Plex Mono status line at bottom ("LEDGER · SECURE · LOGIN")
 * - Stamp Blue primary button for Google OAuth
 * - No shadows anywhere — depth via tonal layering only
 * - 1.5px stroke icons with butt caps
 */
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      {/* ─── Login Card ──────────────────────────────────────────── */}
      <div className="w-full max-w-[440px]">
        {/* Logo & Branding */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary-container rounded-[var(--radius-default)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-on-primary" strokeWidth={1.5} />
          </div>
          <span className="text-headline-sm text-on-surface">Ledger</span>
        </div>

        {/* Card */}
        <div className="card-index p-8">
          {/* Mono Header — like an index card category */}
          <div className="text-stamp-label text-on-surface-variant mb-6 tracking-widest">
            SIGN IN TO YOUR WORKSPACE
          </div>

          {/* Headline */}
          <h1 className="text-headline-md text-on-surface mb-3">
            Welcome back
          </h1>

          {/* Description */}
          <p className="text-body-md text-on-surface-variant mb-8">
            Sign in with your Google account to access your Ledger workspace.
            Your AI business assistant is ready.
          </p>

          {/* Google OAuth Button */}
          <a
            href="/api/auth/login"
            className="btn-primary w-full flex items-center justify-center gap-3 py-3 text-[15px] rounded-[var(--radius-default)]"
          >
            {/* Google "G" icon */}
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              className="shrink-0"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-hairline" />
            <span className="text-utility-mono text-on-surface-variant">
              SECURE · ENCRYPTED
            </span>
            <div className="flex-1 h-px bg-hairline" />
          </div>

          {/* Info text */}
          <p className="text-body-sm text-on-surface-variant text-center">
            Ledger uses Google OAuth 2.0 with PKCE for secure authentication.
            Your credentials are never stored.
          </p>
        </div>

        {/* Status line — IBM Plex Mono footer */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-stamp-label text-on-surface-variant">
            LEDGER · v0.1.0
          </span>
          <span className="text-stamp-label text-on-surface-variant">
            SECURE · LOGIN
          </span>
        </div>
      </div>
    </main>
  );
}
