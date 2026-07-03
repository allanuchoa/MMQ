## Context

The `docs/PRD/` directory contains a fully functional standalone MMQ polynomial curve fitting calculator built with vanilla HTML/CSS/JS and Chart.js. It lacks SSO authentication, the AppBridge header, and visual compliance with the Allan Workbench DESIGN.md tokens.

The root directory has the workbench template scaffold (`index.html`, `app.js`, `supabase.js`, `config.js`, `styles.css`) following the architecture outlined in `docs/ARCHITECTURE.md`. The integration merges the PRD calculator into this scaffold.

**Constraints:**
- No frameworks (vanilla HTML/CSS/JS only)
- No bundlers/transpilers
- Dark canvas only (#101010)
- DESIGN.md compliance mandatory
- SSO via Supabase + AppBridge
- Chart.js via CDN (acceptable dependency per AGENTS.md — it's a JS library, not a framework)

## Goals / Non-Goals

**Goals:**
- Integrate the MMQ calculator into the workbench with full SSO support
- Rewrite all CSS using DESIGN.md tokens (canvas #101010, primary green #00d992, Inter + SF Mono)
- Preserve all mathematical logic from the PRD prototype
- Create complete documentation (AGENTS.md, CHANGELOG.md, README.md)
- Create idempotent SQL registration script
- Initialize git and push to GitHub

**Non-Goals:**
- Data persistence (tool is client-side only)
- User preferences or saved calculations
- Multi-language support
- Export to formats other than Excel formula string
- Unit tests for the math engine (out of scope for v1)
- GitHub Actions CI/CD workflow / automated GitHub Pages deploy (will be configured in a follow-up change; this change only initializes the repo and pushes the initial commit)

## Decisions

### Decision 1: Single-file CSS, DESIGN.md tokens only

**Chosen:** Rewrite `styles.css` from scratch, keeping only DESIGN.md `:root` tokens, reset, and focus-visible from the template. All MMQ-specific styles adapted from `docs/PRD/style.css` with token substitutions. Template login/launcher classes removed (not used by this tool).

**Alternatives considered:**
- *Keep template CSS and append MMQ styles* → Rejected: 70% of template CSS is login/launcher code unused by a calculator tool. Dead code adds weight and confusion.
- *Use PRD CSS as-is* → Rejected: violates DESIGN.md (blue accent, different background, wrong fonts).

**CSS structure:**
```
:root          ─── All DESIGN.md tokens + --color-primary-deep, --color-danger
Reset           ─── Box-sizing, focus-visible
Base            ─── body (canvas bg, Inter font)
Layout          ─── .container, main grid (2-col: 350px | 1fr)
Inputs          ─── .form-group, input[text], input[number]
Buttons         ─── .btn, .btn-primary (green), .btn-secondary (outline)
Results         ─── .results-grid, .result-box, .result-value (SF Mono)
Chart           ─── .chart-container-wrapper, .chart-container, .chart-error-state, .chart-empty-state
Excel           ─── .excel-box (green themed), .excel-formula (SF Mono)
Responsive      ─── Breakpoints at 1024px and 768px (DESIGN.md spec)
```

**Font stack:** `Inter` loaded from Google Fonts in `<head>` for the sans face; mono face uses the SF Mono system stack (`SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace`) — NO `Roboto Mono` load (the template's current `Roboto Mono` link MUST be removed in this change because it contradicts DESIGN.md §Typography).

### Decision 2: Inline onclick handlers (not addEventListener)

**Chosen:** Use `onclick="functionName()"` attributes in HTML for all calculator interactions.

**Rationale:** AGENTS.md 8.3 warns against `addEventListener` without binding flags in render functions (listener accumulation). With `onclick` inline:
- Impossible to accumulate duplicate listeners
- Directly maps to the PRD prototype code (zero refactoring needed)
- Works correctly with the static HTML fallback requirement (AGENTS.md 8.2)
- The calculator has no dynamic DOM rendering — elements exist in static HTML so there are no rebind concerns

### Decision 3: HTML structure — header + 2-column grid

**Chosen:** Maintain the PRD's two-column layout (left: inputs + Excel box, right: results + chart). The AppBridge injects a header bar (~48px) at the top. The calculator body sits below it.

```
┌──────────────────────────────────────────────┐
│  [AppBridge Header - injected by bridge.js]  │ ← ~48px
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌───────────────────────┐ │
│  │              │  │                       │ │
│  │  Inputs      │  │  Results + Chart      │ │
│  │  (350px)     │  │  (flex: 1)            │ │
│  │              │  │                       │ │
│  └──────────────┘  └───────────────────────┘ │
└──────────────────────────────────────────────┘
```

The PRD's `overflow: hidden` on body and fixed-height grid is preserved with `calc(100vh - 48px)` adjustment for the AppBridge header offset.

### Decision 4: JavaScript — all logic in app.js, no module splitting

**Chosen:** Single `app.js` file containing both the integration glue (workbench-ready listener) and all MMQ math logic.

**Rationale:** The tool has under ~400 lines of JS total. Splitting into multiple files adds HTTP requests without meaningful organizational benefit. The workbench template pattern (config.js for values, supabase.js for client, app.js for business logic) is preserved.

**app.js structure:**
```
Module-level:    chartInstance, lastResults (global state)
Bridge handler:  document.addEventListener('workbench-ready', ...)
Math functions:  parseInput(), solveLinearSystem(), calculateMMQ(),
                 displayResults(), calculateNewY()
Chart functions: renderChart()
UI functions:    copyToExcel()
```

### Decision 5: Chart.js colors mapped to DESIGN.md

All Chart.js color arguments MUST be resolved from CSS custom properties via `getComputedStyle(document.documentElement).getPropertyValue('--token-name').trim()` at render time, so the chart tracks theme tokens rather than embedding hardcoded hex literals. (Chart.js does not understand CSS variables directly — they must be resolved in JS before being passed in.)

| Chart Element | DESIGN.md Token | Value |
|---|---|---|
| Original data points (scatter) | `--color-primary-deep` | #10b981 |
| Fitted curve (line) | `--color-primary` | #00d992 |
| Simulated points (triangle) | Standalone | #f59e0b (amber, distinct from green) |
| Axis text | `--color-mute` | #8b949e |
| Grid lines | `--color-hairline` | #3d3a39 |
| Legend labels | `--color-ink` | #f2f2f2 |

### Decision 6: No Supabase data tables for v1

**Chosen:** Skip creating tool-specific tables. The tool is purely client-side — no calculation results are stored.

**Still required:** The SQL setup script must register the tool in `applications` table so it appears in the portal launcher. The `user_applications` entries are created by the portal admin, not by the tool itself.

## Risks / Trade-offs

- **[Risk] Chart.js CDN failure** → Chart area shows an error state (alert message + "Tentar novamente" button using `--color-danger` accent) instead of a blank canvas, satisfying AGENTS.md §8.1. The calculator's input/result sections remain functional even if chart fails. Detection: `window.Chart === undefined` after `DOMContentLoaded`.
- **[Risk] AppBridge header height mismatch on different devices** → The hardcoded 48px offset may not match all scenarios. Mitigation: The bridge header is a standard workbench component shared across all tools — any fix applies universally.
- **[Risk] Bridge script never dispatches `workbench-ready`** (portal CDN unreachable) → The calculator never initializes. Mitigation: a `DOMContentLoaded` + 8s timeout watchdog surfaces a visible error banner with a reload button, distinct from the empty state (AGENTS.md §8.1).
- **[Trade-off] No unit tests** → Math correctness relies on the PRD prototype's existing behavior and manual verification. Acceptable for v1 given the tool is a calculator, not a critical-path system.
- **[Risk] Large polynomial orders (degree 8-10) may hit floating-point precision issues** → Gaussian elimination with partial pivoting mitigates this, but edge cases exist. The UI already limits to order 10.
- **[Trade-off] Original points (#10b981) and fitted curve (#00d992) are both greens** → visual distinction is narrower than the PRD's original blue line. Accepted because DESIGN.md forbids a second accent color outside the green family; the scatter uses filled-circle markers (radius 6px) while the fitted line is a 2px stroke with no markers, providing shape-based contrast in addition to the slight hue shift.
