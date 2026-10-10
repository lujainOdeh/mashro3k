# API Documentation

## Current API surface

The Express service in `artifacts/api-server` currently implements one endpoint. Its router is mounted under `/api`.

### `GET /api/healthz`

Returns a small health response. No request body, query parameters, authentication, or database access is used.

**Successful response — `200 OK`**

```http
GET /api/healthz
Accept: application/json
```

```json
{
  "status": "ok"
}
```

`status` is a required string according to the generated `HealthCheckResponse` schema in `lib/api-zod`.

## Error handling and middleware

- The API app installs `pino-http`, CORS, JSON parsing, and URL-encoded body parsing before mounting routes at `/api`.
- The health handler validates its response with `HealthCheckResponse.parse` and returns JSON.
- There is no application-wide error response format or custom not-found handler. Unmatched paths and parser/handler errors use Express's default behavior; clients should not assume a project-defined error JSON schema.
- Request logging records request ID, method, URL path (without query string), and response status. The logger redacts authorization, cookie, and set-cookie values.
- CORS is enabled with the package's default `cors()` configuration; there is no origin allowlist in the current code.

## Run and verify on Windows PowerShell

From the repository root:

```powershell
corepack pnpm --filter @workspace/api-server run build
$env:PORT = "5000"
corepack pnpm --filter @workspace/api-server run start
```

In another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:5000/api/healthz
```

Expected response:

```json
{"status":"ok"}
```

The API package's `dev` script uses the POSIX `export` command, so the explicit build/start commands above are the Windows-compatible documented path.

## Contract and client packages

- Source contract: `lib/api-spec/openapi.yaml`.
- Generated Zod response: `lib/api-zod/src/generated/types/healthStatus.ts`.
- Generated React Query client: `lib/api-client-react/src/generated/api.ts`.
- The frontend has no import of `@workspace/api-client-react` and does not call this endpoint as part of its marketplace flows.

No marketplace, account, order, product, courier, or payment API endpoints are implemented. The OpenAPI description does not define those operations.
