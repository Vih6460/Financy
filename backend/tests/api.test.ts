import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PrismaClient } from '@prisma/client'
const directory = mkdtempSync(join(tmpdir(), 'financy-test-'))
const databasePath = join(directory, 'test.db')
writeFileSync(databasePath, '')
process.env.JWT_SECRET = 'financy-test-secret-with-at-least-32-characters'
process.env.DATABASE_URL = `file:${databasePath}`
const { createApp } = await import('../src/app.js')
const db = new PrismaClient()
const app = createApp(db)
type Result<T> = { data: T; errors?: { message: string; extensions: { code?: string } }[] }
async function gql<T = Record<string, unknown>>(query: string, variables: Record<string, unknown> = {}, token?: string): Promise<Result<T>> {
  const response = await app.fetch(new Request('http://localhost/graphql', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ query, variables }) }))
  assert.equal(response.status, 200)
  return response.json() as Promise<Result<T>>
}
type Auth = { token: string; user: { id: string; name: string; email: string } }
type Category = { id: string; name: string; description: string; color: string; icon: string; transactionCount: number }
type Transaction = { id: string; description: string; amount: number; type: string; date: string; category: Category | null }
const categoryFields = 'id name description color icon transactionCount'
const txFields = `id description amount type date category { ${categoryFields} }`
let alice: Auth; let bob: Auth; let category: Category; let transaction: Transaction
const categoryInput = { name: 'Alimentação', description: 'Refeições', color: 'blue', icon: 'utensils' }
const txInput = { description: 'Almoço', amount: 4590, type: 'EXPENSE', date: '2026-10-09' }
before(async () => {
  const migration = readdirSync('prisma/migrations').find(name => name.endsWith('_init'))!
  const sql = readFileSync(join('prisma/migrations', migration, 'migration.sql'), 'utf8')
  for (const statement of sql.split(';').filter(value => value.trim())) await db.$executeRawUnsafe(statement)
})
after(async () => { await db.$disconnect(); rmSync(directory, { recursive: true, force: true }) })
test('cadastro normaliza e-mail, armazena hash e emite JWT', async () => {
  const query = 'mutation($input: RegisterInput!) { register(input: $input) { token user { id name email } } }'
  const result = await gql<{ register: Auth }>(query, { input: { name: 'Alice', email: 'ALICE@example.com', password: 'senha-segura-123' } })
  assert.equal(result.errors, undefined); alice = result.data.register
  assert.equal(alice.user.email, 'alice@example.com'); assert.equal(alice.token.split('.').length, 3)
  const stored = await db.user.findUniqueOrThrow({ where: { id: alice.user.id } }); assert.notEqual(stored.passwordHash, 'senha-segura-123')
  const second = await gql<{ register: Auth }>(query, { input: { name: 'Bob', email: 'bob@example.com', password: 'outra-senha-123' } }); bob = second.data.register
})
test('cadastro rejeita e-mail duplicado e senha curta', async () => {
  const query = 'mutation($input: RegisterInput!) { register(input: $input) { token } }'
  const duplicate = await gql(query, { input: { name: 'Alice', email: 'alice@example.com', password: 'senha-segura-123' } }); assert.equal(duplicate.errors?.[0]?.extensions.code, 'CONFLICT')
  const invalid = await gql(query, { input: { name: 'Teste', email: 'invalid@example.com', password: '123' } }); assert.equal(invalid.errors?.[0]?.extensions.code, 'BAD_USER_INPUT')
})
test('login valida senha e permite consulta da conta', async () => {
  const result = await gql<{ login: Auth }>('mutation { login(input: { email: "alice@example.com", password: "senha-segura-123" }) { token user { id name email } } }')
  assert.equal(result.data.login.user.id, alice.user.id)
  const me = await gql<{ me: { id: string } }>('{ me { id } }', {}, result.data.login.token); assert.equal(me.data.me.id, alice.user.id)
  const invalid = await gql('mutation { login(input: { email: "alice@example.com", password: "incorreta" }) { token } }'); assert.equal(invalid.errors?.[0]?.extensions.code, 'INVALID_CREDENTIALS')
})
test('consultas e mutações exigem token válido', async () => {
  for (const query of ['{ me { id } }', '{ categories { id } }', '{ transactions { total } }', '{ summary(month: "2026-10") { balance } }', 'mutation { deleteTransaction(id: "qualquer") }']) {
    const result = await gql(query); assert.equal(result.errors?.[0]?.extensions.code, 'UNAUTHENTICATED')
  }
  const forged = await gql('{ me { id } }', {}, alice.token.slice(0, -4) + 'fake'); assert.equal(forged.errors?.[0]?.extensions.code, 'UNAUTHENTICATED')
})
test('categoria é criada e listada apenas por seu proprietário', async () => {
  const result = await gql<{ createCategory: Category }>(`mutation($input: CategoryInput!) { createCategory(input: $input) { ${categoryFields} } }`, { input: categoryInput }, alice.token)
  assert.equal(result.errors, undefined); category = result.data.createCategory
  const own = await gql<{ categories: Category[] }>(`{ categories { ${categoryFields} } }`, {}, alice.token); assert.equal(own.data.categories.length, 1)
  const other = await gql<{ categories: Category[] }>('{ categories { id } }', {}, bob.token); assert.deepEqual(other.data.categories, [])
})
test('categoria pode ser editada e não aceita valores inválidos', async () => {
  const query = `mutation($id: ID!, $input: CategoryInput!) { updateCategory(id: $id, input: $input) { ${categoryFields} } }`
  const result = await gql<{ updateCategory: Category }>(query, { id: category.id, input: { ...categoryInput, description: 'Restaurantes e refeições' } }, alice.token); assert.equal(result.data.updateCategory.description, 'Restaurantes e refeições')
  const invalid = await gql(query, { id: category.id, input: { ...categoryInput, color: 'invalid' } }, alice.token); assert.equal(invalid.errors?.[0]?.extensions.code, 'BAD_USER_INPUT')
})
test('outra conta não pode editar nem excluir a categoria', async () => {
  const update = await gql('mutation($id: ID!, $input: CategoryInput!) { updateCategory(id: $id, input: $input) { id } }', { id: category.id, input: categoryInput }, bob.token); assert.equal(update.errors?.[0]?.extensions.code, 'NOT_FOUND')
  const remove = await gql('mutation($id: ID!) { deleteCategory(id: $id) }', { id: category.id }, bob.token); assert.equal(remove.errors?.[0]?.extensions.code, 'NOT_FOUND')
})
test('transação é criada com valor inteiro em centavos e data exata', async () => {
  const result = await gql<{ createTransaction: Transaction }>(`mutation($input: TransactionInput!) { createTransaction(input: $input) { ${txFields} } }`, { input: { ...txInput, categoryId: category.id } }, alice.token)
  assert.equal(result.errors, undefined); transaction = result.data.createTransaction
  assert.equal(transaction.amount, 4590); assert.equal(transaction.date, '2026-10-09'); assert.equal(transaction.category?.id, category.id)
})
test('transações, contagens e resumo são isolados por conta', async () => {
  const own = await gql<{ transactions: { total: number; items: Transaction[] }; summary: { balance: number; expense: number } }>(`{ transactions { total items { ${txFields} } } summary(month: "2026-10") { balance expense } }`, {}, alice.token)
  assert.equal(own.data.transactions.total, 1); assert.equal(own.data.summary.balance, -4590)
  const other = await gql<{ transactions: { total: number }; summary: { balance: number } }>('{ transactions { total } summary(month: "2026-10") { balance } }', {}, bob.token)
  assert.equal(other.data.transactions.total, 0); assert.equal(other.data.summary.balance, 0)
})
test('outra conta não pode editar, excluir ou vincular categorias alheias', async () => {
  const update = await gql('mutation($id: ID!, $input: TransactionInput!) { updateTransaction(id: $id, input: $input) { id } }', { id: transaction.id, input: txInput }, bob.token); assert.equal(update.errors?.[0]?.extensions.code, 'NOT_FOUND')
  const remove = await gql('mutation($id: ID!) { deleteTransaction(id: $id) }', { id: transaction.id }, bob.token); assert.equal(remove.errors?.[0]?.extensions.code, 'NOT_FOUND')
  const link = await gql('mutation($input: TransactionInput!) { createTransaction(input: $input) { id } }', { input: { ...txInput, categoryId: category.id } }, bob.token); assert.equal(link.errors?.[0]?.extensions.code, 'NOT_FOUND')
})
test('valores negativos, datas inexistentes e paginação inválida são rejeitados', async () => {
  for (const input of [{ ...txInput, amount: -100 }, { ...txInput, date: '2026-02-30' }, { ...txInput, description: ' ' }]) {
    const result = await gql('mutation($input: TransactionInput!) { createTransaction(input: $input) { id } }', { input }, alice.token); assert.equal(result.errors?.[0]?.extensions.code, 'BAD_USER_INPUT')
  }
  for (const query of ['{ transactions(page: 0) { total } }', '{ transactions(perPage: 101) { total } }', '{ summary(month: "2026-99") { balance } }']) {
    const result = await gql(query, {}, alice.token); assert.equal(result.errors?.[0]?.extensions.code, 'BAD_USER_INPUT')
  }
})
test('edição de transação atualiza o resumo e filtros retornam resultados corretos', async () => {
  const update = await gql<{ updateTransaction: Transaction }>(`mutation($id: ID!, $input: TransactionInput!) { updateTransaction(id: $id, input: $input) { ${txFields} } }`, { id: transaction.id, input: { ...txInput, amount: 5000, categoryId: category.id } }, alice.token); assert.equal(update.data.updateTransaction.amount, 5000)
  const add = 'mutation($input: TransactionInput!) { createTransaction(input: $input) { id } }'
  await gql(add, { input: { description: 'Salário', amount: 500000, date: '2026-10-01', type: 'INCOME' } }, alice.token)
  await gql(add, { input: { ...txInput, date: '2026-09-30', amount: 1000 } }, alice.token)
  const result = await gql<{ summary: { balance: number; income: number; expense: number; topCategories: { amount: number }[] } }>('{ summary(month: "2026-10") { balance income expense topCategories { amount } } }', {}, alice.token)
  assert.equal(result.data.summary.balance, 494000); assert.equal(result.data.summary.income, 500000); assert.equal(result.data.summary.expense, 5000); assert.equal(result.data.summary.topCategories[0]?.amount, 5000)
  const filter = await gql<{ transactions: { total: number } }>('{ transactions(filter: { search: "Almoço", month: "2026-10", type: EXPENSE }) { total } }', {}, alice.token); assert.equal(filter.data.transactions.total, 1)
  const pagination = await gql<{ transactions: { total: number; totalPages: number; items: Transaction[] } }>(`{ transactions(perPage: 1, page: 2) { total totalPages items { ${txFields} } } }`, {}, alice.token); assert.equal(pagination.data.transactions.totalPages, 3); assert.equal(pagination.data.transactions.items.length, 1)
})
test('perfil permite atualizar nome e foto sem afetar outra conta', async () => {
  const avatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aPmEAAAAASUVORK5CYII='
  const result = await gql<{ updateProfile: { name: string; avatar: string } }>('mutation($avatar: String) { updateProfile(name: "Alice Silva", avatar: $avatar) { name avatar } }', { avatar }, alice.token); assert.equal(result.data.updateProfile.avatar, avatar); assert.equal(result.data.updateProfile.name, 'Alice Silva')
  const other = await gql<{ me: { name: string; avatar: null } }>('{ me { name avatar } }', {}, bob.token); assert.equal(other.data.me.name, 'Bob'); assert.equal(other.data.me.avatar, null)
  const invalid = await gql('mutation { updateProfile(name: "Alice", avatar: "data:image/svg+xml;base64,PHN2Zz4=") { id } }', {}, alice.token); assert.ok(invalid.errors)
  const clear = await gql<{ updateProfile: { avatar: null } }>('mutation { updateProfile(name: "Alice Silva", avatar: null) { avatar } }', {}, alice.token); assert.equal(clear.data.updateProfile.avatar, null)
})
test('excluir categoria mantém transações sem categoria e exclusão de transação funciona', async () => {
  const categoryDelete = await gql<{ deleteCategory: boolean }>('mutation($id: ID!) { deleteCategory(id: $id) }', { id: category.id }, alice.token); assert.equal(categoryDelete.data.deleteCategory, true)
  const stored = await db.transaction.findUniqueOrThrow({ where: { id: transaction.id } }); assert.equal(stored.categoryId, null)
  const txDelete = await gql<{ deleteTransaction: boolean }>('mutation($id: ID!) { deleteTransaction(id: $id) }', { id: transaction.id }, alice.token); assert.equal(txDelete.data.deleteTransaction, true)
  assert.equal(await db.transaction.findUnique({ where: { id: transaction.id } }), null)
})
test('CORS permite a origem configurada', async () => {
  const response = await app.fetch(new Request('http://localhost/graphql', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' } }))
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173')
})
