# Smart City Services Architecture Overview

## System shape

Smart City Services is a full-stack marketplace for matching customers with verified workers.

- `frontend/` is a Vite + React single-page app.
- `backend/` is an Express API that handles auth, bookings, workers, ratings, alerts, analytics, and subscriptions.
- `database/` contains the original schema reference, while the real PostgreSQL shape is evolved through backend migration scripts.
- `render.yaml` describes the hosted deployment flow.

## Tech stack

### Frontend

- React 18
- React Router 6
- TanStack Query
- Axios
- React Toastify
- React Icons
- Vite

### Backend

- Node.js
- Express
- PostgreSQL via `pg`
- JWT authentication
- `bcryptjs` for password hashing
- `express-rate-limit` for auth throttling
- Joi for request validation

### Deployment and operations

- Render for deployment
- Environment-driven configuration for API origin and JWT secret
- Database bootstrapping and schema evolution through `.mjs` migration scripts

## High-level request flow

1. A user registers or logs in through the React app.
2. The backend verifies credentials and sets an `httpOnly` session cookie.
3. The frontend stores only the non-sensitive user profile needed for route/UI decisions.
4. Customers browse worker profiles and create bookings.
5. The backend stores the booking, broadcasts alerts to matching verified workers, and exposes the booking in worker queues.
6. Workers accept, decline, or complete jobs through authenticated booking status transitions.
7. Customers track current and historical bookings and can submit ratings after completion.

## Main backend modules

### Entry and infrastructure

- `backend/server.js`
  - Express bootstrap
  - CORS policy
  - JSON parsing
  - route mounting
- `backend/database.js`
  - PostgreSQL pool setup
- `backend/middleware/`
  - auth, validation, error handling
- `backend/utils/`
  - auth helpers and logging

### Domain controllers and routes

- `backend/controllers/authController.js`
  - register, login, logout, profile
- `backend/controllers/bookingController.js`
  - create bookings
  - customer booking history
  - worker job queue
  - booking status transitions
- `backend/controllers/workerController.js`
  - worker listing, detail, filters, matching
- `backend/controllers/ratingController.js`
  - post-service ratings and review flow
- `backend/controllers/alertController.js`
  - worker alert feed and admin alert generation
- `backend/controllers/adminController.js`
  - admin verification and moderation actions
- `backend/controllers/analyticsController.js`
  - dashboard metrics
- `backend/controllers/subscriptionController.js`
  - recurring community support contracts
- `backend/controllers/performanceController.js`
  - worker performance views

### Data evolution

- `backend/init_db.mjs`
  - base schema bootstrap
- `backend/migrate_v*.mjs`
  - incremental schema upgrades for trust, locations, alerts, analytics, bookings, and subscriptions

## Main frontend modules

### Routing and shell

- `frontend/src/App.jsx`
  - route graph and role-gated pages
- `frontend/src/components/Navbar.jsx`
  - top navigation, logout, language selector
- `frontend/src/components/DashboardLayout.jsx`
  - role-aware dashboard shell
- `frontend/src/services/api.js`
  - shared Axios client and auth failure handling

### Customer-facing pages

- `frontend/src/pages/Home.jsx`
  - landing experience
- `frontend/src/pages/WorkerListing.jsx`
  - searchable worker directory
- `frontend/src/pages/WorkerProfile.jsx`
  - public/role-aware worker profile
- `frontend/src/pages/Booking.jsx`
  - multi-step booking wizard
- `frontend/src/pages/CustomerDashboard.jsx`
  - active bookings, history, ratings
- `frontend/src/pages/CommunitySubscriptionsPage.jsx`
  - recurring support plans

### Worker-facing pages

- `frontend/src/pages/WorkerDashboard.jsx`
  - incoming requests and accepted schedule
- `frontend/src/pages/WorkerPerformanceDashboard.jsx`
  - performance and trust insights

### Shared account/admin pages

- `frontend/src/pages/Login.jsx`
- `frontend/src/pages/Register.jsx`
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/pages/AdminDashboard.jsx`
- `frontend/src/pages/AnalyticsDashboard.jsx`

## Current booking workflow

### Customer side

- Customer opens a worker profile.
- Customer creates a booking request with timing, description, priority, and location.
- Backend validates the payload and ensures the requester is a real customer account.
- Matching verified workers receive alerts for the requested category.

### Worker side

- Workers see only their active request queue and accepted jobs.
- Workers can:
  - accept a pending request
  - decline a pending request
  - complete an accepted request
- Accept transitions are protected by transaction locking to reduce race conditions.

## Security controls now present

- JWT secret must be explicitly configured and cannot fall back to a hardcoded default.
- Auth uses an `httpOnly` cookie instead of storing the JWT in browser local storage.
- Booking creation is customer-only at both route and controller layers.
- Customer and worker booking queries are role-gated.
- Booking payloads, auth payloads, profile updates, and booking status updates are validated with Joi.
- CORS is restricted to configured frontend origins.
- Auth endpoints are rate-limited.

## Known design boundaries

- The frontend still stores the non-sensitive user summary in local storage for route rendering.
- Real-time updates are still polling-based rather than websocket-based.
- Payment tracking and in-app messaging are not yet first-class modules.
- The password recovery page is still UI-only and not backed by a real recovery API.
