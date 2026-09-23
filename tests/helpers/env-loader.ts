import path from 'node:path';
import dotenv from 'dotenv';
import { type APIRequestContext } from '@playwright/test';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Carrega `.env.{sistema}` da raiz do projeto.
 * Variáveis já definidas no processo (ex.: secrets do CI) têm precedência sobre o arquivo.
 */
export function loadEnv(sistema: string): void {
  dotenv.config({ path: path.join(PROJECT_ROOT, `.env.${sistema}`), quiet: true });
}

function lerVariavel(nome: string): string | undefined {
  // eslint-disable-next-line security/detect-object-injection -- nome de variável de ambiente, não entrada externa
  return process.env[nome];
}

/** Falha com mensagem clara se alguma variável obrigatória estiver ausente ou vazia. */
export function validateEnv(obrigatorias: string[]): void {
  const ausentes = obrigatorias.filter((nome) => !lerVariavel(nome)?.trim());
  if (ausentes.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${ausentes.join(', ')}. ` +
        'Copie .env.example para .env.{sistema} e preencha os valores.',
    );
  }
}

/** Lê uma variável já validada por `validateEnv`. */
export function env(nome: string): string {
  const valor = lerVariavel(nome);
  if (!valor) throw new Error(`Variável de ambiente não definida: ${nome}`);
  return valor;
}

/** Verifica se o endpoint de health responde com sucesso, para pular testes quando o sistema está fora do ar. */
export async function sistemaDisponivel(request: APIRequestContext, url: string): Promise<boolean> {
  try {
    const response = await request.get(url, { timeout: 10_000 });
    return response.ok();
  } catch {
    return false;
  }
}
