import { test, expect } from '@playwright/test';
import { env, loadEnv, sistemaDisponivel, validateEnv } from '../helpers/env-loader';

loadEnv('hub-leitura');

test.describe('Hub de Leitura API - Autenticação', () => {
  test.beforeAll(async ({ request }) => {
    validateEnv(['HUBLEITURA_API_URL', 'HUBLEITURA_USER', 'HUBLEITURA_PASSWORD']);

    const disponivel = await sistemaDisponivel(request, `${env('HUBLEITURA_API_URL')}/api/health`);
    test.skip(!disponivel, `API ${env('HUBLEITURA_API_URL')} indisponível (/api/health)`);
  });

  test('CT-01 - Deve retornar status ok no health check', async ({ request }) => {
    const response = await request.get(`${env('HUBLEITURA_API_URL')}/api/health`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });

  test('CT-02 - Deve autenticar com credenciais válidas', async ({ request }) => {
    const response = await request.post(`${env('HUBLEITURA_API_URL')}/api/login`, {
      data: { email: env('HUBLEITURA_USER'), password: env('HUBLEITURA_PASSWORD') },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ email: env('HUBLEITURA_USER') });
    expect(body.token).toMatch(/^Bearer /);
  });

  test('CT-03 - Deve rejeitar senha incorreta', async ({ request }) => {
    const response = await request.post(`${env('HUBLEITURA_API_URL')}/api/login`, {
      data: { email: env('HUBLEITURA_USER'), password: `${env('HUBLEITURA_PASSWORD')}-invalida` },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'INVALID_CREDENTIALS' });
  });
});
