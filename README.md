# Smart City Service Intelligence Platform

Welcome to the **Smart City Services** platform. This project has evolved from a simple service marketplace into a highly advanced, fully integrated **Smart City Intelligence System**. It connects customers with rigorously verified professionals (electricians, painters, maintenance workers) while dynamically utilizing telemetry, smart location proximity matching, and mathematical trust algorithms to surface the absolute best talent.

## 🚀 Core Features & Capabilities

### 1. Smart Matching Engine
Our advanced `MatchScore` algorithm intrinsically computes the optimal worker for a customer using:
- **Average Ratings & Reviews**: The historical baseline of a worker's performance.
- **Trust Score**: A dynamically shifting backend metric reacting to job completions, abandoned contracts, and dispute history.
- **Experience Layer**: Factored directly into weighting to reward tenured professionals.
- **Location Proximity Intelligence**: Active location coordinate matching. If a logging customer and worker share the same city/location, the engine instantly spots it, awards a massive MatchScore bonus, and tags the Worker with a distinct "Nearest" badge.

### 2. Multi-Tiered User Architecture
*   **Customers**: Create accounts, set their physical locations, find local talent, book jobs, deploy long-term Community Subscriptions, and leave honest service reviews.
*   **Workers**: Manage incoming job pipeline requests, handle professional certifications, and maintain their Worker Performance Dashboards tracking total volume, rating averages, and trust percentiles.
*   **Admins**: Powerful system administration securing the marketplace. Admins manually verify pending professional registrations and own access to the Centralized City Intelligence Analytics.

### 3. V3 City Intelligence & Analytics
*   **Market Dashboards (Admin)**: Visual metrics driven by `recharts` presenting aggregated Live Worker counts, Service Category Distribution (Pie Charts), and Predictive Service Demand Forecasting (Bar Charts).
*   **Worker Demand Alerts**: Active telemetry generation notifying specific pools of workers (e.g., Plumbers or Electricians) automatically when surging local service requests are identified.
*   **Community Subscriptions**: Specialized CRM module allowing apartment blocks and community centers to lock-in standard maintenance SLA contracts (monthly, quarterly) rather than booking per job. 
*   **Background Live Polling**: Deep systemic JavaScript orchestration allowing all marketplace listings and dashboards to natively update and reload locally without the user refreshing their browser.

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite), React Router v6, Axios, Recharts (for dynamic dashboard visualizations)
*   **Backend**: Node.js, Express.js, JWT Authentication, bcryptJS
*   **Database**: PostgreSQL
*   **DevOps/Deployment**: Render (Fully auto-deployed with robust sequential pipeline migrations)

## 📂 Architecture & Pipeline

The system is split functionally between `/frontend` (the React client) and `/backend` (the API Engine).

**Database Migration Pipeline:**
The backend is designed strictly to withstand scaling through non-destructive `.mjs` migrations dynamically triggered during boot sequences via the `render.yaml` startup commands:
*   `init_db.mjs` - Foundational Users, Bookings, Ratings, and Workers schema.
*   `migrate_v2.mjs` - Reputation Ledgers, Worker Certifications, and Trust Score tracking fields.
*   `migrate_v3.mjs` - Active Location schema tracking for precision matchmaking.
*   `migrate_v4.mjs` - V3 Analytics telemetry architecture including Predicted Demand, Subscription tracking, and discrete Alert hubs.

## 🔑 Installation & Execution

### Prerequisites
- Node.js (v20+ recommended)
- Local PostgreSQL instance

### Local Build Steps
1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/anilreddysbs/smart-city-services.git
   cd smart-city-services
   \`\`\`

2. **Database Initialization:**
   Ensure PostgreSQL is running locally. Set up the environment variable by appending `POSTGRES_URL=postgresql://user:pass@localhost:5432/smart_city_services` to your local `.env` inside `/backend` or the broader console instance.

3. **Install Dependencies:**
   \`\`\`bash
   npm --prefix backend install
   npm --prefix frontend install
   \`\`\`

4. **Launch Application:**
   Run the sequential boot command (similar to our Render pipeline) to apply schema migrations safely and engage the application:
   \`\`\`bash
   # Run Migrations & Boot Server
   node backend/init_db.mjs && node backend/migrate_v2.mjs && node backend/migrate_v3.mjs && node backend/migrate_v4.mjs && node backend/server.js
   
   # Locally Boot the Frontend
   cd frontend && npm run dev
   \`\`\`

5. **Generate an Administrator Context:**
   Run our built-in CLI module to synthesize an offline Admin User:
   \`\`\`bash
   node backend/create_admin.mjs [admin_email] [admin_password]
   \`\`\`

*Authored by Antigravity AI Engine*
