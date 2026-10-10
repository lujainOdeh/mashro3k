# Testing and Verification

## Automated tests

No unit, integration, or end-to-end test files or test scripts are currently present in the repository. There is no `pnpm test` command defined. Do not treat a successful build or type-check as a test-suite result.

## Available checks

Run these from the repository root on Windows PowerShell:

```powershell
corepack pnpm run typecheck
```

Type-checks workspace libraries, app packages under `artifacts/`, and `scripts/`.

```powershell
$env:PORT = "8080"
$env:BASE_PATH = "/"
corepack pnpm run build
```

Runs the root build script, which first type-checks and then runs available workspace builds. The environment values are needed by the Vite apps that require them (the main Mashrouak Vite config defaults them; the separate mockup sandbox requires both).

## Manual smoke checks

1. Start the main app using `corepack pnpm dev` and open <http://localhost:8080>.
2. Visit `/demo` and enter each role. Check customer catalog/cart/checkout, merchant project/product/order screens, and courier availability/request/delivery flows. All records should remain local to the browser.
3. Start the optional API as documented in [API Documentation](API_DOCUMENTATION.md), then request `GET http://localhost:5000/api/healthz`. Expect HTTP 200 and `{"status":"ok"}`.
4. When testing geolocation, provide browser permission only if desired; the checkout includes a manual map-selection path.

These steps are suggested manual checks, not automated tests. No test results are claimed here.

## Verification performed for this documentation task

- Restored locked dependencies with `corepack pnpm install --frozen-lockfile`.
- TypeScript project-reference build (`tsc --build tsconfig.json`) passed.
- Direct TypeScript checks for `artifacts/api-server`, `artifacts/mashrouak`, `artifacts/mockup-sandbox`, and `scripts` passed.
- Production builds for the API server, Mashrouak frontend, and mockup sandbox passed.
- The API smoke request returned HTTP 200 with `{"status":"ok"}`.
- The Mashrouak Vite build emitted a sourcemap-location warning for `src/components/ui/sheet.tsx` and a warning that its minified JavaScript chunk exceeds 500 kB. The build still completed successfully.

The root recursive `corepack pnpm run typecheck` command was attempted but could not start its nested `pnpm` process in the editing shell (`pnpm` was not on that shell's PATH). Its constituent project checks were run directly as listed above. No automated application test suite was run because none is defined.
