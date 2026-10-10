# Database

## Current status

The repository contains PostgreSQL/Drizzle scaffolding in `lib/db`, but it does **not** currently define any database tables:

- `lib/db/src/schema/index.ts` contains only commented examples and exports an empty module.
- `lib/db/src/index.ts` creates a `pg` connection pool from `DATABASE_URL` and exports a Drizzle instance.
- `lib/db/drizzle.config.ts` configures the PostgreSQL dialect and also requires `DATABASE_URL`.
- The marketplace does not import or use the database package; its data lives in browser state and storage.

Consequently, there is no implemented database schema, migration, initialization, or database seed command. A PostgreSQL server is not required to run the frontend or the current API health endpoint. Do not interpret the example schema comments as created tables.

## Configuration

`DATABASE_URL` must be set before importing the DB module or loading the Drizzle config. `.env.example` contains a placeholder only; the application does not load `.env` files automatically.

PowerShell example for a local PostgreSQL instance:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@localhost:5432/DATABASE"
```

Replace every placeholder with the connection details for a database you control. Do not commit credentials.

The workspace declares a `push` script for Drizzle Kit (`corepack pnpm --filter @workspace/db run push`), but there are no tables in the current schema to initialize. No successful push or database integration is claimed or required by the current application.

## Demo data

The web demo is seeded by `artifacts/mashrouak/src/data/seed.ts`. The provider combines this seed with browser-local saved state. To reset it, clear site data/local storage for the app origin; there is no SQL seed or database reset operation.
