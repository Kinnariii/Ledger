# Ledger — AI Employee Workspace

Ledger is a multi-tenant business operations workspace designed around the metaphor of the **"AI Employee's Paper Trail."** It rejects standard digital ephemeral designs in favor of **Tactile Minimalism** and **Functional Brutalism**, featuring high-contrast typography, hairline borders, and warm paper stocks.

## 🎨 Design System: Bureau Documental
- **Color Palette**: 
  - **Surface**: Warm paper tones (`#fff8f3`, `#f6ece2`) with subtle noise overlays.
  - **Primary (Stamp Blue)**: Deep fountain pen ink (`#022448`) for stamps and major actions.
  - **Secondary (Ledger Green)**: Mint and forest green (`#2d694d`) for success metrics and growth indicators.
  - **Tertiary (Amber)**: Heavy wood-amber tones (`#391d00`) for warnings/draft states.
- **Elevation & Layout**: No shadows. Depth is purely tonal. Clean 1px hairline borders (`#d8d0c0`) define the bounds of index cards, memo slips, and cabinet layouts.
- **Typography Scale**: Serif display headlines (**Newsreader**), clean functional body text (**Inter**), and typewriter-style technical metadata (**IBM Plex Mono**).

## 🚀 Key Features

1. **Dashboard Home**:
   - Live KPI overview (Active Pipeline, Opportunities, Pending Tasks).
   - AI Morning Briefing card presenting daily priorities and alerts.
   - Recent activity timeline detailing cross-channel notifications.
2. **CRM Contacts Directory**:
   - Comprehensive filterable registry with source categories (Inbound, Referral, WhatsApp, Manual).
   - Fast full-text search.
3. **Opportunities Pipeline**:
   - Kanban-style pipeline (New, Qualified, Proposal, Won, Lost).
   - Real-time valuation metrics (formatted in standard Indian numbering `₹`).
   - AI Next-Best-Action recommendations and deal health scores.
4. **Unified Inbox**:
   - Live message logs aggregate WhatsApp chats, Email threads, and Call transcripts in a unified panel.
   - Sentiment indicators, intent categorization, and automated response suggestions.
5. **AI Chat Hub**:
   - Fully interactive split-panel chat interface.
   - Simulated AI reasoning cycle with keyword-triggered custom outputs.
   - "New Chat" sessions support for separate workspaces.
6. **Workflows & Automation**:
   - Visual dashboard for workflow triggers and run history.

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19
- **Styles**: Tailwind CSS v4 & custom CSS tokens
- **Database Layer**: Prisma v7 ORM (PostgreSQL ready)
- **Validation**: Zod schema validation
- **Dev Tooling**: Vitest test runner, ESLint code checker

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the required parameters (e.g., PostgreSQL connection details, JWT keys):
```bash
cp .env.example .env
```

### 3. Run Database Migrations (Optional)
Generate the Prisma Client and migrate the PostgreSQL schemas:
```bash
npx prisma generate
npm run db:migrate
npm run db:seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application running.

### 5. Build for Production
Create an optimized production bundle:
```bash
npm run build
```
