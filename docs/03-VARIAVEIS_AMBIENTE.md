# 🔐 Guia de Variáveis de Ambiente

Gerenciar credenciais de forma **segura** e **organizada**.

---

## 📋 Visão Geral

Este projeto usa um arquivo `.env.{dominio}` por sistema para manter URLs e credenciais **fora do Git**. No CI, os mesmos nomes de variável vêm de **GitHub Variables/Secrets**.

## 🗂️ Estrutura de Arquivos

```
projeto/
├── .env.example          # Template (COMMITAR) — só valores de exemplo
├── .env.hub-leitura      # Credenciais do Hub de Leitura (GITIGNORE)
├── .env.{dominio}        # Um arquivo por domínio (GITIGNORE)
└── .gitignore            # Garante que .env* não são commitados
```

**`.gitignore` (já configurado):**

```
.env
.env.*
!.env.example
```

---

## 🚀 Como Usar

### 1. Setup Inicial

**Copie o `.env.example` com o nome do domínio (igual ao nome da pasta em `tests/`):**

```bash
cp .env.example .env.hub-leitura
```

**Edite com suas credenciais:**

```bash
code .env.hub-leitura
```

### 2. Nos Testes

Os helpers ficam em `tests/helpers/env-loader.ts` (também reexportados por `evidencia-helper.ts`):

| Função                          | O que faz                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `loadEnv('dominio')`            | Carrega `.env.{dominio}` da raiz do projeto                                  |
| `validateEnv([...])`            | Falha com mensagem clara se alguma variável estiver ausente ou vazia         |
| `env('NOME')`                   | Lê uma variável como `string` (sem `!` nem `undefined`)                      |
| `sistemaDisponivel(request, u)` | Retorna `true` se a URL responde, para pular testes com o sistema fora do ar |

```typescript
import { test, expect } from '@playwright/test';
import { env, loadEnv, validateEnv } from '../helpers/env-loader';

// No topo do arquivo: roda antes de qualquer teste ou hook.
loadEnv('hub-leitura');

test.describe('Hub de Leitura - Login', () => {
  test.beforeAll(() => {
    validateEnv(['HUBLEITURA_BASE_URL', 'HUBLEITURA_USER', 'HUBLEITURA_PASSWORD']);
  });

  test('CT-01 - Deve fazer login com credenciais válidas', async ({ page }) => {
    await page.goto(`${env('HUBLEITURA_BASE_URL')}/login.html`);
    await page.getByLabel(/e-?mail/i).fill(env('HUBLEITURA_USER'));
    await page.getByLabel(/senha/i).fill(env('HUBLEITURA_PASSWORD'));
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

> ⚠️ Não chame `loadEnv` dentro de `beforeAll`: qualquer constante do arquivo que leia `process.env` já terá sido avaliada antes do hook rodar.

---

## 📝 Variáveis Disponíveis

### `.env.example` (Template Base)

```env
# ==================================
# Hub de Leitura  →  cp .env.example .env.hub-leitura
# ==================================
HUBLEITURA_BASE_URL=http://localhost:3001
HUBLEITURA_API_URL=http://localhost:3000
HUBLEITURA_USER=usuario@exemplo.com
HUBLEITURA_PASSWORD=troque-me

# ==================================
# Novo sistema  →  cp .env.example .env.{sistema}
# ==================================
# MEUSISTEMA_BASE_URL=https://staging.meusistema.com.br
# MEUSISTEMA_USER=qa@meusistema.com.br
# MEUSISTEMA_PASSWORD=troque-me
```

### Padrão de Nomenclatura

Para adicionar novo sistema, siga o padrão:

```env
NOMEDOSISTEMA_BASE_URL=...
NOMEDOSISTEMA_API_URL=...     # se houver API separada
NOMEDOSISTEMA_USER=...
NOMEDOSISTEMA_PASSWORD=...
```

**Exemplos:** `HUBLEITURA_BASE_URL`, `SANSYS_BASE_URL`, `SALESFORCE_USER`

---

## ⚙️ No CI (GitHub Actions)

No CI não existe arquivo `.env.*`: as variáveis vêm do GitHub e o `loadEnv` simplesmente não encontra arquivo (sem erro).

| Tipo                     | Onde cadastrar                                           | Exemplos                                    |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------- |
| **Variables** (visíveis) | `Settings → Secrets and variables → Actions → Variables` | `HUBLEITURA_BASE_URL`, `HUBLEITURA_API_URL` |
| **Secrets** (mascarados) | `Settings → Secrets and variables → Actions → Secrets`   | `HUBLEITURA_USER`, `HUBLEITURA_PASSWORD`    |

Depois, exponha-as no bloco `env` do job em `.github/workflows/ci.yml`.

---

## 🔒 Segurança - Checklist Obrigatório

### ✅ O que FAZER:

```bash
# ✅ Verificar que o .env do domínio está ignorado
git check-ignore -v .env.hub-leitura

# ✅ Verificar que não há credenciais no código
npm run secrets:check

# ✅ Compartilhar credenciais por canais seguros
# (Vault, 1Password, Bitwarden)

# ✅ Rotacionar senhas periodicamente
```

### ❌ O que NUNCA fazer:

```typescript
// ❌ NUNCA hardcode credenciais
const user = 'usuario_teste';
const pass = 'senha123';

// ❌ NUNCA force o commit de um .env
// git add -f .env.hub-leitura

// ❌ NUNCA compartilhe credenciais em chat/email
// ❌ NUNCA use credenciais de produção em testes
```

---

## 🚨 Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias ausentes: HUBLEITURA_USER"

**Causa:** o arquivo `.env.hub-leitura` não existe, o nome não bate com o `loadEnv('hub-leitura')`, ou a variável está vazia.

```bash
ls -la .env.*
code .env.hub-leitura
```

### Teste usa um valor diferente do que está no arquivo

**Causa:** variáveis já definidas no terminal (ou no CI) têm **precedência** sobre o arquivo `.env.*`.

```bash
# Bash
env | grep HUBLEITURA
unset HUBLEITURA_BASE_URL

# PowerShell
Get-ChildItem Env:HUBLEITURA*
Remove-Item Env:HUBLEITURA_BASE_URL
```

### Testes aparecem como "skipped"

**Causa:** `sistemaDisponivel()` não conseguiu acessar o sistema (ex.: containers Docker parados). O motivo aparece no relatório.

```bash
curl http://localhost:3001/api/health
```

---

## 🔗 Referências

- [Dotenv Documentation](https://github.com/motdotla/dotenv)
- [Twelve-Factor App - Config](https://12factor.net/config)
- [Playwright - Parametrize tests](https://playwright.dev/docs/test-parameterize)
- [GitHub Actions - Variables](https://docs.github.com/actions/learn-github-actions/variables)
