import { prisma } from "@/lib/db/prisma";
import { getAiService } from "@/lib/ai/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TaskStatus, TaskCreator, OpportunityStage } from "@prisma/client";

export async function runLeadQualificationWorkflow(tenantId: string, contactId: string) {
  console.log(`[WORKFLOW] Starting lead qualification for contact ${contactId}...`);

  // 1. Fetch Contact details & recent messages
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, tenantId },
    include: {
      conversations: {
        where: { channel: "WHATSAPP" },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
      opportunities: true,
    },
  });

  if (!contact) {
    console.error(`Contact ${contactId} not found in tenant ${tenantId}`);
    return;
  }

  // 2. Gather conversation text for context
  const whatsappConv = contact.conversations[0];
  const messagesText = whatsappConv
    ? whatsappConv.messages
        .map((m) => `${m.senderType}: ${m.content}`)
        .reverse()
        .join("\n")
    : "No message history.";

  // 3. Prompt Gemini to score the lead
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY. Skipping lead qualification workflow.");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze the following contact information and message history. 
Score this lead's business fit/qualification on a scale from 0 to 100.
High scores (70+) should represent leads with clear purchase intent, realistic budget signals, or immediate integration needs.
Low scores (<50) represent casual queries, spam, or poor business fit.

Contact Details:
- Name: ${contact.name}
- Email: ${contact.email || "N/A"}
- Phone: ${contact.phone || "N/A"}
- Source: ${contact.source || "N/A"}

Message History:
${messagesText}

Return a JSON object in this exact schema:
{
  "score": number,
  "reasoning": "A concise single-sentence summary of why this score was given."
}
`;

    console.log("[WORKFLOW] Invoking Gemini for lead scoring...");
    const response = await model.generateContent(prompt);
    const responseText = response.response.text();
    const result = JSON.parse(responseText);

    const score = Number(result.score) || 0;
    const reasoning = result.reasoning || "Scored by automated lead qualification.";

    console.log(`[WORKFLOW] Lead scored: ${score}/100. Reasoning: ${reasoning}`);

    // Update Contact tags in database
    const currentTags = contact.tags || [];
    const newTag = score >= 70 ? "qualified-lead" : "cold-lead";
    if (!currentTags.includes(newTag)) {
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          tags: [...currentTags.filter((t) => t !== "qualified-lead" && t !== "cold-lead"), newTag],
        },
      });
    }

    // 4. If score is >= 70, qualify opportunity and create task
    let opportunityId: string | null = null;
    let stageUpdated = false;

    if (score >= 70) {
      // Find or create an opportunity
      let opportunity = contact.opportunities[0];

      if (!opportunity) {
        // Create a new qualified opportunity
        opportunity = await prisma.opportunity.create({
          data: {
            tenantId,
            contactId,
            title: `AI Qualified deal: ${contact.name}`,
            stage: OpportunityStage.QUALIFIED,
            value: 100000, // Default 1 Lakh INR value estimate
            aiScore: score,
            aiNextBestAction: "Prepare product proposal and schedule scoping demo.",
          },
        });
        opportunityId = opportunity.id;
        stageUpdated = true;
      } else if (opportunity.stage === OpportunityStage.NEW) {
        // Update stage to qualified
        const updatedOpp = await prisma.opportunity.update({
          where: { id: opportunity.id },
          data: {
            stage: OpportunityStage.QUALIFIED,
            aiScore: score,
            aiNextBestAction: "Review qualification metrics and schedule scoping demo.",
          },
        });
        opportunityId = updatedOpp.id;
        stageUpdated = true;
      }

      // Create an action task for the business owner
      await prisma.task.create({
        data: {
          tenantId,
          contactId,
          opportunityId: opportunityId || undefined,
          title: `Follow up with qualified lead: ${contact.name} (Score: ${score})`,
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24 hours
          status: TaskStatus.PENDING,
          createdBy: TaskCreator.AI,
        },
      });
    }

    // 5. Log workflow execution
    await prisma.auditLog.create({
      data: {
        tenantId,
        actorType: "SYSTEM",
        action: "workflow.lead_qualification",
        entityType: "Contact",
        entityId: contactId,
        metadata: {
          score,
          reasoning,
          opportunityId,
          stageUpdated,
        },
      },
    });

    console.log("[WORKFLOW] Lead qualification workflow completed successfully.");
  } catch (error) {
    console.error("Error running lead qualification workflow:", error);
  }
}
