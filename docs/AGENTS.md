# AGENTS.md - Curva Polinomial

Regras e contexto especifico para agentes de IA atuando nesta ferramenta.

## Identificacao

- **Slug**: `curva-polinomial`
- **Prefixo de tabelas**: `cvp_`
- **Categoria**: Engineering

## Tabelas no Banco

**v1: Nenhuma tabela especifica.** A ferramenta e 100% client-side. O unico registro necessario e a entrada na tabela `public.applications` para que a ferramenta apareca no portal.

Para versoes futuras que precisarem de persistencia, use o prefixo `cvp_` e siga o template RLS em `sql/setup.sql`.

## Algoritmo

### Metodo dos Minimos Quadrados (MMQ)

1. **Entrada**: Conjunto de pontos `(x_i, y_i)` e ordem `n` do polinomio
2. **Matriz de Vandermonde**: `X[i][j] = x_i^j`
3. **Equacoes Normais**: `A = X^T * X`, `B = X^T * Y`
4. **Resolucao**: Eliminacao Gaussiana com pivotamento parcial
5. **Coeficientes**: `[a_0, a_1, ..., a_n]` onde `y = a_0 + a_1*x + a_2*x^2 + ...`
6. **Erro**: Soma dos quadrados dos residuos `Σ(y_i_real - y_i_pred)^2`

### Formatacao de Saida

- **Display do polinomio**: Notacao cientifica `toExponential(4)` (ex: `5.1234e-3`)
- **Formula Excel**: Representacao decimal padrao `val.toString()` (ex: `0.0051234`)

## Restricoes da Interface

- Ordem maxima do polinomio: 10
- Numero minimo de pontos: `ordem + 1`
- Sem persistencia de dados entre sessoes

## Integracao

- SSO via Supabase Auth validado pelo AppBridge (carregado dinamicamente do portal)
- `onAuthStateChange` escuta `SIGNED_OUT` e redireciona ao portal
- App inicializa em `DOMContentLoaded` (bridge valida sessao e redireciona se invalida)
- Chart.js carregado via CDN no `<head>`
- Cores do grafico resolvidas via CSS custom properties
