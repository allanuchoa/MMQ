# mmq-calculator

## Purpose

Core polynomial curve fitting engine using the Method of Least Squares (MMQ): parse inputs, construct Vandermonde matrix, solve normal equations via Gaussian elimination, display coefficients and total squared error.

## Requirements

### Requirement: Parse input values
The system SHALL parse comma-separated, space-separated, or mixed-delimiter numeric input strings into arrays of floats. Empty, whitespace-only, or non-numeric entries SHALL be ignored.

#### Scenario: Comma-separated values
- **WHEN** user enters "1, 2, 3, 4, 5" in the X values field
- **THEN** system parses to [1, 2, 3, 4, 5]

#### Scenario: Space-separated values
- **WHEN** user enters "1 2 3 4 5" in the Y values field
- **THEN** system parses to [1, 2, 3, 4, 5]

#### Scenario: Mixed whitespace and commas
- **WHEN** user enters "1.5, 2.3  3.7,4.1"
- **THEN** system parses to [1.5, 2.3, 3.7, 4.1]

#### Scenario: Empty input
- **WHEN** user leaves the X or Y field empty
- **THEN** system returns an empty array and triggers a validation error

### Requirement: Validate input constraints
The system SHALL validate that X and Y arrays have equal non-zero length and that the number of data points exceeds the polynomial degree. Validation failures SHALL display an alert message.

#### Scenario: Equal length check
- **WHEN** X has 5 values and Y has 3 values
- **THEN** system shows alert: "Erro: O numero de valores de X e Y deve ser o mesmo e nao pode ser vazio."

#### Scenario: Minimum points for degree
- **WHEN** polynomial order is 3 and user provides 3 points
- **THEN** system shows alert: "Erro: Para um polinomio de ordem 3, voce precisa de pelo menos 4 pontos."

### Requirement: Solve polynomial curve fitting via normal equations
The system SHALL compute polynomial coefficients by constructing a Vandermonde matrix, solving the normal equations (X^T * X * coeffs = X^T * Y) using Gaussian elimination with partial pivoting, and SHALL handle singular matrices (zero pivot detected during elimination) by throwing a caught exception that displays an alert.

#### Scenario: Linear regression (degree 1) on 5 points
- **WHEN** user fits order 1 polynomial to points (1,2.1), (2,3.9), (3,6.1), (4,8.2), (5,9.8)
- **THEN** system computes coefficients approximating y = a0 + a1*x with R^2-like goodness visible

#### Scenario: Singular matrix detection
- **WHEN** the normal equations produce a singular matrix (zero pivot during elimination)
- **THEN** system shows alert: "Erro no calculo da matriz. Verifique se os dados nao geram um sistema singular."

### Requirement: Display polynomial formula in scientific notation
The system SHALL format the fitted polynomial as a human-readable string using scientific notation (toExponential(4)) with terms ordered from highest to lowest degree. Near-zero coefficients (|val| < 1e-10) SHALL be omitted.

#### Scenario: Quadratic polynomial display
- **WHEN** coefficients are [0.5, 1.2, 0.03]
- **THEN** system displays "y = 3.0000e-2*x^2 + 1.2000e0*x + 5.0000e-1"

#### Scenario: All-zero coefficients
- **WHEN** all coefficients are below 1e-10
- **THEN** system displays "y = 0"

### Requirement: Compute total squared error
The system SHALL compute the sum of squared residuals between original Y values and predicted Y values, displayed in scientific notation.

#### Scenario: Error calculation
- **WHEN** polynomial is fitted to data points
- **THEN** system calculates totalError = sum((y_i - y_pred_i)^2) and displays it in toExponential(4) format

### Requirement: Simulate Y values for new X inputs
The system SHALL compute predicted Y values for user-provided new X inputs using the previously fitted polynomial coefficients, and display results as "X=<value> -> Y=<value>" lines.

#### Scenario: Simulate new values after fit
- **WHEN** user has previously calculated a fit and enters "6, 7.5, 10" in the "Novos X" field
- **THEN** system displays "X=6 -> Y=<predicted>" etc. using toPrecision(6) for Y values

#### Scenario: Simulate without prior calculation
- **WHEN** user clicks "Calcular Y" without having performed a polynomial fit
- **THEN** system shows alert: "Por favor, calcule o ajuste original primeiro."
