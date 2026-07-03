## 1. Styles (CSS)

- [x] 1.1 Rewrite `styles.css` from scratch using DESIGN.md `:root` tokens (canvas #101010, primary #00d992, Inter + SF Mono, spacing/rounded scale)
- [x] 1.2 Add `--color-primary-deep` (#10b981) and `--color-danger` (#f87171) to `:root` tokens
- [x] 1.3 Implement two-column grid layout: left panel (350px) for inputs, right panel (flex: 1) for results + chart
- [x] 1.4 Implement input styling (.form-group, input[text], input[number]) using `--color-canvas-soft` background, `--color-hairline` border, `--rounded-sm`
- [x] 1.5 Implement button styles: .btn-primary (green bg, dark text), .btn-secondary (outline on dark)
- [x] 1.6 Implement results styling: .result-box with `--color-canvas` bg, .result-value in `--font-mono` (SF Mono stack: `SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace`) with green color
- [x] 1.7 Implement chart container styling: .chart-container-wrapper with `--color-canvas-soft` bg, hairline border, positioned chart canvas; add `.chart-empty-state` caption (mute color, centered) and `.chart-error-state` banner (`--color-danger` accent + "Tentar novamente" button)
- [x] 1.8 Implement Excel box styling: green-themed card with formula in monospace (SF Mono stack, NOT Roboto Mono), copy button
- [x] 1.9 Add responsive breakpoints: tablet (1024px) collapses to 2-col; mobile (768px) stacks to single column
- [x] 1.10 Add custom scrollbar styles for panels (thin, hairline-colored thumb)

## 2. HTML Structure

- [x] 2.1 Update `<head>`: keep Inter (Google Fonts), REMOVE `Roboto Mono` link (violates DESIGN.md §Typography), and rely on the SF Mono system stack (`SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace`) via `--font-mono` token — no extra font fetch
- [x] 2.2 Add Chart.js v4 CDN script in `<head>` (loaded before `app.js`)
- [x] 2.3 Replace placeholder body with MMQ calculator layout (header + two-column main); ensure left panel is visible by default as the static HTML fallback (AGENTS.md §8.2)
- [x] 2.4 Build left panel: degree input, X values input, Y values input, "Calcular Ajuste" button, new X values section with "Calcular Y" button, prediction result container, Excel box (hidden by default)
- [x] 2.5 Build right panel: polynomial display box, error display box, chart container with canvas + `.chart-empty-state` caption ("Calcule um ajuste para visualizar o gráfico.") + `.chart-error-state` banner (hidden by default)
- [x] 2.6 Keep script loading order: config.js → supabase.js → workbench-bridge.js (dynamic) → app.js
- [x] 2.7 Ensure right panel (#results) is hidden by default (display:none), shown only after calculation; ensure #excel-box is hidden by default, shown only after a successful calculation
- [x] 2.8 Add a global error banner slot (hidden) for the "bridge never fired workbench-ready" watchdog state

## 3. JavaScript Logic

- [x] 3.1 Retain `workbench-ready` event listener and `initApp(session)` entry point
- [x] 3.2 Declare module-level variables: `chartInstance` (null), `lastResults` (null)
- [x] 3.3 Implement `parseInput(inputStr)` — splits by comma/space, parses floats, filters NaN
- [x] 3.4 Implement `solveLinearSystem(A, B)` — Gaussian elimination with partial pivoting
- [x] 3.5 Implement `calculateMMQ()` — reads degree and input values, validates, constructs Vandermonde matrix, solves normal equations, computes coefficients and total squared error
- [x] 3.6 Implement `displayResults(coeffs, error, xOriginal)` — formats polynomial string in scientific notation (`toExponential(4)`, lowercase `e`), updates DOM; generates Excel formula in **standard decimal representation** (`val.toString()`, NOT scientific `E` notation), terms ordered high→low degree, omits near-zero (|val| < 1e-10); stores in `lastResults`
- [x] 3.7 Implement `renderChart(x, y, yPred, degree, coeffs)` — unconditionally destroys `chartInstance` if non-null (`chartInstance && chartInstance.destroy()`) before creating a new one (chart lifecycle management); creates Chart.js scatter + line chart with DESIGN.md compliant colors resolved from CSS custom properties via `getComputedStyle(document.documentElement).getPropertyValue('--token').trim()` (NO hex literals in chart config); if `window.Chart === undefined`, render the `.chart-error-state` banner inside `.chart-container` instead and return early
- [x] 3.8 Implement `copyToExcel()` — copies the decimal-format Excel formula string to clipboard, "Copiado!" feedback for 2 seconds; handles clipboard API rejection with `alert("Erro ao copiar: <err>")`
- [x] 3.9 Implement `calculateNewY()` — computes predicted Y for new X inputs (decimal output, `toPrecision(6)`), updates prediction display and overlays simulated points on chart (amber triangle dataset), extends fitted curve range

## 4. Auth & Session

- [x] 4.1 Verify `supabase.js` has correct `storageKey` format (`sb-${CONFIG.SUPABASE_PROJECT_ID}-auth-token`)
- [x] 4.2 Verify `config.js` PORTAL_URL points to `https://allanuchoa.github.io/portal/` (already fixed by user)
- [x] 4.3 Add `onAuthStateChange` listener in `app.js` to handle `SIGNED_OUT` events: destroy `chartInstance` (set to `null`), clear `lastResults`, hide `#results` and `#excel-box`, then validate `CONFIG.PORTAL_URL` with `/^https?:\/\//` and redirect
- [x] 4.4 Add a `DOMContentLoaded` + 8s timeout watchdog: if no `workbench-ready` event has fired, show the global error banner ("Não foi possível validar sua sessão...") with a "Tentar novamente" button that calls `window.location.reload()`
- [x] 4.5 Add a `validateRedirectUrl(url)` helper that returns `false` (and logs) when the URL does NOT match `/^https?:\/\//`; use it to guard every `window.location.href = ...` assignment in `app.js`

## 5. Documentation

- [x] 5.1 Create `README.md` with local setup instructions (run with Live Server or `npx serve`)
- [x] 5.2 Create `docs/AGENTS.md` with tool-specific rules: slug `curva-polinomial`, table prefix `cvp_`, no persistence tables currently needed, math algorithm details. NOTE: the global Workbench `AGENTS.md` now lives at the repo ROOT (moved by the user) — this `docs/AGENTS.md` is the tool-scoped file and must NOT overwrite the root one
- [x] 5.3 Create `docs/CHANGELOG.md` with initial version entry

## 6. Database Setup

- [x] 6.1 Create `sql/setup.sql` with idempotent registration of the tool in `public.applications`: `INSERT INTO public.applications (slug, name, category, ...) VALUES ('curva-polinomial', 'Curva Polinomial', 'Engineering', ...) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category;` (re-runnable, no duplicates)
- [x] 6.2 Include RLS policy template for future tool-specific tables as a COMMENTED block (v1 has no tool-specific tables — the requirement is conditional/NA); the commented template MUST use `DROP POLICY IF EXISTS` before `CREATE POLICY` and `CREATE TABLE IF NOT EXISTS` for forward compatibility

## 7. Git Setup & Deploy

- [x] 7.1 Initialize git in the project directory
- [x] 7.2 Create `.gitignore` excluding common files (node_modules, .DS_Store, etc.)
- [x] 7.3 Add remote origin `https://github.com/allanuchoa/MMQ.git`
- [x] 7.4 Stage all files and create initial commit
- [x] 7.5 Push to GitHub main branch
- [ ] 7.6 (Non-goal, recorded for clarity) GitHub Actions CI/CD workflow + automated GitHub Pages deploy — explicitly OUT OF SCOPE for this change; will be added in a follow-up change

## 8. Verification

- [ ] 8.1 Run local server and verify calculator loads with AppBridge header
- [ ] 8.2 Test MMQ calculation: degree 1 with 5 points, verify polynomial and chart render
- [ ] 8.3 Test Excel copy: verify the DECIMAL-format formula (`=0.5+1.2*x+0.03*x^2`, NOT scientific `E` notation) is copied to clipboard
- [ ] 8.4 Test simulated points: enter new X values, verify chart updates with amber triangle markers
- [ ] 8.5 Test validation: mismatched X/Y count, insufficient points for degree, empty inputs
- [ ] 8.6 Verify all colors match DESIGN.md tokens (inspect computed styles — chart config must contain NO hex literals, only resolved token values)
- [ ] 8.7 Verify focus-visible indicator appears on keyboard navigation
- [ ] 8.8 Verify SIGNED_OUT flow: call `supabase.auth.signOut()` from the console → chart destroyed, results hidden, redirect to portal
- [ ] 8.9 Verify Chart.js failure state: block Chart.js CDN in DevTools → calculation renders `.chart-error-state` banner (not a blank canvas)
- [ ] 8.10 Verify bridge failure watchdog: block `workbench-bridge.js` in DevTools → after 8s the global error banner appears with "Tentar novamente"
