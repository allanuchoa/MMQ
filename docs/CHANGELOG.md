# CHANGELOG - Curva Polinomial

## [1.0.0] - 2026-07-02

### Adicionado
- Integracao completa da calculadora MMQ standalone ao ecossistema Allan Workbench - (Autor: Agente de IA Claude)
- CSS reescrito do zero com tokens DESIGN.md (canvas #101010, primary #00d992, Inter + SF Mono)
- SSO via Supabase Auth + AppBridge (evento workbench-ready)
- onAuthStateChange para tratamento de SIGNED_OUT e redirecionamento ao portal
- Watchdog de 8s para falha do workbench-bridge
- validacao de URL de redirecionamento contra injecao de esquemas perigosos
- Estados de interface: loading (empty-state no chart), error (chart-error-state + global-error-banner)
- Formula Excel em formato decimal padrao (nao cientifico)
- Cores do Chart.js resolvidas via CSS custom properties (zero hex literals)
- Script SQL idempotente para registro da ferramenta em public.applications
- Template RLS comentado para tabelas futuras com prefixo cvp_
- Documentacao completa: README.md, docs/AGENTS.md, docs/CHANGELOG.md
- .gitignore configurado
