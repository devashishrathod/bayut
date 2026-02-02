# Bayut Clone

A full‑stack real-estate web application (Bayut-inspired) built with **Next.js** (frontend) and **NestJS + Prisma** (backend), backed by **PostgreSQL (Neon)**.

This repository is structured as a small monorepo:

- `bayut/` — Next.js frontend (App Router)
- `backend/` — NestJS backend (REST API)

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Run Locally (Step-by-step)](#run-locally-step-by-step)
  - [1) Backend Setup](#1-backend-setup)
  - [2) Frontend Setup](#2-frontend-setup)
  - [3) Verify Everything Works](#3-verify-everything-works)
- [Environment Variables](#environment-variables)
  - [Backend `.env`](#backend-env)
  - [Frontend `.env.local`](#frontend-envlocal)
- [API Documentation (REST)](#api-documentation-rest)
  - [Auth](#auth)
  - [Properties](#properties)
  - [Amenities](#amenities)
  - [Example cURL Requests](#example-curl-requests)
- [UI / Pages](#ui--pages)
- [Deployment Notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

---

## Key Features

### Property Discovery

- Browse properties with responsive UI
- Featured properties carousel
- Search and filters (purpose, location, beds/baths, price, sorting)
- Property details page (image gallery + key info)
- Similar properties carousel on details page

### Authentication

- Signup flow with OTP verification
- Login with JWT authentication
- User profile endpoint (`/auth/me`)
- Password reset endpoints (backend supports forgot/reset)

### Create Listing

- Add Property modal (authentication required)
- Auto-fills contact details for logged-in users
- Server-side validation and safe input handling

### UX / Engineering

- Mobile-first responsive layouts across screens
- Skeleton loading states and user-friendly errors
- CORS allowlist support for local + deployed frontends

---

## Tech Stack

### Frontend

- **Next.js** (App Router)
- **React** + hooks
- **Tailwind CSS**

### Backend

- **NestJS**
- **Prisma ORM**
- **PostgreSQL** (Neon)
- **JWT** authentication
- **Nodemailer** for OTP emails

---

## Project Structure

```
.
├─ README.md              # (this file)
├─ bayut/                 # Next.js frontend
│  ├─ app/                # App Router pages
│  ├─ src/
│  │  ├─ components/      # UI components
│  │  ├─ lib/             # API helpers, etc.
│  │  └─ types/           # Shared TS types
│  └─ ...
└─ backend/               # NestJS backend
   ├─ src/                # Controllers/services/modules
   ├─ prisma/             # Prisma schema/migrations/seed
   └─ ...
```

Note: `bayut/README.md` and `backend/README.md` exist but are mostly template readmes. This root README is the primary documentation.

---

## Run Locally (Step-by-step)

### Prerequisites

- Node.js **LTS recommended** (20/22). (Project can run on newer versions, but LTS is safest.)
- A PostgreSQL database (recommended: Neon).
- Git

---

## 1) Backend Setup

### Step 1 — Configure environment variables

Create a file:

- `backend/.env`

Add the variables listed in [Backend `.env`](#backend-env).

### Step 2 — Install dependencies

From `backend/`:

```bash
npm install
```

### Step 3 — Generate Prisma client

```bash
npm run prisma:generate
```

### Step 4 — Run migrations

For production-like migrations:

```bash
npm run db:migrate
```

For local development migrations (interactive):

```bash
npm run db:migrate:dev
```

(Optional) Seed database:

```bash
npm run db:seed
```

### Step 5 — Start backend

```bash
npm run start:dev
```

Backend default URL:

- `http://localhost:3001`

---

## 2) Frontend Setup

### Step 1 — Configure environment variables

Create a file:

- `bayut/.env.local`

Add the variables listed in [Frontend `.env.local`](#frontend-envlocal).

### Step 2 — Install dependencies

From `bayut/`:

```bash
npm install
```

### Step 3 — Start frontend

```bash
npm run dev
```

Frontend default URL:

- `http://localhost:3000`

---

## 3) Verify Everything Works

1. Open `http://localhost:3000`
2. Confirm properties are loading
3. Try signup/login
4. Open Add Property modal and submit a test listing

---

## Environment Variables

### Backend `.env`

File: `backend/.env`

Required:

- `PORT=3001`
- `NODE_ENV=development`
- `DATABASE_URL=postgresql://...` (Neon / Postgres connection string)
- `FRONTEND_ORIGIN=http://localhost:3000`
  - Supports **comma-separated** allowlist, e.g.
    - `FRONTEND_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app`
- `JWT_ACCESS_TOKEN_SECRET=...` (do not commit secrets)
- `JWT_ACCESS_TOKEN_EXPIRES_IN=30d`

Email / OTP (used in signup verification):

- `NODEMAILER_EMAIL=...`
- `NODEMAILER_PASSWORD=...` (App password recommended)
- `OTP_SECRET=...`

### Frontend `.env.local`

File: `bayut/.env.local`

Required:

- `NEXT_PUBLIC_API_URL=http://localhost:3001`

Optional (used for building share/inquiry links in some flows):

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

---

## API Documentation (REST)

Base URL (local): `http://localhost:3001`

### Auth

- `POST /auth/register/start`
  - Starts signup + sends OTP
- `POST /auth/register/verify`
  - Verifies OTP and returns JWT
- `POST /auth/register/resend`
  - Resend OTP
- `POST /auth/login`
  - Login and returns JWT
- `GET /auth/me`
  - Returns current user (JWT required)
- `POST /auth/password/forgot`
  - Sends reset OTP / link (implementation dependent)
- `POST /auth/password/reset`
  - Resets password (implementation dependent)

### Properties

- `GET /properties`
  - Query params support pagination + filters (purpose, beds, baths, price, etc.)
- `GET /properties/featured`
  - Featured listings (used on homepage)
- `GET /properties/metadata`
  - Categories/subcategories used by filters + add property form
- `GET /properties/:id`
  - Property details
- `GET /properties/:id/similar?limit=6`
  - Similar properties
- `POST /properties`
  - Create property (JWT required)

### Amenities

- `GET /amenities`
  - Lists amenities

---

## Example cURL Requests

### 1) Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### 2) Fetch featured properties

```bash
curl http://localhost:3001/properties/featured?purpose=sale&limit=9
```

### 3) Create property (JWT required)

```bash
curl -X POST http://localhost:3001/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "title":"Modern 2BR Apartment",
    "description":"Spacious and bright.",
    "purpose":"sale",
    "categoryId":"<CATEGORY_ID>",
    "subCategoryId":"<SUBCATEGORY_ID>",
    "price":1200000,
    "bedrooms":2,
    "bathrooms":2,
    "areaSqft":1100,
    "furnished":false,
    "city":"Dubai",
    "community":"Downtown",
    "coverImageUrl":"https://...",
    "imageUrls":["https://...","https://..."]
  }'
```

---

## UI / Pages

Frontend base URL (local): `http://localhost:3000`

- `/` — Home (hero search + featured carousel)
- `/properties` — Search results / listing page
- `/properties/[id]` — Property details + similar properties
- `/login` — Login
- `/signup` — Signup + OTP verification

Add Property modal:

- Controlled via query param `?addProperty=1` (and also accessible from UI actions)

---

## Deployment Notes

### Backend (Render / Vercel)

- Set `DATABASE_URL` to your hosted Postgres connection string
- Set `FRONTEND_ORIGIN` to your deployed frontend URL
- Ensure `JWT_ACCESS_TOKEN_SECRET`, `OTP_SECRET`, and nodemailer credentials are configured

CORS:

- Do not use `*` when `credentials: true`
- Use exact origins (and comma-separated list if multiple environments)

### Frontend (Vercel)

- Set `NEXT_PUBLIC_API_URL` to deployed backend base URL
- (Optional) set `NEXT_PUBLIC_APP_URL` to frontend URL

---

## Troubleshooting

### 1) CORS error / properties not loading

- Confirm backend `FRONTEND_ORIGIN` includes your frontend origin exactly
- Restart backend after changing `.env`

### 2) Backend port already in use (`EADDRINUSE`)

- Kill process using the port or change `PORT` in `backend/.env`

### 3) No data in UI

- Confirm backend is running on the same base URL as `NEXT_PUBLIC_API_URL`
- Confirm DB has data (run seed if needed)

---

## Notes

This project was prepared for interview/demo purposes and focuses on:

- Clean UX + responsive design
- Practical full-stack architecture
- Secure authentication patterns (JWT + OTP verification)
- Deploy-ready configuration (env vars + CORS allowlist)
