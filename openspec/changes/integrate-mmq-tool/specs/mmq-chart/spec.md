## ADDED Requirements

### Requirement: Render scatter plot of original data points
The system SHALL render a Chart.js scatter plot displaying the original (X, Y) data points using green markers consistent with DESIGN.md token `--color-primary-deep` (`#10b981`). Color values inside Chart.js configuration MUST be supplied as resolved hex strings read from the CSS custom properties via `getComputedStyle(document.documentElement).getPropertyValue('--color-primary-deep')` so the chart tracks the theme tokens (not hardcoded literals).

#### Scenario: Points rendered after calculation
- **WHEN** user clicks "Calcular Ajuste" with valid data
- **THEN** a scatter plot appears with original data points as filled circles (radius 6px)

#### Scenario: Hover interaction
- **WHEN** user hovers over a data point
- **THEN** the point radius increases to 8px and a tooltip shows exact coordinates

### Requirement: Render fitted polynomial curve
The system SHALL overlay a smooth continuous polynomial curve on the chart, generated from the computed coefficients with 100 sampling points across the visible X range (including 5% margin on each side). The line stroke color SHALL be the resolved value of `--color-primary` (`#00d992`).

#### Scenario: Smooth curve overlay
- **WHEN** polynomial fit is computed
- **THEN** a line chart dataset is rendered with 2px stroke in `--color-primary` and no point markers, using tension 0.4

#### Scenario: Curve extends beyond data range
- **WHEN** data points span X=[1, 5]
- **THEN** the fitted curve is drawn from X=0.75 to X=5.25 (5% margin on each side)

### Requirement: Overlay simulated data points
The system SHALL add user-simulated (X, Y_predicted) points to the existing chart as amber/orange triangular markers (`#f59e0b`, standalone accent distinct from the green family) without removing previously rendered data.

#### Scenario: First simulation adds new dataset
- **WHEN** user calculates Y for new X values and no simulated dataset exists on the chart
- **THEN** a new dataset labeled "Pontos Simulados" is added with triangle markers in `#f59e0b`

#### Scenario: Subsequent simulation updates existing dataset
- **WHEN** user calculates Y for new X values and a simulated dataset already exists
- **THEN** the existing "Pontos Simulados" dataset data is replaced with new values

### Requirement: Auto-extend chart axis range
The system SHALL recalculate and extend the fitted curve when simulated points fall outside the original data range, so the curve remains visible for all points.

#### Scenario: Simulated point extends X axis
- **WHEN** original data spans X=[1,5] and user simulates X=10
- **THEN** the fitted curve is redrawn to cover [0.5, 10.5] and the chart updates

### Requirement: Chart lifecycle management
The system SHALL destroy any existing Chart.js instance (`chartInstance.destroy()`) before creating a new one to prevent memory leaks or duplicate canvases. If `chartInstance` is non-null when a new `renderChart` call begins, it MUST be destroyed unconditionally before `new Chart(...)`.

#### Scenario: Second calculation replaces chart
- **WHEN** user performs a second "Calcular Ajuste" while a chart already exists
- **THEN** the existing chart instance is destroyed before a new one is created

### Requirement: Dark-theme chart styling
The system SHALL apply DESIGN.md-compliant colors to all chart elements by resolving the corresponding CSS custom properties at render time: axis titles and ticks in `--color-mute` (`#8b949e`), grid lines in `--color-hairline` (`#3d3a39`), and legend labels in `--color-ink` (`#f2f2f2`). Hex literals are forbidden in the chart config; only resolved token values may be passed to Chart.js.

#### Scenario: Chart theme consistency
- **WHEN** chart is rendered
- **THEN** axes titles and ticks use the resolved value of `--color-mute` (`#8b949e`), grid lines use `--color-hairline` (`#3d3a39`), and legend uses `--color-ink` (`#f2f2f2`)

### Requirement: Chart.js CDN failure state
The system SHALL detect when Chart.js fails to load (CDN unreachable) and render a visible error state inside `.chart-container` instead of leaving a blank canvas, satisfying AGENTS.md §8.1 (mandatory UI states). The error state MUST be distinct from the empty state (no calculation yet) and provide a retry affordance.

#### Scenario: Chart.js unavailable
- **WHEN** `window.Chart` is `undefined` after `DOMContentLoaded` and the user performs a calculation
- **THEN** `.chart-container` displays an alert message (e.g., "Não foi possível carregar o gráfico. Verifique sua conexão.") using `--color-danger` accent and a "Tentar novamente" button that reloads the page

#### Scenario: Empty chart container (no calculation yet)
- **WHEN** the page has loaded and no calculation has been performed
- **THEN** `.chart-container` shows an empty-state caption (e.g., "Calcule um ajuste para visualizar o gráfico.") — distinct from the error message above
