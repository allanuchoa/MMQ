# Curva Polinomial - MMQ

Calculadora de ajuste polinomial pelo Metodo dos Minimos Quadrados, integrada ao Allan Workbench.

## Como rodar localmente

1. Abra o diretorio do projeto em um terminal
2. Sirva os arquivos estaticos com um servidor HTTP local:

```bash
npx serve .
# ou
python -m http.server 8080
```

3. Abra `http://localhost:8080` no navegador

## Stack

- HTML5, CSS3, JavaScript ES6+
- Chart.js v4 (CDN)
- Supabase Auth (SSO via AppBridge)

## Estrutura

```
.
├── index.html       Página principal da calculadora
├── app.js           Logica de negocios (calculadora MMQ + integracao bridge)
├── styles.css       Estilos (DESIGN.md compliant)
├── config.js        Configuracoes Supabase e URL do Portal
├── supabase.js      Cliente Supabase singleton
├── docs/
│   ├── AGENTS.md    Regras especificas da ferramenta
│   ├── CHANGELOG.md  Historico de alteracoes
│   └── PRD/         Prototipo standalone original
├── sql/
│   └── setup.sql    Script de registro da ferramenta no banco
└── openspec/        Especificacoes e design da integracao
```

## Deploy

Basta fazer deploy dos arquivos estaticos em qualquer servidor HTTP compativel com GitHub Pages. O acesso ao Portal e controlado via Supabase + AppBridge.
