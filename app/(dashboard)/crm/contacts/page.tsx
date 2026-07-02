import { getContacts } from "@/lib/db/scoped";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ContactsClient from "./ContactsClient";

export default async function ContactsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const contacts = await getContacts(session.tenantId);

  return <ContactsClient contacts={contacts} />;
}
