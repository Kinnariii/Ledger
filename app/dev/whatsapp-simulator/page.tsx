import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import SimulatorClient from "./SimulatorClient";

export default async function WhatsappSimulatorPage() {
  // Gated behind development environment
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  // Fetch all existing contacts in the system to populate selection list
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  });

  return <SimulatorClient initialContacts={contacts} />;
}
