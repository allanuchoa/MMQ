## Why

The "Curva Polinomial" tool is the first engineering-category calculator in the Allan Workbench ecosystem. It provides a pure frontend MMQ (Método dos Mínimos Quadrados) polynomial curve fitting calculator. The standalone prototype already exists in `docs/PRD/` — this change integrates it into the workbench with SSO authentication, the AppBridge header, DESIGN.md visual compliance, and proper tool documentation.

## What Changes

- Replace the template placeholder in `index.html` with the full MMQ calculator interface
- Rewrite `styles.css` from scratch, merging template tokens with MMQ-specific styles, all compliant with DESIGN.md
- Replace `app.js` boilerplate with the complete MMQ math engine, wired to the `workbench-ready` event
- Add Chart.js CDN dependency for scatter/line chart rendering
- Create `docs/AGENTS.md` with tool-specific table mappings and calculation rules (note: the global Workbench `AGENTS.md` lives at the repo root; this `docs/AGENTS.md` is the tool-scoped one — they must not collide)
- Create `docs/CHANGELOG.md` following the workbench changelog format
- Create `README.md` with local setup instructions
- Create `sql/setup.sql` with idempotent registry registration and RLS policies
- Initialize git, connect remote `https://github.com/allanuchoa/MMQ.git`, push (GitHub Actions CI/CD workflow is explicitly a **non-goal** of this change; deploy to GitHub Pages via Actions will be configured in a follow-up change)

## Capabilities

### New Capabilities

- `mmq-calculator`: Polynomial curve fitting via the normal equations method (Vandermonde matrix, Gaussian elimination with partial pivoting). Supports polynomial orders 1-10. Validates input parity and minimum points. Computes total squared error.
- `mmq-chart`: Interactive Chart.js visualization with scatter plot of original data points (green) and smooth fitted polynomial curve (primary). Supports overlaying simulated/new points (amber triangles) on the same chart with auto-extended axis range.
- `excel-export`: Generates an Excel-compatible polynomial formula string using **standard decimal representation** (e.g., `=c0+c1*x+c2*x^2...`; example `=0.03*x^2+1.2*x+0.5`), compatible with both `x` cell reference and copy-as-text workflows. Copy-to-clipboard with visual feedback. Shown only after calculation.
- `workbench-integration`: SSO session validation via `workbench-ready` event from AppBridge. Supabase client initialization with shared session storage. `onAuthStateChange` listener for SIGNED_OUT handling. Header injected dynamically by `workbench-bridge.js`.
- `tool-registry`: Idempotent SQL script registering the tool in the `applications` table (slug: `curva-polinomial`), with RLS policies linking access to `user_applications`.

### Modified Capabilities

None. This is a greenfield tool.

## Impact

- Affected files: `index.html`, `styles.css`, `app.js`, `config.js` (PORTAL_URL fix already done by user)
- New files: `docs/AGENTS.md` (tool-scoped — distinct from the global `AGENTS.md` at repo root), `docs/CHANGELOG.md`, `README.md`, `sql/setup.sql`
- New dependency: Chart.js v4 (CDN: `https://cdn.jsdelivr.net/npm/chart.js`)
- Supabase: new row in `applications` table (idempotent `INSERT ... ON CONFLICT (slug) DO NOTHING/UPDATE`), reusable RLS policy pattern
- Git: repo initialization and GitHub remote configuration (no CI/CD workflow in this change — non-goal)
