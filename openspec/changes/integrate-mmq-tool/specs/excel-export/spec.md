## ADDED Requirements

### Requirement: Generate Excel-compatible polynomial formula
The system SHALL generate a formula string from polynomial coefficients in Excel format using **standard decimal representation** (NOT scientific `E` notation), e.g., `=c0+c1*x+c2*x^2...`. Coefficients are rendered via JavaScript's default numeric coercion (`val.toString()`), preserving Excel's auto-recognition of decimals. Terms with absolute value below 1e-10 SHALL be omitted. The variable identifier MUST be the literal `x` so the formula can be pasted next to a column of X values.

#### Scenario: Quadratic formula generation
- **WHEN** coefficients are [0.5, 1.2, 0.03] (a0, a1, a2)
- **THEN** system generates formula `=0.03*x^2+1.2*x+0.5`

#### Scenario: Formula with negative coefficients
- **WHEN** coefficients include negative values
- **THEN** the negative term appears with `-` sign in the formula string

#### Scenario: All-zero fallback
- **WHEN** all coefficients are near-zero
- **THEN** system generates formula `=0`

### Requirement: Display Excel formula in dedicated UI box
The system SHALL display a green-themed Excel box containing the generated formula only after a successful calculation. The box SHALL be hidden before the first calculation.

#### Scenario: Box appears after calculation
- **WHEN** user clicks "Calcular Ajuste" successfully
- **THEN** the Excel box becomes visible with the formula and label "Fórmula para Excel (copie e cole)"

#### Scenario: Box hidden before calculation
- **WHEN** the page loads or no calculation has been performed
- **THEN** the Excel box is not visible

### Requirement: Copy formula to clipboard
The system SHALL copy the generated Excel formula to the system clipboard using the Clipboard API. Visual feedback SHALL change the copy button text to "Copiado!" for 2 seconds before reverting.

#### Scenario: Successful copy
- **WHEN** user clicks "Copiar" button on the Excel box
- **THEN** the formula string is copied to clipboard and button text changes to "Copiado!" for 2 seconds

#### Scenario: Copy before calculation
- **WHEN** user clicks "Copiar" before calculating
- **THEN** system shows alert: "Calcule primeiro antes de copiar."

#### Scenario: Clipboard API failure
- **WHEN** navigator.clipboard.writeText rejects
- **THEN** system shows alert: "Erro ao copiar: <error message>"
