/**
 * Ledger — Database Seed Script
 * ==============================
 * Seeds 2 tenants with realistic CRM data for:
 * 1. Demo realism — the app looks populated and real
 * 2. Tenant isolation testing — Tenant A's data must never leak to Tenant B
 * 3. AI agent context — enough data for meaningful AI conversations
 *
 * Run with: npx prisma db seed
 * (requires "prisma.seed" in package.json — see setup instructions)
 */

import { PrismaClient, UserRole, OpportunityStage, Channel, Sentiment, MessageDirection, SenderType, TaskStatus, TaskCreator, ActorType, AiChatRole } from '@prisma/client';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 Seeding Ledger database...');

  // ── Clean existing data (idempotent re-seed) ───────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.aiChatMessage.deleteMany();
  await prisma.aiChatConversation.deleteMany();
  await prisma.task.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // ══════════════════════════════════════════════════════════════════════
  // TENANT A — "Acme Digital Solutions" (an AI consultancy)
  // ══════════════════════════════════════════════════════════════════════
  const tenantA = await prisma.tenant.create({
    data: {
      id: 'tenant-a',
      name: 'Acme Digital Solutions',
      businessType: 'AI Consultancy',
      onboardingData: {
        goals: ['Increase lead conversion', 'Automate follow-ups', 'Track deal pipeline'],
        industry: 'Technology & AI Consulting',
        teamSize: '5-15',
        targetAudience: 'SMBs looking for AI integration',
        revenue: '$500K-$1M annually',
      },
    },
  });

  const userA = await prisma.user.create({
    data: {
      id: 'user-a',
      tenantId: tenantA.id,
      googleId: 'google-id-tenant-a-owner',
      email: 'kinnari@acmedigital.com',
      name: 'Kinnari Patel',
      role: UserRole.OWNER,
    },
  });

  // Contacts for Tenant A
  const contactsA = await Promise.all([
    prisma.contact.create({
      data: {
        id: 'contact-a1',
        tenantId: tenantA.id,
        name: 'Rahul Sharma',
        phone: '+919876543210',
        email: 'rahul@techstartup.in',
        tags: ['hot-lead', 'ai-interested'],
        source: 'inbound',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a2',
        tenantId: tenantA.id,
        name: 'Priya Mehta',
        phone: '+919876543211',
        email: 'priya@growthco.com',
        tags: ['enterprise', 'decision-maker'],
        source: 'referral',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a3',
        tenantId: tenantA.id,
        name: 'Aditya Kumar',
        phone: '+919876543212',
        email: 'aditya@retailchain.com',
        tags: ['retail', 'new'],
        source: 'whatsapp',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a4',
        tenantId: tenantA.id,
        name: 'Sneha Reddy',
        phone: '+919876543213',
        email: 'sneha@healthtech.io',
        tags: ['healthcare', 'technical'],
        source: 'inbound',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a5',
        tenantId: tenantA.id,
        name: 'Vikram Singh',
        phone: '+919876543214',
        email: 'vikram@logisticspro.com',
        tags: ['logistics', 'enterprise'],
        source: 'manual',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a6',
        tenantId: tenantA.id,
        name: 'Meera Joshi',
        phone: '+919876543215',
        email: 'meera@eduplatform.com',
        tags: ['education', 'hot-lead'],
        source: 'inbound',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a7',
        tenantId: tenantA.id,
        name: 'Arjun Nair',
        phone: '+919876543216',
        email: 'arjun@fintechapp.in',
        tags: ['fintech', 'technical'],
        source: 'referral',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-a8',
        tenantId: tenantA.id,
        name: 'Deepa Krishnan',
        phone: '+919876543217',
        email: 'deepa@mediahouse.tv',
        tags: ['media', 'content'],
        source: 'whatsapp',
      },
    }),
  ]);

  // Opportunities for Tenant A — spread across pipeline stages
  await Promise.all([
    prisma.opportunity.create({
      data: {
        id: 'opp-a1',
        tenantId: tenantA.id,
        contactId: contactsA[0].id, // Rahul
        title: 'AI Chatbot for TechStartup.in',
        stage: OpportunityStage.QUALIFIED,
        value: 45000,
        aiNextBestAction: 'Schedule a live demo showing WhatsApp integration capabilities.',
        aiScore: 85,
      },
    }),
    prisma.opportunity.create({
      data: {
        id: 'opp-a2',
        tenantId: tenantA.id,
        contactId: contactsA[1].id, // Priya
        title: 'Enterprise CRM Integration for GrowthCo',
        stage: OpportunityStage.PROPOSAL,
        value: 125000,
        aiNextBestAction: 'Send revised proposal with updated pricing tier for 50+ users.',
        aiScore: 92,
      },
    }),
    prisma.opportunity.create({
      data: {
        id: 'opp-a3',
        tenantId: tenantA.id,
        contactId: contactsA[2].id, // Aditya
        title: 'Inventory AI for RetailChain',
        stage: OpportunityStage.NEW,
        value: 30000,
        aiScore: 55,
      },
    }),
    prisma.opportunity.create({
      data: {
        id: 'opp-a4',
        tenantId: tenantA.id,
        contactId: contactsA[3].id, // Sneha
        title: 'Patient Triage AI for HealthTech',
        stage: OpportunityStage.WON,
        value: 85000,
        aiNextBestAction: 'Begin implementation kickoff. Schedule onboarding call.',
        aiScore: 98,
      },
    }),
    prisma.opportunity.create({
      data: {
        id: 'opp-a5',
        tenantId: tenantA.id,
        contactId: contactsA[4].id, // Vikram
        title: 'Route Optimization ML for LogisticsPro',
        stage: OpportunityStage.LOST,
        value: 60000,
        aiNextBestAction: 'Follow up in Q3 when budget cycle resets.',
        aiScore: 40,
      },
    }),
    prisma.opportunity.create({
      data: {
        id: 'opp-a6',
        tenantId: tenantA.id,
        contactId: contactsA[5].id, // Meera
        title: 'AI Tutoring Platform for EduPlatform',
        stage: OpportunityStage.QUALIFIED,
        value: 55000,
        aiScore: 78,
      },
    }),
  ]);

  // Conversations + Messages for Tenant A
  // WhatsApp conversation with Rahul
  const convA1 = await prisma.conversation.create({
    data: {
      id: 'conv-a1',
      tenantId: tenantA.id,
      contactId: contactsA[0].id,
      channel: Channel.WHATSAPP,
      aiSummary: 'Rahul inquired about AI chatbot pricing and integration timeline. Expressed urgency due to upcoming product launch. Positive tone throughout.',
      sentiment: Sentiment.POSITIVE,
      intent: 'pricing inquiry',
      recommendedNextAction: 'Send detailed pricing breakdown and schedule a 30-min demo call.',
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convA1.id, direction: MessageDirection.IN, content: 'Hi, I saw your AI chatbot demos. We need something similar for our customer support. What would it cost for a startup?', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-28T10:30:00Z') },
      { conversationId: convA1.id, direction: MessageDirection.OUT, content: 'Hi Rahul! Great to hear from you. Our startup packages start at ₹3.5L for a basic WhatsApp-integrated chatbot. I can put together a detailed quote. When is your launch?', senderType: SenderType.AGENT, createdAt: new Date('2026-06-28T10:45:00Z') },
      { conversationId: convA1.id, direction: MessageDirection.IN, content: 'Launch is mid-August. We need it handling at least 500 conversations/day. Can you do a demo this week?', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-28T11:00:00Z') },
      { conversationId: convA1.id, direction: MessageDirection.OUT, content: 'Absolutely! I have slots on Thursday 2pm or Friday 11am. Which works better? I\'ll prepare a demo with your branding.', senderType: SenderType.AGENT, createdAt: new Date('2026-06-28T11:15:00Z') },
      { conversationId: convA1.id, direction: MessageDirection.IN, content: 'Thursday 2pm works perfectly. Looking forward to it!', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-28T11:20:00Z') },
    ],
  });

  // Email conversation with Priya
  const convA2 = await prisma.conversation.create({
    data: {
      id: 'conv-a2',
      tenantId: tenantA.id,
      contactId: contactsA[1].id,
      channel: Channel.EMAIL,
      aiSummary: 'Priya from GrowthCo is evaluating enterprise CRM solutions. She requested a detailed proposal with SSO and API integration details. Decision expected by end of month.',
      sentiment: Sentiment.POSITIVE,
      intent: 'enterprise evaluation',
      recommendedNextAction: 'Send revised proposal with SSO architecture diagram and API documentation.',
    },
  });

  await prisma.message.createMany({
    data: [
      // MOCKED: Real email ingestion via IMAP/webhook (e.g. Postmark/SendGrid inbound) would replace this seed.
      // The data model and UI are fully real — only the email transport is simulated.
      { conversationId: convA2.id, direction: MessageDirection.IN, content: 'Subject: Re: Enterprise CRM Proposal\n\nHi team,\n\nWe reviewed the initial proposal. A few questions:\n1. Does the CRM support SAML SSO?\n2. What\'s the API rate limit for bulk imports?\n3. Can we get a pilot for our sales team of 50?\n\nPlease send an updated proposal by Friday.\n\nBest,\nPriya Mehta\nVP of Sales, GrowthCo', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-26T09:00:00Z'), metadata: { subject: 'Re: Enterprise CRM Proposal', from: 'priya@growthco.com' } },
      { conversationId: convA2.id, direction: MessageDirection.OUT, content: 'Subject: Re: Re: Enterprise CRM Proposal\n\nHi Priya,\n\nGreat questions! Here are quick answers:\n1. Yes — SAML 2.0 SSO with Okta/Azure AD\n2. 10,000 records/min via bulk API\n3. Absolutely — we offer a 30-day enterprise pilot\n\nI\'ll have the updated proposal with architecture diagrams to you by Thursday EOD.\n\nBest,\nKinnari', senderType: SenderType.AGENT, createdAt: new Date('2026-06-26T14:30:00Z'), metadata: { subject: 'Re: Re: Enterprise CRM Proposal', to: 'priya@growthco.com' } },
    ],
  });

  // Call log with Aditya
  const convA3 = await prisma.conversation.create({
    data: {
      id: 'conv-a3',
      tenantId: tenantA.id,
      contactId: contactsA[2].id,
      channel: Channel.CALL,
      aiSummary: 'Discovery call with Aditya about inventory management AI. He has 200+ SKUs and struggles with demand forecasting. Budget is limited but willing to start with a POC.',
      sentiment: Sentiment.NEUTRAL,
      intent: 'discovery call',
      recommendedNextAction: 'Send POC proposal focused on top 50 SKUs with demand forecasting.',
    },
  });

  await prisma.message.createMany({
    data: [
      // MOCKED: Real integration would use Twilio Voice webhooks + transcription.
      // The data model and timeline UI are fully real — only the call transcription source is simulated.
      { conversationId: convA3.id, direction: MessageDirection.IN, content: '[Call Transcript — 12 min]\n\nAditya: We have about 200 SKUs across 5 warehouses. The main pain point is demand forecasting — we either overstock or run out.\n\nKinnari: How are you doing forecasting today?\n\nAditya: Mostly Excel. Our team lead updates it weekly but it\'s always behind.\n\nKinnari: We could start with a POC on your top 50 SKUs. Our ML model typically improves forecast accuracy by 25-30% within the first month.\n\nAditya: That sounds promising. What would a POC cost?\n\nKinnari: For a 3-month POC covering 50 SKUs, we\'re looking at ₹2.5L including setup and training.\n\nAditya: Let me discuss with my partner and get back to you this week.', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-29T15:00:00Z'), metadata: { duration: '12:34', callType: 'inbound' } },
    ],
  });

  // WhatsApp conversation with Meera
  const convA4 = await prisma.conversation.create({
    data: {
      id: 'conv-a4',
      tenantId: tenantA.id,
      contactId: contactsA[5].id,
      channel: Channel.WHATSAPP,
      aiSummary: 'Meera is interested in an AI tutoring platform for K-12 students. She needs multilingual support (Hindi + English). Very enthusiastic, wants to move fast.',
      sentiment: Sentiment.POSITIVE,
      intent: 'product inquiry',
      recommendedNextAction: 'Share case study of similar EdTech implementation and propose a scoping call.',
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convA4.id, direction: MessageDirection.IN, content: 'Hey! I heard about your AI tutoring solution from a friend. We run an ed-tech platform and want to add AI-powered tutoring for our students.', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-30T08:00:00Z') },
      { conversationId: convA4.id, direction: MessageDirection.OUT, content: 'Hi Meera! That\'s exciting. We\'ve built AI tutoring systems for a few ed-tech platforms. What subjects and grade levels are you targeting?', senderType: SenderType.AGENT, createdAt: new Date('2026-06-30T08:30:00Z') },
      { conversationId: convA4.id, direction: MessageDirection.IN, content: 'Math and Science for grades 6-10. We need it to work in both Hindi and English. Is that possible?', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-30T09:00:00Z') },
      { conversationId: convA4.id, direction: MessageDirection.OUT, content: 'Yes! Multilingual is one of our strengths. Let me share a case study and we can set up a scoping call this week. 📚', senderType: SenderType.AI, createdAt: new Date('2026-06-30T09:15:00Z') },
    ],
  });

  // Tasks for Tenant A
  await prisma.task.createMany({
    data: [
      { tenantId: tenantA.id, contactId: contactsA[0].id, title: 'Prepare demo environment for Rahul', dueAt: new Date('2026-07-03T14:00:00Z'), status: TaskStatus.PENDING, createdBy: TaskCreator.AI },
      { tenantId: tenantA.id, contactId: contactsA[1].id, opportunityId: 'opp-a2', title: 'Send revised enterprise proposal to Priya', dueAt: new Date('2026-07-04T18:00:00Z'), status: TaskStatus.PENDING, createdBy: TaskCreator.USER },
      { tenantId: tenantA.id, contactId: contactsA[2].id, title: 'Follow up with Aditya on POC decision', dueAt: new Date('2026-07-05T10:00:00Z'), status: TaskStatus.PENDING, createdBy: TaskCreator.AI },
      { tenantId: tenantA.id, contactId: contactsA[5].id, title: 'Share ed-tech case study with Meera', dueAt: new Date('2026-07-02T09:00:00Z'), status: TaskStatus.PENDING, createdBy: TaskCreator.AI },
      { tenantId: tenantA.id, title: 'Review Q2 pipeline report', dueAt: new Date('2026-06-30T17:00:00Z'), status: TaskStatus.DONE, createdBy: TaskCreator.USER },
    ],
  });

  // AI Chat Conversation for Tenant A (demo the agent)
  const aiChat = await prisma.aiChatConversation.create({
    data: {
      id: 'aichat-a1',
      tenantId: tenantA.id,
      userId: userA.id,
      title: 'Morning Briefing',
    },
  });

  await prisma.aiChatMessage.createMany({
    data: [
      { aiChatConversationId: aiChat.id, role: AiChatRole.USER, content: 'Good morning! What\'s my day looking like?', createdAt: new Date('2026-07-01T09:00:00Z') },
      { aiChatConversationId: aiChat.id, role: AiChatRole.ASSISTANT, content: 'Good morning, Kinnari! Here\'s your Ledger briefing:\n\n📋 **3 tasks due this week:**\n- Prepare demo for Rahul Sharma (Thu 2pm)\n- Send revised proposal to Priya Mehta (Fri EOD)\n- Follow up with Aditya Kumar on POC\n\n💰 **Pipeline Update:**\n- 2 qualified opportunities worth ₹1L total\n- GrowthCo deal (₹1.25L) is in proposal stage — highest priority\n\n🔥 **AI Alert:** Rahul\'s demo is in 2 days and you haven\'t shared the prep materials yet. Want me to draft a pre-demo email?', createdAt: new Date('2026-07-01T09:00:30Z') },
    ],
  });

  // Audit logs for Tenant A
  await prisma.auditLog.createMany({
    data: [
      { tenantId: tenantA.id, actorType: ActorType.SYSTEM, action: 'tenant.create', entityType: 'Tenant', entityId: tenantA.id, metadata: { source: 'seed' } },
      { tenantId: tenantA.id, actorType: ActorType.AI, actorId: 'ledger-agent', action: 'task.create', entityType: 'Task', metadata: { title: 'Prepare demo environment for Rahul', reason: 'Auto-created after qualifying lead' } },
      { tenantId: tenantA.id, actorType: ActorType.AI, actorId: 'ledger-agent', action: 'opportunity.qualify', entityType: 'Opportunity', entityId: 'opp-a1', metadata: { score: 85, reason: 'High intent signals: urgent timeline, budget confirmed' } },
    ],
  });

  // ══════════════════════════════════════════════════════════════════════
  // TENANT B — "Beta Inc" (a separate business for isolation testing)
  // ══════════════════════════════════════════════════════════════════════
  const tenantB = await prisma.tenant.create({
    data: {
      id: 'tenant-b',
      name: 'Beta Inc',
      businessType: 'E-commerce',
      onboardingData: {
        goals: ['Manage customer inquiries', 'Track order-related leads'],
        industry: 'E-commerce & Retail',
        teamSize: '1-5',
      },
    },
  });

  await prisma.user.create({
    data: {
      id: 'user-b',
      tenantId: tenantB.id,
      googleId: 'google-id-tenant-b-owner',
      email: 'owner@betainc.com',
      name: 'Tenant B Owner',
      role: UserRole.OWNER,
    },
  });

  // Contacts for Tenant B (different data, proves isolation)
  const contactsB = await Promise.all([
    prisma.contact.create({
      data: {
        id: 'contact-b1',
        tenantId: tenantB.id,
        name: 'Customer Alpha',
        phone: '+911234567890',
        email: 'alpha@customer.com',
        tags: ['vip'],
        source: 'manual',
      },
    }),
    prisma.contact.create({
      data: {
        id: 'contact-b2',
        tenantId: tenantB.id,
        name: 'Customer Beta',
        phone: '+911234567891',
        email: 'beta@customer.com',
        tags: ['new'],
        source: 'inbound',
      },
    }),
  ]);

  await prisma.opportunity.create({
    data: {
      id: 'opp-b1',
      tenantId: tenantB.id,
      contactId: contactsB[0].id,
      title: 'Bulk Order — 500 units',
      stage: OpportunityStage.NEW,
      value: 75000,
    },
  });

  const convB1 = await prisma.conversation.create({
    data: {
      id: 'conv-b1',
      tenantId: tenantB.id,
      contactId: contactsB[0].id,
      channel: Channel.WHATSAPP,
      aiSummary: 'Customer Alpha inquired about bulk pricing for 500 units.',
      sentiment: Sentiment.POSITIVE,
      intent: 'bulk order inquiry',
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: convB1.id, direction: MessageDirection.IN, content: 'Hi, I need pricing for 500 units of SKU-2045.', senderType: SenderType.CUSTOMER, createdAt: new Date('2026-06-30T12:00:00Z') },
      { conversationId: convB1.id, direction: MessageDirection.OUT, content: 'Hello! For 500 units we can offer 15% bulk discount. I\'ll send a formal quote.', senderType: SenderType.AGENT, createdAt: new Date('2026-06-30T12:30:00Z') },
    ],
  });

  console.log('✅ Seed complete!');
  console.log(`   Tenant A: "${tenantA.name}" — ${contactsA.length} contacts, 6 opportunities, 4 conversations`);
  console.log(`   Tenant B: "${tenantB.name}" — ${contactsB.length} contacts, 1 opportunity, 1 conversation`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
