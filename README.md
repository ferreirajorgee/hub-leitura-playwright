# Automação E2E — Playwright + MCP

Testes E2E e de API do **Hub de Leitura** com Playwright + TypeScript, organizados por domínio e integrados ao Playwright MCP Server para geração de testes assistida por IA.

Documentação completa em [`docs/`](docs/00-ARQUITETURA.md).

## Pré-requisitos

- Node.js 20+
- Aplicação rodando localmente (containers Docker): front em `http://localhost:3001`, API em `http://localhost:3000`

## Setup

```bash
npm ci
npx playwright install chromium
cp .env.example .env.hub-leitura   # e preencha as credenciais
npm test
```

## Scripts

| Comando                           | Descrição                                          |
| --------------------------------- | -------------------------------------------------- |
| `npm test`                        | Todos os testes (headless)                         |
| `npm run test:headed`             | Navegador visível, 1 worker                        |
| `npm run test:debug`              | Playwright Inspector                               |
| `npm run test:ui`                 | UI mode                                            |
| `npm run test:codegen`            | Gravador de ações                                  |
| `npm run test:report`             | Relatório HTML (com evidências anexadas)           |
| `npm run test:hub-leitura`        | Só o domínio Hub de Leitura                        |
| `npm run test:stability`          | Cada teste 3x seguidas                             |
| `npm run lint` / `lint:fix`       | ESLint (Playwright + security + seletores frágeis) |
| `npm run format` / `format:check` | Prettier                                           |
| `npm run typecheck`               | TypeScript                                         |
| `npm run secrets:check`           | secretlint                                         |
| `npm run audit:check`             | `npm audit` (high+)                                |
| `npm run mcp`                     | Sobe o servidor MCP manualmente                    |

## Qualidade automatizada

- **Pre-commit** (husky + lint-staged): ESLint, Prettier, secretlint e typecheck nos arquivos alterados.
- **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): o job de qualidade roda em todo push/PR; o job E2E roda quando há um ambiente configurado no GitHub. Veja [docs/00-ARQUITETURA.md → Integração Contínua](docs/00-ARQUITETURA.md#-integração-contínua).
- **Dependabot**: PRs mensais de atualização (Playwright, MCP, ferramentas de lint, actions).

## MCP

O servidor `playwright` está registrado em `.mcp.json` (Claude Code) e `.vscode/mcp.json` (VS Code/Copilot), com versão fixada no `package.json`. As regras para o agente estão em [`CLAUDE.md`](CLAUDE.md).

## Novo domínio

Veja [docs/00-ARQUITETURA.md → Como Adicionar um Novo Domínio](docs/00-ARQUITETURA.md#-como-adicionar-um-novo-domínio).
