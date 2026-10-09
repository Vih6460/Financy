# API Financy

Veja o [README da raiz](../README.md) para configuração e execução. A API usa GraphQL Yoga, Prisma e SQLite. O esquema completo fica em `src/schema.ts`.

As queries são `me`, `categories`, `transactions` e `summary`. As mutations são `register`, `login`, `updateProfile`, `createCategory`, `updateCategory`, `deleteCategory`, `createTransaction`, `updateTransaction` e `deleteTransaction`.

```graphql
mutation {
  register(input: {
    name: "Maria"
    email: "maria@exemplo.com"
    password: "minha-senha-segura"
  }) {
    token
    user { id name email }
  }
}
```

Envie o token retornado no cabeçalho `Authorization: Bearer <token>` nas operações protegidas.

```graphql
mutation {
  createCategory(input: {
    name: "Alimentação"
    description: "Refeições e delivery"
    color: "blue"
    icon: "utensils"
  }) { id name }
}

mutation {
  createTransaction(input: {
    description: "Almoço"
    amount: 4590
    type: EXPENSE
    date: "2026-10-09"
  }) { id description amount date }
}

query {
  transactions(filter: { month: "2026-10", type: EXPENSE }, page: 1, perPage: 10) {
    total
    totalPages
    items { id description amount date category { id name color icon } }
  }
  summary(month: "2026-10") { balance income expense }
}
```

`categoryId` é opcional na transação. Para associar uma categoria, use o ID retornado pela criação ou listagem da própria conta. Atualizações de categoria e transação recebem o formulário completo. `updateProfile` mantém a foto quando `avatar` é omitido e a remove quando recebe `null`.

Cores: `green`, `blue`, `purple`, `pink`, `red`, `orange`, `yellow`. Ícones: `briefcase`, `utensils`, `shopping-cart`, `home`, `car`, `heart`, `graduation-cap`, `gamepad`, `plane`, `gift`, `wallet`, `coffee`, `smartphone`, `paw-print`, `dumbbell`, `tag`, `baggage-claim`, `book-open`, `mailbox`, `piggy-bank`, `receipt-text`, `ticket`, `tool-case`.
