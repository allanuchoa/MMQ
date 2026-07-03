# CHANGELOG - Curva Polinomial

## [1.1.0] - 2026-07-03

### Modificado
- Cabecalho: titulo convertido para eyebrow left-aligned (14px, 600, uppercase, `--color-ink`), removido subtitulo e cor verde - (Autor: Agente de IA DeepSeek)
- `.panel` agora preenche altura total com fundo `--color-canvas-soft` e borda `--color-hairline`; `.card` transparente como filho - (Autor: Agente de IA DeepSeek)
- Padding do `.chart-container-wrapper` unificado com `.card` em `--spacing-xl` (20px) - (Autor: Agente de IA DeepSeek)
- `.excel-box`: borda trocada de `--color-primary` para `--color-hairline`; fundo `--color-canvas` para contraste - (Autor: Agente de IA DeepSeek)
- `alert()` nativo substituido por `.form-error` inline com fundo `rgba(248,113,113,0.08)` e texto `--color-danger` - (Autor: Agente de IA DeepSeek)
- `input:focus {outline:none}` substituido por `input:focus-visible` com outline 2px `--color-primary-soft` + offset 2px - (Autor: Agente de IA DeepSeek)
- `#f59e0b` hardcoded trocado por `rootStyles.getPropertyValue('--amber')` - (Autor: Agente de IA DeepSeek)
- `.copy-btn-small` refatorado para `.btn-icon-copy` (button-ghost-green: sem borda, `--color-primary-soft`, hover 10% opacity) - (Autor: Agente de IA DeepSeek)
- `.btn-retry` removido; usa `.btn-secondary` como classe unificada - (Autor: Agente de IA DeepSeek)
- `.btn-primary:hover` trocado de `opacity:0.9` para `box-shadow` glow - (Autor: Agente de IA DeepSeek)
- Layout flex no `body`/`.container` (`flex:1`) substitui `calc(100vh - 48px)` hardcoded - (Autor: Agente de IA DeepSeek)
- Deteccao de `Chart === undefined` no `initApp()` exibe error-state imediatamente - (Autor: Agente de IA DeepSeek)

### Corrigido
- Portugues sem acentos no HTML estatico: "Metodo", "Minimos", "Polinomio", "virgula", "espaco", "Formula", "grafico", "Nao", "possivel" - (Autor: Agente de IA DeepSeek)
- `.result-label` 11px → 12px (caption) - (Autor: Agente de IA DeepSeek)
- `.excel-formula` 14px → 13px (code) - (Autor: Agente de IA DeepSeek)
- Canvas: adicionado `role="img"` + `aria-label="Grafico de ajuste polinomial"` - (Autor: Agente de IA DeepSeek)
- SVG de erro: adicionado `role="alert"` + `aria-label="Erro"` - (Autor: Agente de IA DeepSeek)

### Modificado
- `sql/setup.sql`: adicionada coluna `icon` ('function-square') no INSERT de `applications` (NOT NULL), tornando o onboarding alinhado ao template canônico - (Autor: Agente de IA GLM-5.2)

### Adicionado
- Cabeçalho de referência em `sql/setup.sql` apontando para o template canônico `../../template/sql/onboard-tool.template.sql` (método definitivo de onboarding de novas ferramentas) - (Autor: Agente de IA GLM-5.2)
- Documentação de onboarding idempotente em `../template/` (template SQL + seção "Contrato RLS do Registry" em ARCHITECTURE.md e STEP-BY-STEP.md atualizado) - (Autor: Agente de IA GLM-5.2)

### Corrigido
- Recursão infinita na policy RLS de `public.applications` (erro Postgres `42P17`) que impedia o portal de carregar a lista de ferramentas; fix aplicado diretamente no Supabase (não neste repositório) - (Autor: Agente de IA GLM-5.2)

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
