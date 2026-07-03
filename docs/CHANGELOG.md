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

### Corrigido (code-review)
- #1: coluna `icon` adicionada ao INSERT em sql/setup.sql
- #2: `window.supabase` corrigido para variavel lexical `supabase` (onAuthStateChange agora registra corretamente)
- #3: removidas linhas `AGENTS.md` e `docs/` do .gitignore
- #4: guarda de pivot zero em solveLinearSystem (throw Error em matriz singular)
- #5: `toDecimalStr()` substitui `val.toString()` para formula Excel em decimal puro
- #6: Excel box migrado para dark mode (fundo `--color-canvas-soft`, texto `--color-ink`, borda `--color-primary`)
- #7: guarda `navigator.clipboard` em copyToExcel
- #9: acentos restaurados nas mensagens PT-BR (numero, polinomio, voce, calculo, nao)
- #10: `--rounded-xs: 4px` adicionado ao :root e removidos fallbacks inline
- #11: `hexToRgba()` substitui concatenacao `primary + '1A'`
- #12: code style: rootStyles, remove unused param, hoist `var i` em displayResults
