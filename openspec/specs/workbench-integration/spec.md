# workbench-integration

## Purpose

SSO session validation, Supabase client initialization, auth state change handling, static HTML fallback, external URL validation, bridge failure error state, and keyboard focus navigation for the Curva Polinomial tool within the Allan Workbench ecosystem.

## Requirements

### Requirement: SSO session validation via AppBridge
The system SHALL verify the user session by listening for the `workbench-ready` custom event dispatched by `workbench-bridge.js` loaded from `CONFIG.PORTAL_URL`. The calculator UI SHALL only initialize after receiving a valid session from this event.

#### Scenario: Valid session received
- **WHEN** `workbench-ready` event fires with a valid session object in `event.detail.session`
- **THEN** the calculator UI is initialized and becomes interactive

#### Scenario: No session (redirect handled by bridge)
- **WHEN** `workbench-ready` event does NOT fire (session invalid or missing)
- **THEN** the workbench-bridge redirects user to the portal login page; calculator never initializes

### Requirement: Supabase client initialization
The system SHALL initialize a Supabase client using `CONFIG.SUPABASE_URL` and `CONFIG.SUPABASE_ANON_KEY` with `persistSession: true` and a storage key matching the format `sb-<SUPABASE_PROJECT_ID>-auth-token` for shared session storage across tools.

#### Scenario: Client singleton
- **WHEN** `getSupabaseClient()` is called multiple times
- **THEN** the same client instance is returned (no duplicate initialization)

#### Scenario: SDK not loaded
- **WHEN** `window.supabase` is undefined (CDN failed to load)
- **THEN** system logs error and returns null; bridge handles recovery

### Requirement: Auth state change listener
The system SHALL register an `onAuthStateChange` listener on the Supabase client to detect `SIGNED_OUT` events (session expiration, logout from another tab). On `SIGNED_OUT` the system SHALL perform concrete cleanup: destroy any active `chartInstance` (set to `null`), clear `lastResults`, hide `#results` and `#excel-box`, then redirect the user to `CONFIG.PORTAL_URL` (after validating the URL per the External URL validation requirement).

#### Scenario: Session expires in another tab
- **WHEN** user logs out from the portal in another browser tab and Supabase fires `SIGNED_OUT`
- **THEN** the system destroys `chartInstance`, clears `lastResults`, hides `#results`/`#excel-box`, and redirects to `CONFIG.PORTAL_URL`

### Requirement: Static HTML fallback
The `index.html` SHALL render visible content before any JavaScript executes, ensuring the user does not see a blank screen if the CDN or scripts fail to load.

#### Scenario: JS fails to load
- **WHEN** Supabase CDN or bridge script fails to load
- **THEN** the calculator UI shell (header, input fields, buttons) is still visible to the user

### Requirement: External URL validation
The system SHALL validate any redirect URL using a regex pattern (`/^https?:\/\//`) before executing `window.location.href` changes, preventing `javascript:` or other dangerous scheme injection. This applies to every redirect initiated by the tool's own code (notably the `SIGNED_OUT` handler redirecting to `CONFIG.PORTAL_URL`). Redirects performed inside `workbench-bridge.js` (loaded from the portal) are out of scope for this requirement -- they are owned by the portal codebase.

#### Scenario: Safe redirect
- **WHEN** `SIGNED_OUT` fires and `CONFIG.PORTAL_URL` is `https://allanuchoa.github.io/portal/`
- **THEN** the redirect to portal is allowed because the URL matches `^https?://`

#### Scenario: Unsafe URL blocked
- **WHEN** a URL intended for `window.location.href` does NOT match `^https?://`
- **THEN** the redirect is blocked and the system logs an error to the console instead of navigating

### Requirement: Bridge load failure error state
If `workbench-bridge.js` fails to load (portal CDN unreachable) the `workbench-ready` event never fires and the calculator never initializes. The system SHALL detect this condition via a timeout (e.g., 8 seconds after `DOMContentLoaded` with no `workbench-ready` event) and surface a visible error state with a "Tentar novamente" button that reloads the page, satisfying AGENTS.md section 8.1 (Error state must be distinct from Empty).

#### Scenario: Bridge never dispatches workbench-ready
- **WHEN** 8 seconds elapse after `DOMContentLoaded` and no `workbench-ready` event has been received
- **THEN** the static calculator shell displays an error banner ("Nao foi possivel validar sua sessao. Verifique sua conexao e tente novamente.") with a reload button, in addition to the visible input shell

### Requirement: Focus-visible keyboard navigation
All interactive elements (buttons, inputs) SHALL display a visible focus indicator using a 2px solid `--color-primary-soft` outline with 2px offset when focused via keyboard.

#### Scenario: Tab navigation
- **WHEN** user presses Tab to navigate between inputs and buttons
- **THEN** each focused element shows a 2px green outline with 2px offset
