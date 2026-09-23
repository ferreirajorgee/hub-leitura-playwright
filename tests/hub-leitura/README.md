# Hub de Leitura

Sistema fictício de treinamento para QA.

| Camada         | URL                                                                     | Variável              |
| -------------- | ----------------------------------------------------------------------- | --------------------- |
| Front-end (UI) | http://localhost:3001 (container `gms-frontend`)                        | `HUBLEITURA_BASE_URL` |
| API            | http://localhost:3000 (container `gms-backend`, Swagger em `/api-docs`) | `HUBLEITURA_API_URL`  |

Os dois containers rodam no projeto Docker `projeto-docker`. O front repassa `/api/*` para o back. A versão publicada (https://hub-de-leitura.vercel.app) está sem back-end e não é usada.
As credenciais são as contas de teste públicas exibidas na própria tela de login e ficam em `.env.hub-leitura`.

## Cenários

| Arquivo                | Cenário                                      | Tipo |
| ---------------------- | -------------------------------------------- | ---- |
| `login.spec.ts`        | CT-01 login válido redireciona ao dashboard  | UI   |
| `login.spec.ts`        | CT-02 senha incorreta exibe erro             | UI   |
| `contato-form.spec.ts` | CT-01 campos, assuntos e botão do formulário | UI   |
| `contato-form.spec.ts` | CT-02 preenchimento dos campos (sem enviar)  | UI   |
| `api-login.spec.ts`    | CT-01 health check                           | API  |
| `api-login.spec.ts`    | CT-02 login válido retorna token             | API  |
| `api-login.spec.ts`    | CT-03 senha incorreta retorna 401            | API  |

## Pré-condições

- Suba os containers `gms-frontend` e `gms-backend` antes de rodar.
- `login.spec.ts` verifica `${HUBLEITURA_BASE_URL}/api/health` e é **pulado** se o front ou o back estiverem fora do ar.
- `api-login.spec.ts` é pulado se o back-end estiver fora do ar.
- `contato-form.spec.ts` não envia o formulário, para não disparar mensagens reais.

## Executar

```bash
npx playwright test tests/hub-leitura/
npx playwright test tests/hub-leitura/ --headed --workers=1
```

Evidências: `tests/evidencias/hub-leitura/`.
