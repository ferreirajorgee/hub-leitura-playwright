import fs from 'node:fs/promises';
import path from 'node:path';
import { type Page, type TestInfo } from '@playwright/test';

export { loadEnv, validateEnv, env, sistemaDisponivel } from './env-loader';

const EVIDENCIAS_ROOT = path.resolve(__dirname, '..', 'evidencias');

type TiraFoto = (descricao: string) => Promise<void>;

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Cria a função de captura de evidências de um teste.
 * Arquivos: tests/evidencias/{sistema}/{teste}/{seq}-{timestamp}-{descricao}.png,
 * também anexados ao relatório HTML.
 *
 * A descrição pode vir com a sequência (`'01-pagina-inicial'`) ou sem (`'pagina-inicial'`),
 * caso em que a numeração é automática.
 */
export async function createEvidenciaHelper(
  page: Page,
  testInfo: TestInfo,
  sistema: string,
): Promise<TiraFoto> {
  const dir = path.join(
    EVIDENCIAS_ROOT,
    slug(sistema),
    slug(testInfo.titlePath.slice(1).join('-')),
  );
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- caminho montado a partir de slugs
  await fs.mkdir(dir, { recursive: true });

  let sequencia = 0;

  return async (descricao: string) => {
    const match = /^(\d+)-(.+)$/.exec(descricao);
    sequencia = match ? Number(match[1]) : sequencia + 1;
    const nome = `${String(sequencia).padStart(2, '0')}-${timestamp()}-${slug(match ? match[2] : descricao)}.png`;

    const body = await page.screenshot({ path: path.join(dir, nome), fullPage: true });
    await testInfo.attach(nome, { body, contentType: 'image/png' });
  };
}
