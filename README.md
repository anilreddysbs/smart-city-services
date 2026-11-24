# Smart City Service Intelligence Platform

A full-stack service marketplace that connects customers with local service professionals. The project combines worker discovery and booking workflows with matching signals, trust-related metrics, and administrative analytics.

## Core capabilities

### Customer and worker workflows

- Customers can discover service professionals, book work, and submit reviews.
- Workers can manage incoming requests, professional information, and performance details.
- Administrators can review professional registrations and access operational analytics.

### Matching and trust signals

The matching logic described in the project combines several signals:

- Historical ratings and reviews
- Worker trust score and service history
- Professional experience
- Location proximity

The interface can distinguish nearby professionals in search results.

### City analytics

The admin area includes dashboards for worker counts and service-category distribution. The project also includes demand-alert and community-subscription workflows, along with background polling for updated marketplace data.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express, JWT authentication, bcrypt |
| Database | PostgreSQL |
| Deployment configuration | Render |

## Repository layout

```text
frontend/  React client
backend/   Node.js API and migration scripts
database/  Database-related assets
docs/      Project documentation
render.yaml
```

## Local setup

### Prerequisites

- Node.js (v20 or newer recommended)
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/anilreddysbs/smart-city-services.git
cd smart-city-services
```

### 2. Install dependencies

```bash
npm --prefix backend install
npm --prefix frontend install
```

### 3. Configure the database

Start PostgreSQL and configure the connection string in the backend environment:

```dotenv
POSTGRES_URL=postgresql://USER:PASSWORD@localhost:5432/smart_city_services
```

Use your own local database credentials. Do not commit secrets.

### 4. Initialize the database and start the backend

The repository includes sequential migration scripts:

```bash
node backend/init_db.mjs
node backend/migrate_v2.mjs
node backend/migrate_v3.mjs
node backend/migrate_v4.mjs
node backend/server.js
```

### 5. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

### 6. Create an administrator account

Use the repository's admin setup script:

```bash
node backend/create_admin.mjs ADMIN_EMAIL ADMIN_PASSWORD
```

## Deployment

A Render configuration is included in `render.yaml`. Review the service settings and provide the required environment variables in the hosting platform before deploying.

