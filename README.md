# Financy

Aplicação de organização financeira com React, Vite, TypeScript, GraphQL, Prisma e SQLite. O repositório contém `backend` e `frontend`, conforme os requisitos de [instrucoes.md](./instrucoes.md).

## Executar

Requisito: Node.js 22.12 ou superior e npm. Na raiz do repositório:

```sh
npm ci
npm run setup
npm run dev
```

- Frontend: http://localhost:5173
- API e explorador GraphQL: http://localhost:3333/graphql
- Verificação da API: http://localhost:3333/health

O setup cria os arquivos `.env` locais, gera um segredo JWT aleatório, gera o Prisma Client e aplica as migrações. O banco fica em `backend/prisma/dev.db`. As contas começam sem transações ou categorias; cadastre sua conta, crie suas categorias e registre suas transações.

Os arquivos `backend/.env.example` e `frontend/.env.example` documentam as configurações. Para configurar manualmente, copie os exemplos para `.env` e defina `JWT_SECRET` com pelo menos 32 caracteres. `DATABASE_URL` usa caminhos relativos à pasta `backend/prisma`. `FRONTEND_URL` deve corresponder à origem do frontend para o CORS.

## Funcionalidades

- Cadastro, login, sessão JWT, opção de lembrar a conta e logout.
- Dashboard com saldo acumulado, receitas e despesas do mês atual, cinco transações recentes e despesas mensais agrupadas por categoria.
- Transações com criação, edição, exclusão, busca, filtros por mês, tipo e categoria, e paginação.
- Categorias com nome, descrição opcional, ícone e cor, edição, exclusão e contagem de transações.
- Perfil com edição de nome, alteração e remoção de foto em PNG, JPEG ou WebP de até 2 MB.
- Estados vazios, mensagens de erro e sucesso, diálogos com navegação por teclado, fontes locais e layout responsivo.

Rotas: `/` (login ou dashboard), `/cadastro`, `/transacoes`, `/categorias` e `/perfil`. São seis telas, com formulários de categoria e transação em Dialog.

## Regras de dados

Cada consulta e mutação protegida identifica o usuário pelo JWT e verifica a propriedade dos registros no backend. Uma conta não pode vincular uma transação à categoria de outra conta. Senhas são armazenadas com scrypt e salt individual; o JWT expira em sete dias. As operações de autenticação têm limite de tentativas por endereço de rede.

Valores são inteiros em **centavos**. Por exemplo, `4590` equivale a R$ 45,90. Valores devem ser positivos; o tipo `INCOME` ou `EXPENSE` determina a entrada ou saída. Datas de transações são dias civis no formato `YYYY-MM-DD`, armazenados à meia-noite UTC, sem deslocamento no frontend. Excluir uma categoria mantém suas transações, que passam a ficar sem categoria.

## Validação

```sh
npm run check
```

Executa ESLint, build dos dois projetos e 15 testes de integração GraphQL em um banco SQLite temporário, independente do banco de desenvolvimento. Os testes cobrem autenticação, validação, CRUD, isolamento entre duas contas, filtros, paginação, totais, perfil e CORS.

```sh
npm run db:studio -w backend
npm run db:migrate -w backend -- --name nome_da_migracao
```

Para executar o backend compilado:

```sh
npm run build
npm run start -w backend
```

O backend carrega o `.env` a partir de sua pasta de execução. Em produção, configure `NODE_ENV=production` para desabilitar o explorador GraphQL. O frontend compilado fica em `frontend/dist`; o servidor de arquivos deve encaminhar rotas desconhecidas para `index.html`. Os servidores de desenvolvimento são vinculados a `127.0.0.1`.

## Referência visual

O layout segue o [Figma do projeto](https://www.figma.com/design/fXD68Q3hsIp9UPIA6MQspO/Financy--Community---c%C3%B3pia-), com fonte Inter, paleta do Style Guide e versões responsivas das seis telas e dos dois formulários.

Os modais de categoria e transação têm dimensões de **448 × 594** e **448 × 538** em desktop, respectivamente. O seletor de categoria oferece 16 ícones e sete cores. O logotipo e os ícones SVG ficam em `frontend/src/assets`. Os ícones usam máscaras CSS para aplicar as cores do tema e preservar as proporções; Lucide complementa os controles sem SVG correspondente.

O perfil permite alterar e remover a foto. Datas e períodos usam seletores nativos, com o período apresentado em português. Novos lançamentos preenchem a data atual, e os dados e totais refletem a conta autenticada.

A recuperação de senha não faz parte do escopo funcional.
