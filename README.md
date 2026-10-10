# Mashro3ak

**Mashro3ak is a bilingual, demo-first marketplace prototype connecting shoppers with independent projects in Amman and simulating local order delivery.**

Built by **Anchor RHL** for **AI QUEST 2026**, track `next.society()`.

> This repository contains a working client-side demonstration, a separate health-check API scaffold, and an empty PostgreSQL/Drizzle schema scaffold. The marketplace does not use the API or database for its data.

## The problem and approach

Independent local makers need a clear way to present their projects and products, while shoppers need an approachable way to discover, order, and follow local deliveries. Mashro3ak demonstrates those flows in one Arabic/English interface, with separate customer, project-owner, and courier experiences. Its delivery grouping screen transparently labels its calculations as estimates rather than AI-powered routing or real delivery prices.

## Implemented features

- Browse seeded Amman projects and products, search/filter the catalog, and view project and product details.
- Add items to a cart, complete a simulated cash-on-delivery checkout, create per-project orders, and view order status.
- Demo sign-in, account registration, and role selection for customers, merchants, and couriers.
- Merchant dashboard, project editing, product and stock management, and order status/rejection workflows.
- Courier availability, sorting and claiming ready orders, simulated delivery stages, and delivery history.
- A transparent delivery grouping heuristic with estimated costs and savings (see [AI/algorithm notes](docs/AI_ALGORITHM.md)).
- Arabic/English selection, light/dark themes, responsive navigation, and interactive maps with optional browser geolocation during checkout.
- Demo state persisted in browser storage; seed projects and orders are in `artifacts/mashrouak/src/data/seed.ts`.
- A standalone Express health endpoint at `GET /api/healthz`.

All commerce and delivery actions in the web app are local demonstrations. There are no real payments, live GPS tracking, production authentication, or API-backed marketplace operations.

## Technology

- **Workspace:** pnpm workspaces, TypeScript.
- **Marketplace frontend:** React 19, Vite 7, React Router, Tailwind CSS 4, Radix UI, Lucide, Recharts, React Leaflet/Leaflet.
- **API scaffold:** Express 5, CORS, Pino/Pino HTTP, esbuild.
- **API contract/client scaffolding:** OpenAPI 3.1, Orval-generated Zod schemas and React Query client.
- **Database scaffolding:** PostgreSQL (`pg`) and Drizzle ORM/Drizzle Kit. There are currently no application tables.

## Prerequisites

- Node.js 24 is the runtime configured in `.replit`; package manifests do not currently enforce a Node engine range.
- Corepack with pnpm. The root install script rejects npm and Yarn; use pnpm with the checked-in `pnpm-lock.yaml`.
- A current browser for the demo.
- No database is required to run the marketplace frontend or the health endpoint.

## Install and run (Windows PowerShell)

Clone the repository and start the main app in Windows PowerShell:

```powershell
git clone https://github.com/lujainOdeh/mashro3k.git
Set-Location mashro3k
corepack enable pnpm
corepack pnpm install
corepack pnpm dev
```

Run `corepack enable pnpm` once if the pnpm shim is not already enabled for your Node.js installation.

Open <http://localhost:8080>. The root `dev` script starts only `@workspace/mashrouak`. Vite defaults to port `8080` and base path `/`; override them by setting `$env:PORT` or `$env:BASE_PATH` before starting the command.

The normal setup does not need a `.env` file. The repository includes [.env.example](.env.example) as a reference for optional API/database settings; the project does not load `.env` files through a dotenv package, so set variables in the shell when needed.

### Demo access

- Visit `/demo` and select **customer**, **merchant**, or **courier** to enter the corresponding seeded role.
- Or visit `/login`, select a role, and use the seeded account email or phone number with password `demo123`.
- Seeded accounts: `layan@example.com` (customer), `sara@example.com` (merchant), and `omar@example.com` (courier). The demo phone numbers are in `artifacts/mashrouak/src/data/seed.ts`.
- You can register additional demo accounts from the login page. Demo account data is stored in that browser and is not shared with other users or devices.

### Optional API server

The API server is independent of the frontend. In a second PowerShell window, run:

```powershell
corepack pnpm --filter @workspace/api-server run build
$env:PORT = "5000"
corepack pnpm --filter @workspace/api-server run start
```

Verify it with:

```powershell
Invoke-RestMethod http://localhost:5000/api/healthz
```

Expected JSON:

```json
{"status":"ok"}
```

The API process requires `PORT`. Its package `dev` script uses a POSIX `export` command; on Windows, use the build/start commands above.

## Build and type-check

For the full workspace on Windows PowerShell, set the Vite variables needed by both frontend packages, then build:

```powershell
$env:PORT = "8080"
$env:BASE_PATH = "/"
corepack pnpm run typecheck
corepack pnpm run build
```

`typecheck` checks the TypeScript project references, workspace artifacts, and scripts. `build` runs type-checking and the available package builds. The standalone `artifacts/mockup-sandbox` is a separate preview app, not the Mashro3ak product; its Vite config also requires `PORT` and `BASE_PATH`.

There are no unit, integration, or end-to-end test files or test scripts in the repository at this time. See [Testing](docs/TESTING.md) for the available verification commands and their status.

## Configuration and data

| Variable | Used by | Requirement |
| --- | --- | --- |
| `PORT` | API server and Vite apps | Required by the API and mockup sandbox; optional for Mashrouak, which defaults to `8080`. |
| `BASE_PATH` | Vite apps | Optional in `artifacts/mashrouak`; required by the separate mockup sandbox. Use `/` for local root hosting. |
| `DATABASE_URL` | `lib/db` and Drizzle config | Required if the database module/config is loaded. No app tables or database seed data are currently defined. |

The UI state is initialized from seeded data and saved in `localStorage` under `mashrouak-demo-v1`; temporary sign-in state uses `sessionStorage` under `mashrouak-demo-session-v1`. Clearing site storage resets the demo.

## Limitations and future work

- The web app is a browser-local prototype, not a multi-user marketplace service.
- Demo credentials and authorization are client-side; they are not suitable for real accounts or sensitive data.
- Payments, delivery pricing, courier earnings, route grouping, and status updates are simulations.
- Courier coordinates are seeded/example coordinates; checkout geolocation is opt-in and is not live courier tracking.
- Map tiles come from OpenStreetMap and seeded project/product photos use remote Pexels URLs, so those resources need network access.
- The Express API currently exposes only a health check. The generated API client is not connected to the marketplace UI.
- The Drizzle schema exports no tables; no database initialization or seed step exists.
- Delivery grouping is a deterministic distance heuristic, not a trained AI model or road-routing engine.

Persistent API-backed marketplace data, real identity and authorization, payment processing, production delivery routing, and automated tests are **not implemented** and would be future work.

## Repository map

| Path | Purpose |
| --- | --- |
| `artifacts/mashrouak/` | Main React/Vite marketplace app. |
| `artifacts/api-server/` | Separate Express health-check service. |
| `artifacts/mockup-sandbox/` | Separate Vite mockup preview app. |
| `lib/api-spec/` | OpenAPI document and Orval configuration. |
| `lib/api-zod/` | Generated API Zod schemas. |
| `lib/api-client-react/` | Generated React Query API client and fetch helper. |
| `lib/db/` | PostgreSQL/Drizzle connection and currently empty schema. |
| `scripts/` | Small workspace script package; not required by the app. |
| `docs/` | Architecture, API, database, algorithm, and testing documentation. |

## Team

**Anchor RHL** — AI QUEST 2026, `next.society()` track.

Individual contributor names and contact information were not present in the repository and are not listed here.
