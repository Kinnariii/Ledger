import { getOpportunities } from "@/lib/db/scoped";
import OpportunitiesClient from "./OpportunitiesClient";

// TEMP: replace with session tenantId once Phase B auth lands
const TEMP_TENANT_ID = "tenant-a";

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities(TEMP_TENANT_ID);

  // Cast stages to match client component types if needed
  const mappedOpportunities = opportunities.map((opp) => ({
    ...opp,
    stage: opp.stage as any,
  }));

  return <OpportunitiesClient opportunities={mappedOpportunities} />;
}
