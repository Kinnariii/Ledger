import { getOpportunities } from "@/lib/db/scoped";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import OpportunitiesClient from "./OpportunitiesClient";

export default async function OpportunitiesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const opportunities = await getOpportunities(session.tenantId);

  // Cast stages to match client component types if needed
  const mappedOpportunities = opportunities.map((opp) => ({
    ...opp,
    stage: opp.stage as any,
  }));

  return <OpportunitiesClient opportunities={mappedOpportunities} />;
}
