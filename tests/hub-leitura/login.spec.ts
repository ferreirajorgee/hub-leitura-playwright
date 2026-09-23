import { test, expect } from '@playwright/test';
import {
  createEvidenciaHelper,
  env,
  loadEnv,
  sistemaDisponivel,
  validateEnv,
} from '../helpers/evidencia-helper';

loadEnv('hub-leitura');

const SISTEMA = 'hub-leitura';

test.describe('Hub de Leitura - Login', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test.beforeAll(async ({ request }) => {
    validateEnv(['HUBLEITURA_BASE_URL', 'HUBLEITURA_USER', 'HUBLEITURA_PASSWORD']);

    const disponivel = await sistemaDisponivel(request, `${env('HUBLEITURA_BASE_URL')}/api/health`);
    test.skip(!disponivel, `API de ${env('HUBLEITURA_BASE_URL')} indisponível (/api/health)`);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${env('HUBLEITURA_BASE_URL')}/login.html`);
    await expect(page.getByRole('heading', { name: /entre com sua conta/i })).toBeVisible();
  });

  test('CT-01 - Deve fazer login com credenciais válidas', async ({ page }, testInfo) => {
    const tiraFoto = await createEvidenciaHelper(page, testInfo, SISTEMA);

    await test.step('Preencher credenciais', async () => {
      await page.getByLabel(/e-?mail/i).fill(env('HUBLEITURA_USER'));
      await page.getByLabel(/senha/i).fill(env('HUBLEITURA_PASSWORD'));
      await tiraFoto('01-credenciais-preenchidas');
    });

    await test.step('Clicar em Entrar', async () => {
      await page.getByRole('button', { name: /^\W*entrar$/i }).click();
      await expect(page.getByText(/login realizado com sucesso/i)).toBeVisible();
    });

    await test.step('Validar redirecionamento para o dashboard', async () => {
      await expect(page).toHaveURL(/dashboard\.html/);
      await tiraFoto('02-dashboard-carregado');
    });
  });

  test('CT-02 - Deve exibir erro ao fazer login com senha incorreta', async ({
    page,
  }, testInfo) => {
    const tiraFoto = await createEvidenciaHelper(page, testInfo, SISTEMA);

    await test.step('Preencher senha incorreta', async () => {
      await page.getByLabel(/e-?mail/i).fill(env('HUBLEITURA_USER'));
      await page.getByLabel(/senha/i).fill(`${env('HUBLEITURA_PASSWORD')}-invalida`);
    });

    await test.step('Clicar em Entrar e validar mensagem de erro', async () => {
      await page.getByRole('button', { name: /^\W*entrar$/i }).click();
      await expect(page.getByText(/e-?mail ou senha incorretos/i)).toBeVisible();
      await expect(page).toHaveURL(/login\.html/);
      await tiraFoto('01-erro-credenciais-invalidas');
    });
  });
});
