# Ledger — AI Employee Workspace

Ledger is a multi-tenant business operations workspace designed around the metaphor of the **"AI Employee's Paper Trail."** It rejects standard digital ephemeral designs in favor of **Tactile Minimalism** and **Functional Brutalism**, featuring high-contrast typography, hairline borders, and warm paper stocks.

---

## 🎨 Design System: Bureau Documental
- **Color Palette**: 
  - **Surface**: Warm paper tones (`#fff8f3`, `#f6ece2`) with subtle noise overlays.
  - **Primary (Stamp Blue)**: Deep fountain pen ink (`#022448`) for stamps and major actions.
  - **Secondary (Ledger Green)**: Mint and forest green (`#2d694d`) for success metrics and growth indicators.
  - **Tertiary (Amber)**: Heavy wood-amber tones (`#391d00`) for warnings/draft states.
- **Elevation & Layout**: No shadows. Depth is purely tonal. Clean 1px hairline borders (`#d8d0c0`) define the bounds of index cards, memo slips, and cabinet layouts.
- **Typography Scale**: Serif display headlines (**Newsreader**), clean functional body text (**Inter**), and typewriter-style technical metadata (**IBM Plex Mono**).

---

## 🚀 Key Features

1. **Dashboard Home**:
   - Live KPI overview (Active Pipeline, Open Opportunities, Pending Tasks, Contact Count) pulled dynamically from the database.
   - AI Morning Briefing card displaying daily priorities and alerts.
   - Recent activity timeline detailing WhatsApp, email, call log, and AI actions.
2. **CRM Contacts Directory**:
   - Comprehensive filterable registry with source categories (Inbound, Referral, WhatsApp, Manual).
   - Fast full-text search.
3. **Opportunities Pipeline**:
   - Kanban-style pipeline (New, Qualified, Proposal, Won, Lost) with real-time valuation metrics (formatted in standard Indian numbering `₹`).
   - AI Next-Best-Action recommendations and deal health scores.
4. **Unified Inbox**:
   - Live message logs aggregate WhatsApp chats, Email threads, and Call transcripts in a unified panel.
   - Sentiment indicators, intent categorization, and automated response suggestions.
5. **AI Chat Hub**:
   - Fully interactive split-panel chat interface.
   - Real Gemini AI agent with text streaming and 5 functional tools (contacts search, task creation, opportunity updates, mock WhatsApp messaging, and metric aggregation).
   - Live AI Reasoning Path and Tool calls log displayed directly under each response.
6. **Workflows & Automation**:
   - Visual dashboard for workflow triggers and run history.

---

## 🔒 Security & Multi-Tenancy

- **Scoped Query Isolation**: Data access is managed through `lib/db/scoped.ts`. Every query structurally requires a `tenantId`, guaranteeing that no tenant can read or write to another tenant's workspace.
- **Google OAuth PKCE**: Uses cryptographically secure base64url-encoded code verifiers and SHA-256 challenges stored in `httpOnly` secure cookies.
- **Refresh Token Rotation**: Implements DB-tracked token rotation. If a revoked refresh token is reused (indicating session theft), the entire token family is immediately invalidated, cookies are cleared, and a security alert is recorded in the `AuditLog`.
- **Request Proxy (Next.js 16)**: Implemented in `proxy.ts` (which officially replaces `middleware.ts` in Next.js 16). It intercepts requests to dashboard paths, validates access tokens, handles silent token rotation, and injects session headers.

---

## 🤖 AI Agent Tools & Automation

Ledger integrates the Google Gemini API with the following database-backed tools:
- `search_contacts(query)`: Finds leads/contacts by name or email.
- `create_task(title, dueAt, contactId, opportunityId)`: Schedules action items.
- `update_opportunity(id, stage, value)`: Updates deal stage and value.
- `send_whatsapp(contactId, content)`: Sends mock WhatsApp messages and appends to the conversation.
- `fetch_business_metrics()`: Calculates active pipeline totals and task counts.

*Every tool execution is strictly tenant-scoped and writes a detailed log entry to the `AuditLog` table.*

### WhatsApp Automation Workflow
An incoming text message webhook (`/api/webhooks/whatsapp`) logs the conversation and triggers the **Lead Qualification Workflow**:
- Prompts Gemini to score the lead (0-100) and draft a brief rationale.
- Updates the contact's tags and sets opportunity stage to `QUALIFIED` if score > 70.
- Creates a follow-up task and log audit records automatically.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16.2.9 (App Router, Turbopack)
- **Runtime**: React 19.2.4
- **Styles**: Tailwind CSS v4 & custom CSS tokens
- **Database Layer**: Prisma v7 ORM (PostgreSQL with PG Driver Adapter)
- **AI Engine**: Google `@google/generative-ai` SDK
- **Validation**: Zod schema validation
- **Testing**: Vitest test runner (JSDOM environment)

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (local or cloud e.g. Neon)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the required parameters:
```bash
# Database
DATABASE_URL="postgresql://neondb_owner:xxxx@ep-something.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT Secret
JWT_SECRET="random-256-bit-hex-string"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-flash-latest"

# WhatsApp Webhook
WHATSAPP_VERIFY_TOKEN="ledger_verify_token_default"
```

### 3. Run Database Migrations & Seeding
Create schemas and load mock demo data:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🧪 Testing

Ledger contains 8 unit and integration tests verifying authentication rotation, reuse hijack alerts, database isolation, and AI tools mocking.

Run the test suite:
```bash
npm run test
```
