# 🎯 Estratégias para Seletores Robustos

Guia prático de seletores que **resistem** a mudanças na UI.

---

## 🥇 Prioridade 1: Use Sempre (80%+ do código)

### `getByRole()`

A forma MAIS ROBUSTA - testa a acessibilidade da aplicação.

```typescript
// Login
page.getByRole('button', { name: /entrar|login/i });
page.getByRole('link', { name: /cadastro/i });
page.getByRole('button', { name: /cancelar|fechar/i });

// Menus
page.getByRole('menuitem', { name: /configurações/i });
page.getByRole('tab', { name: /aba 1/i });

// Formulários
page.getByRole('textbox', { name: /email/i });
page.getByRole('checkbox', { name: /aceitar termos/i });
page.getByRole('combobox', { name: /país/i });
```

### `getByLabel()`

Campos com `<label>` associado:

```typescript
// Formulários
page.getByLabel(/email|e-mail/i);
page.getByLabel(/senha|password/i);
page.getByLabel(/nome completo|full name/i);
page.getByLabel(/confirmar senha/i);
```

### `getByPlaceholder()`

Para campos com placeholder:

```typescript
page.getByPlaceholder(/buscar\.\.\./i);
page.getByPlaceholder(/digite seu cpf/i);
page.getByPlaceholder(/data de nascimento/i);
```

### `getByTestId()`

Quando desenvolvedor adiciona `data-testid`:

```typescript
page.getByTestId('user-menu-button');
page.getByTestId('search-input');
page.getByTestId('submit-button');
```

---

## 🥈 Prioridade 2: Quando Prioridade 1 não funciona (15-20%)

### Atributos Semânticos

```typescript
// aria-label
page.locator('[aria-label="Fechar modal"]');
page.locator('[aria-label*="usuário"]'); // Contém "usuário"
page.locator('[aria-label^="Menu"]'); // Começa com "Menu"

// title
page.locator('[title="Clique para editar"]');
page.locator('[title*="deletar"]');

// data-* attributes
page.locator('[data-user-id="123"]');
page.locator('[data-test-type="login-button"]');
page.locator('[data-action="submit"]');

// name (para inputs)
page.locator('input[name="email"]');
page.locator('input[name="password"]');
page.locator('select[name="country"]');
```

---

## 🥉 Prioridade 3: Fallbacks com .or() (até 5%)

Use **múltiplas estratégias** como fallback:

```typescript
// Padrão de fallback
const button = page
  .getByRole('button', { name: /sair/i })
  .or(page.locator('[aria-label="Logout"]'))
  .or(page.locator('[title="Sair do sistema"]'));

await button.click();
```

> ⚠️ `.or()` falha com _strict mode violation_ se **mais de uma** alternativa existir na página ao mesmo tempo. Use apenas alternativas mutuamente exclusivas (ex.: versões diferentes da UI).

---

## ❌ NUNCA Faça Isso

### IDs Hardcoded

```typescript
// ❌ RUIM - ID pode mudar a qualquer momento
page.locator('#btn-123');
page.locator('#user-options-456');

// ✅ MELHOR - Nome acessível, com fallback semântico
page.getByRole('button', { name: /sair/i }).or(page.locator('[aria-label="Opções do usuário"]'));
```

### Classes CSS Geradas

```typescript
// ❌ RUIM - Classes mudam a cada build
page.locator('.css-abc123def456');
page.locator('.generated-uuid-xyz');

// ✅ MELHOR
page.getByRole('button', { name: /entrar/i });
```

### Seletores por Posição

```typescript
// ❌ RUIM - Quebra se ordem mudar
page.locator('button').first();
page.locator('.item').nth(2);

// ✅ MELHOR - Por conteúdo
page.getByRole('button', { name: /entrar/i });
page.getByRole('listitem').filter({ hasText: /item 3/i });
```

---

## 🎨 Padrões por Tipo de Elemento

### Login/Logout

```typescript
// Login
const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
const passwordInput = page
  .getByLabel(/senha|password/i)
  .or(page.getByPlaceholder(/senha|password/i));
const loginBtn = page.getByRole('button', { name: /entrar|login|acessar/i });

await emailInput.fill('user@example.com');
await passwordInput.fill('password123');
await loginBtn.click();

// Logout
const userMenu = page
  .getByRole('button', { name: /perfil|usuário|conta/i })
  .or(page.locator('[aria-label*="usuário"]'));
const logoutBtn = page
  .getByRole('button', { name: /sair|logout|desconectar/i })
  .or(page.locator('[title*="sair"]'));

await userMenu.click();
await logoutBtn.click();
```

