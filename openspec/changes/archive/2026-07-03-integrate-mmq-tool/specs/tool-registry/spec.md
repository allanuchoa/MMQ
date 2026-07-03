## ADDED Requirements

### Requirement: Tool registration in applications table
The system SHALL provide an idempotent SQL script that inserts the "Curva Polinomial" tool into the `public.applications` table with slug `curva-polinomial`, name "Curva Polinomial", and category "Engineering". The INSERT SHALL use `INSERT ... ON CONFLICT (slug) DO UPDATE SET (name, category) = (EXCLUDED.name, EXCLUDED.category)` (or `DO NOTHING` if name/category are considered immutable once set) so the script is safe to re-run.

#### Scenario: First-time registration
- **WHEN** the SQL script runs against a database without the tool registered
- **THEN** a new row is created in `applications` with slug `curva-polinomial`

#### Scenario: Re-run safety
- **WHEN** the SQL script runs against a database that already has the tool registered
- **THEN** no duplicate rows are created (the `slug` UNIQUE constraint is respected via `ON CONFLICT`) and no errors occur

### Requirement: RLS policy for tool-specific tables
Any table created for the tool SHALL have Row Level Security enabled with a policy that restricts access to users linked to the `curva-polinomial` application via the `user_applications` join table. This requirement is **conditional** ("Any table created") — v1 creates NO tool-specific tables, so this requirement is currently Non-Applicable. The setup script SHALL still ship the RLS policy template as a commented block ready for activation when the first tool-specific table is introduced in a future change.

#### Scenario: Authorized user access
- **WHEN** a user has an entry in `user_applications` linking them to the `curva-polinomial` application
- **THEN** they can read and write data in the tool's tables

#### Scenario: Unauthorized user blocked
- **WHEN** a user does NOT have an entry in `user_applications` for the `curva-polinomial` application
- **THEN** they receive no rows from the tool's tables

### Requirement: Idempotent SQL execution
All DDL statements in the setup script SHALL use idempotent patterns: `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DROP TRIGGER IF EXISTS ... ON ...` before `CREATE TRIGGER`, and `DROP POLICY IF EXISTS "name" ON ...` before `CREATE POLICY`. For the DML registration step the script SHALL use `INSERT ... ON CONFLICT (slug) DO UPDATE/NOTHING`. In v1 the script executes only the DML registration (no DDL is needed because no tool-specific tables are created), but the template block (commented) for future tables MUST already follow these idempotent patterns.

#### Scenario: Re-running setup script
- **WHEN** the setup script is executed multiple times in the same database
- **THEN** no errors are raised, the `applications` row remains a single row, and the schema remains consistent
