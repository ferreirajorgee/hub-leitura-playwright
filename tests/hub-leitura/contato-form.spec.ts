import { test, expect, type Page } from '@playwright/test';
import {
  createEvidenciaHelper,
  env,
  loadEnv,
  sistemaDisponivel,
  validateEnv,
} from '../helpers/evidencia-helper';

loadEnv('hub-leitura');

const SISTEMA = 'hub-leitura';
const ASSUNTOS = ['Dúvidas Gerais', 'Suporte Técnico', 'Sugestões', 'Parcerias'];

// O <select> de assunto não tem nome acessível: Prioridade 2 (atributo name).
// eslint-disable-next-line playwright/no-raw-locators
const campoAssunto = (page: Page) => page.locator('select[name="subject"]');

test.describe('Hub de Leitura - Formulário de Contato', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.beforeAll(async ({ request }) => {
    validateEnv(['HUBLEITURA_BASE_URL']);

    const disponivel = await sistemaDisponivel(request, env('HUBLEITURA_BASE_URL'));
    test.skip(!disponivel, `Front-end ${env('HUBLEITURA_BASE_URL')} indisponível`);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(env('HUBLEITURA_BASE_URL'));
    await expect(page.getByRole('heading', { name: /entre em contato/i })).toBeVisible();
  });

  test('CT-01 - Deve exibir os campos do formulário de contato', async ({ page }, testInfo) => {
    const tiraFoto = await createEvidenciaHelper(page, testInfo, SISTEMA);

    await test.step('Validar campos de texto', async () => {
      await expect(page.getByPlaceholder(/seu nome completo/i)).toBeVisible();
      await expect(page.getByPlaceholder(/seu e-?mail/i)).toHaveAttribute('type', 'email');
      await expect(page.getByPlaceholder(/escreva sua mensagem/i)).toBeVisible();
    });

    await test.step('Validar opções de assunto', async () => {
      const assunto = campoAssunto(page);
      for (const opcao of ASSUNTOS) {
        await expect(assunto.getByRole('option', { name: opcao })).toBeAttached();
      }
    });

    await test.step('Validar botão de envio', async () => {
      await expect(page.getByRole('button', { name: /enviar mensagem/i })).toBeEnabled();
      await tiraFoto('01-formulario-contato');
    });
  });

  test('CT-02 - Deve preencher todos os campos do formulário', async ({ page }, testInfo) => {
    const tiraFoto = await createEvidenciaHelper(page, testInfo, SISTEMA);

    await test.step('Preencher campos', async () => {
      await page.getByPlaceholder(/seu nome completo/i).fill('Maria Teste');
      await page.getByPlaceholder(/seu e-?mail/i).fill('maria.teste@mailinator.com');
      await campoAssunto(page).selectOption({ label: 'Sugestões' });
      await page.getByPlaceholder(/escreva sua mensagem/i).fill('Mensagem de teste automatizado.');
    });

    await test.step('Validar valores preenchidos', async () => {
      await expect(page.getByPlaceholder(/seu nome completo/i)).toHaveValue('Maria Teste');
      await expect(page.getByPlaceholder(/seu e-?mail/i)).toHaveValue('maria.teste@mailinator.com');
      await expect(campoAssunto(page)).toHaveValue('Sugestões');
      await tiraFoto('01-formulario-preenchido');
    });
  });
});
