import { getContacts } from "@/lib/db/scoped";
import ContactsClient from "./ContactsClient";

// TEMP: replace with session tenantId once Phase B auth lands
const TEMP_TENANT_ID = "tenant-a";

export default async function ContactsPage() {
  const contacts = await getContacts(TEMP_TENANT_ID);

  return <ContactsClient contacts={contacts} />;
}
