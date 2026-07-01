import { redirect } from "next/navigation";

/**
 * Root page — redirects to login.
 * Once authenticated, users land on /dashboard instead.
 */
export default function HomePage() {
  redirect("/login");
}