### Formulários

```typescript
// Campo de texto
const nomeField = page
  .getByLabel(/nome/i)
  .or(page.getByPlaceholder(/digite seu nome/i))
  .or(page.locator('input[name*="name"]'));
await nomeField.fill('João Silva');

// Select/Dropdown
const paisSelect = page.getByLabel(/país/i).or(page.locator('select[name="pais"]'));
await paisSelect.selectOption('Brasil');

// Checkbox
const termsCheckbox = page
  .getByLabel(/aceitar termos/i)
  .or(page.locator('input[type="checkbox"][value="terms"]'));
await termsCheckbox.check();

// Radio Button
await page.getByRole('radio', { name: /^sim$/i }).check();

// Campo sem label nem placeholder (Prioridade 2: atributo name, com comentário explicando)
// O <select> de assunto não tem nome acessível.
const assunto = page.locator('select[name="subject"]');
await assunto.selectOption({ label: 'Sugestões' });
```

### Tabelas/Grids

```typescript
// Procurar linha por conteúdo
const linhaUsuario = page.getByRole('row').filter({ hasText: /joão silva/i });
await linhaUsuario.getByRole('button', { name: /editar/i }).click();

// Ou por atributo de dados
const linhaOS = page.locator(`tr[data-os-id="${numeroOS}"]`);
await linhaOS.getByRole('button', { name: /editar/i }).click();

// Validar célula da linha (por conteúdo, nunca por índice de coluna)
await expect(linhaUsuario.getByRole('cell', { name: /ativo/i })).toBeVisible();
```

### Modais/Diálogos

```typescript
// Abrir modal
const btnAbrirModal = page.getByRole('button', { name: /novo|criar|adicionar/i });
await btnAbrirModal.click();

// Validar modal está visível
const modal = page.getByRole('dialog');
await expect(modal).toBeVisible();

// Fechar modal (busca dentro do modal, não na página inteira)
await modal.getByRole('button', { name: /fechar|cancelar/i }).click();
await expect(modal).toBeHidden();
```

> Evite `if (await x.isVisible())`: o teste passa a aceitar dois comportamentos diferentes e esconde bugs. Se o modal deve aparecer, afirme com `expect`.

### Alertas/Toast

```typescript
// Aguardar mensagem de sucesso
await expect(page.getByText(/sucesso|criado com|salvo/i)).toBeVisible();

// Validar dentro do alerta
await expect(page.getByRole('alert')).toContainText(/sucesso/i);
```

---

## 🧪 Testando Seletores

Use o modo **headed** para debugar seletores:

```bash
# Abrir com interface visual
npx playwright test seu-teste.spec.ts --headed

# Inspecionar elemento no Playwright Inspector
npx playwright test seu-teste.spec.ts --debug
```

---

### Com o MCP

Peça ao agente um `browser_snapshot`: ele devolve a árvore de acessibilidade (roles e nomes), que é exatamente o que `getByRole`/`getByLabel` usam. Extraia os seletores dali, não do HTML.

### Garantia automática

`npm run lint` falha se o código usar `#id`, `.classe`, `:nth-child`, `.first()`/`.last()`/`.nth()` ou `waitForTimeout()`, e avisa sobre `page.locator()` cru (Prioridade 2 precisa de justificativa).

---

## 📊 Checklist de Qualidade de Seletores

- [ ] > = 80% usando `getByRole`, `getByLabel`, `getByPlaceholder`, `getByTestId`
- [ ] <= 15% usando atributos semânticos
- [ ] <= 5% usando fallbacks com `.or()`
- [ ] 0% com IDs hardcoded, classes geradas, ou posição
- [ ] Regex com flag `/i` (case-insensitive)
- [ ] Funciona com variações de texto (maiúscula, minúscula)
- [ ] Não quebra se UI mudar levemente

---

## 🎓 Benchmark

**Antes (RUIM):**

```typescript
await page.locator('#btn-123').click();
await page.locator('.css-abc123').fill('texto');
await page.locator('div:nth-child(2)').click();
```

❌ Quebra com pequenas mudanças na UI

**Depois (BOM):**

```typescript
await page.getByRole('button', { name: /enviar/i }).click();
await page.getByLabel(/email/i).fill('texto');
await page.getByRole('row', { name: /item 2/i }).click();
```

✅ Resistente a mudanças na UI
