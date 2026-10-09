# Descrição e requisitos funcionais do Back-end
## Nesse projeto back-end, será desenvolvido uma API para gerenciar a organização das finanças.

### Funcionalidades e Regras
- O usuário pode criar uma conta e fazer login
- O usuário deve poder trocar a foto de perfil
- O usuário pode ver e gerenciar apenas as transações e categorias criadas por ele
- Deve ser possível criar uma transação
- Deve ser possível deletar uma transação
- Deve ser possível editar uma transação
- Deve ser possível listar todas as transações
- Deve ser possível criar uma categoria
- Deve ser possível deletar uma categoria
- Deve ser possível editar uma categoria
- Deve ser possível listar todas as categorias
- ⚠️ Para esse desafio é esperado que você utilize o banco de dados SQLite

### Variáveis ambiente
#### Todo projeto tem diversas configurações de variáveis que devem ser diferentes de acordo com o ambiente que ele é executado. Para isso, importante sabermos, de forma fácil e intuitiva, quais variáveis são essas. Então é obrigatório que esse projeto tenha um arquivo .env.example com as chaves necessárias.

```
JWT_SECRET=
DATABASE_URL=
```

#### Caso adicione variáveis adicionais, lembre-se de incluí-las no .env.example.

### Requisitos Não Funcionais
#### É obrigatório o uso de:

- TypeScript
- GraphQL
- Prisma
- SQLite

### Boas Práticas
#### Não se esqueça de habilitar o CORS na aplicação.

---

<br>

---

# Descrição e requisitos funcionais do Front-end
## Nesse projeto front-end será desenvolvido uma aplicação React que, em conjunto com a API, permite o gerenciamento de transações e categorias.

### Funcionalidades e Regras
#### Assim como na API, temos as seguintes funcionalidades e regras:

- O usuário pode criar uma conta e fazer login
- O usuário pode ver e gerenciar apenas as transações e categorias criadas por ele
- Deve ser possível criar uma transação
- Deve ser possível deletar uma transação
- Deve ser possível editar uma transação
- Deve ser possível listar todas as transações
- Deve ser possível criar uma categoria
- Deve ser possível deletar uma categoria
- Deve ser possível editar uma categoria
- Deve ser possível listar todas as categorias

#### Além disso, também temos algumas regras importantes específicas para o front-end:

- É obrigatória a criação de uma aplicação React usando GraphQL para consultas na API e Vite como bundler;
- Siga o mais fielmente possível o layout do Figma;

### Páginas
#### Essa aplicação possui 6 páginas e dois modais com os formulários (Dialog):

- A página raiz (/) que exibe:
    - Tela de login caso o usuário esteja deslogado
    - Tela dashboard caso usuário esteja logado

### Variáveis ambiente
#### Todo projeto tem diversas configurações de variáveis que devem ser diferentes de acordo com o ambiente que ele é executado. Para isso, importante sabermos, de forma fácil e intuitiva, quais variáveis são essas. Então é obrigatório que esse projeto tenha um arquivo .env.example com as chaves necessárias:

```
VITE_BACKEND_URL=
```

### Boas Práticas
- Comece o projeto pela aba Style Guide no Figma. Dessa forma, você prepara todo o seu tema, fontes e componentes e quando for criar as páginas vai ser bem mais tranquilo;
- Assim com a experiência do usuário é importante (UX), a sua experiência no desenvolvimento (DX) também é muito importante. Por isso, apesar de ser possível criar essa aplicação sem nenhuma biblioteca, recomendamos utilizar algumas bibliotecas que vão facilitar tanto o desenvolvimento inicial quanto a manutenção do código;

### Requisitos Não Funcionais
#### É obrigatório o uso de:

- Typescript
- React
- Vite sem framework
- GraphQL

#### É flexível o uso de:

- TailwindCSS
- Shadcn
- React Query
- React Hook Form
- Zod

### Entrega
#### É importante seguir alguns padrões para que possamos corrigir corretamente o seu projeto:

- O repositório deve ter duas subpastas
    - `backend` vai conter a resolução completa do desafio Back-end;
    - `frontend` vai conter a resolução completa do desafio Front-end.