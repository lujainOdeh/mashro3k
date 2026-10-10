# System Design

## Scope

The repository is a pnpm TypeScript monorepo. Its main user-facing system is a React single-page application. The Express server, generated API libraries, PostgreSQL/Drizzle package, and mockup sandbox exist as separate workspace packages; the marketplace currently runs without the API or database.

```text
Browser
  └── artifacts/mashrouak (React + Vite SPA)
       ├── React Router routes and role guards
       ├── AppStateProvider
       │    ├── seeded demo records
       │    └── localStorage / sessionStorage persistence
       ├── marketplace, merchant, and courier pages
       ├── local distance/grouping utility
       └── Leaflet map tiles (OpenStreetMap)

Separate packages (not used by the marketplace at runtime)
  ├── artifacts/api-server (Express; GET /api/healthz)
  ├── lib/api-spec → generated lib/api-zod + lib/api-client-react
  └── lib/db (PostgreSQL/Drizzle scaffold; no tables)
```

## Main app flow

1. `artifacts/mashrouak/src/main.tsx` loads the shared stylesheet, mounts `App`, and wraps it in an error boundary.
2. `App.tsx` provides `AppStateProvider` and `BrowserRouter`, then maps browser paths to page components. `RequireRole` checks the client-side demo session before rendering protected role pages.
3. `AppState.tsx` initializes state from `seed.ts` plus saved browser state. Mutations use `patch`, which clones and updates the state; a React effect persists state and updates document language, direction, and dark-mode class.
4. Page components read and update shared state. For example, customer checkout creates local orders, merchant screens update local products/orders, and courier screens claim/update local deliveries.
5. `Shell.tsx` provides the header, role-dependent links, responsive side menu, footer, and toast display to app pages.

The landing, login, and demo-selection screens are public. Customer, merchant, and courier routes use `RequireRole` (see the route table in `artifacts/mashrouak/src/App.tsx`). `/projects` and product/project detail routes are public in the current route configuration.

## Route map

| Route | Access in the current app |
| --- | --- |
| `/`, `/login`, `/demo` | Public landing, login, and role selection. |
| `/projects`, `/projects/:projectId`, `/products/:productId` | Public discovery and detail pages. |
| `/customer`, `/cart`, `/checkout`, `/orders`, `/orders/:orderId` | Customer demo session. |
| `/merchant`, `/merchant/project`, `/merchant/products`, `/merchant/orders`, `/merchant/smart-delivery` | Merchant demo session. |
| `/courier`, `/courier/requests`, `/courier/deliveries/:orderId`, `/courier/history` | Courier demo session. |
| `/profile`, `/settings` | Any valid demo session. |
| Any unmatched path | Arabic not-found page. |

These checks exist in the client router; they are not server-enforced access control.

## State and persistence

- Initial projects, products, users, and sample orders are defined in `src/data/seed.ts`.
- The app state is per browser, not a shared server-side store.
- Main state uses localStorage key `mashrouak-demo-v1`.
- Non-remembered demo sessions use sessionStorage key `mashrouak-demo-session-v1`; without a valid session, the app returns to the seeded customer identity.
- Registration/authentication logic is in `src/services/demoAuth.ts`; it operates on the client-held user list.
- Clearing browser storage resets the demo to its seed state.

This is demonstration state management, not a production identity, access-control, or persistence boundary.

## Workspace packages

| Package | Responsibility | Current relationship |
| --- | --- | --- |
| `artifacts/mashrouak` | Marketplace SPA, demo workflows, and client-side state. | Root `dev` script starts this package. |
| `artifacts/api-server` | Express app with request logging, CORS, JSON/urlencoded parsing, and `/api/healthz`. | Runs separately; no marketplace routes or frontend integration. |
| `lib/api-spec` | OpenAPI 3.1 contract and Orval code-generation config. | Generates the API client and Zod packages. |
| `lib/api-client-react` | Generated React Query health client and custom fetch helper. | Exported as a workspace library; no imports from the marketplace source were found. |
| `lib/api-zod` | Generated health response schema. | Used by the API health route to validate its response. |
| `lib/db` | PostgreSQL pool and Drizzle instance. | Empty schema export; no app feature currently uses the database. |
| `artifacts/mockup-sandbox` | Independent Vite mockup preview project. | Not the main application. |

The API client/schema code-generation command is `corepack pnpm --filter @workspace/api-spec run codegen`; it reads `lib/api-spec/openapi.yaml`.

## Delivery grouping

`src/utils/optimization.ts` provides a pure client-side Haversine distance function and `optimizeGroups`. The merchant smart-delivery page calls it over local orders/projects, stores the generated groups in app state, and displays the estimates. It is a deterministic heuristic, not an AI service or road-routing integration. See [AI and optimization algorithm](AI_ALGORITHM.md).

## Runtime and external services

- Main frontend: Vite with default port `8080` and base path `/` (both configurable in `artifacts/mashrouak/vite.config.ts`).
- API server: Express listens on required `PORT`.
- Maps: React Leaflet renders OpenStreetMap tiles; the code uses approximate/seeded coordinates.
- Project/product images are remote Pexels URLs in the seed and demo data.
- No external payment, authentication, analytics, or AI service integration is present in the application code.
