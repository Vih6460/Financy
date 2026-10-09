export const typeDefs = /* GraphQL */ `
  enum TransactionType { INCOME EXPENSE }
  type User { id: ID!, name: String!, email: String!, avatar: String, createdAt: String! }
  type AuthPayload { token: String!, user: User! }
  type Category { id: ID!, name: String!, description: String!, color: String!, icon: String!, transactionCount: Int! }
  type Transaction { id: ID!, description: String!, amount: Int!, type: TransactionType!, date: String!, category: Category }
  type TransactionPage { items: [Transaction!]!, total: Int!, page: Int!, totalPages: Int! }
  type CategoryTotal { category: Category!, amount: Float!, transactionCount: Int! }
  type Summary { balance: Float!, income: Float!, expense: Float!, transactionCount: Int!, categoryCount: Int!, topCategories: [CategoryTotal!]! }
  input RegisterInput { name: String!, email: String!, password: String! }
  input LoginInput { email: String!, password: String! }
  input CategoryInput { name: String!, description: String, color: String!, icon: String! }
  input TransactionInput { description: String!, amount: Int!, type: TransactionType!, date: String!, categoryId: ID }
  input TransactionFilter { search: String, month: String, type: TransactionType, categoryId: ID }
  type Query {
    me: User!
    categories: [Category!]!
    transactions(filter: TransactionFilter, page: Int = 1, perPage: Int = 10): TransactionPage!
    summary(month: String!): Summary!
  }
  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(name: String!, avatar: String): User!
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    createTransaction(input: TransactionInput!): Transaction!
    updateTransaction(id: ID!, input: TransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!
  }
`
