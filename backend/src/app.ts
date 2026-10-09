import { Prisma, PrismaClient } from '@prisma/client'
import { createSchema, createYoga } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import type { IncomingMessage } from 'node:http'
import { config } from './config.js'
import { authenticate, hashPassword, issueToken, limitAuth, requireUser, verifyPassword } from './auth.js'
import { categoryInput, filterInput, loginInput, monthRange, parse, registerInput, transactionInput, validateAvatar } from './validation.js'
import { typeDefs } from './schema.js'
type Context = { userId: string | null; ip: string }
const notFound = () => new GraphQLError('Registro não encontrado.', { extensions: { code: 'NOT_FOUND' } })
export function createApp(db: PrismaClient) {
  async function categoryAccess(id: string | null | undefined, userId: string) {
    if (id && !await db.category.findFirst({ where: { id, userId } })) throw notFound()
  }
  async function safe<T>(work: () => Promise<T>): Promise<T> {
    try { return await work() } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') throw new GraphQLError('Já existe um registro com esses dados.', { extensions: { code: 'CONFLICT' } })
        if (error.code === 'P2025' || error.code === 'P2003') throw notFound()
      }
      throw error
    }
  }
  return createYoga<{ req?: IncomingMessage }, Context>({
    graphqlEndpoint: '/graphql',
    graphiql: process.env.NODE_ENV !== 'production',
    cors: { origin: config.FRONTEND_URL, methods: ['POST', 'GET', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] },
    context: async ({ request, req }) => ({ userId: await authenticate(request.headers.get('authorization')), ip: req?.socket.remoteAddress ?? 'local' }),
    schema: createSchema({ typeDefs, resolvers: {
      User: { createdAt: (user) => user.createdAt.toISOString() },
      Category: { transactionCount: (category) => db.transaction.count({ where: { categoryId: category.id, userId: category.userId } }) },
      Transaction: {
        date: (transaction) => transaction.date.toISOString().slice(0, 10),
        category: (transaction) => transaction.categoryId ? db.category.findFirst({ where: { id: transaction.categoryId, userId: transaction.userId } }) : null,
      },
      Query: {
        me: async (_parent, _args, ctx: Context) => {
          const user = await db.user.findUnique({ where: { id: requireUser(ctx.userId) } })
          if (!user) throw new GraphQLError('Conta não encontrada.', { extensions: { code: 'UNAUTHENTICATED' } })
          return user
        },
        categories: (_parent, _args, ctx: Context) => db.category.findMany({ where: { userId: requireUser(ctx.userId) }, orderBy: { name: 'asc' } }),
        transactions: async (_parent, args, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const filters = parse(filterInput, args.filter ?? {})
          const page = parse(z.number().int().min(1).max(1_000_000), args.page)
          const perPage = parse(z.number().int().min(1).max(100), args.perPage)
          const where: Prisma.TransactionWhereInput = { userId,
            ...(filters.search ? { description: { contains: filters.search } } : {}),
            ...(filters.month ? { date: monthRange(filters.month) } : {}),
            ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
            ...(filters.type ? { type: filters.type } : {}),
          }
          const [total, items] = await db.$transaction([
            db.transaction.count({ where }), db.transaction.findMany({ where, orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * perPage, take: perPage }),
          ])
          return { items, total, page, totalPages: Math.max(1, Math.ceil(total / perPage)) }
        },
        summary: async (_parent, { month }, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const filters = parse(filterInput, { month })
          const [monthly, totals, categories] = await db.$transaction([
            db.transaction.findMany({ where: { userId, date: monthRange(filters.month!) } }),
            db.transaction.groupBy({ by: ['type'], where: { userId }, orderBy: { type: 'asc' }, _sum: { amount: true } }),
            db.category.findMany({ where: { userId } }),
          ])
          const income = monthly.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0)
          const expense = monthly.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
          const balance = totals.reduce((sum, t) => sum + (t.type === 'INCOME' ? 1 : -1) * (t._sum?.amount ?? 0), 0)
          const topCategories = categories.map(category => {
            const entries = monthly.filter(t => t.categoryId === category.id && t.type === 'EXPENSE')
            return { category, amount: entries.reduce((sum, t) => sum + t.amount, 0), transactionCount: entries.length }
          }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount).slice(0, 5)
          return { balance, income, expense, transactionCount: monthly.length, categoryCount: categories.length, topCategories }
        },
      },
      Mutation: {
        register: async (_parent, { input }, ctx: Context) => {
          limitAuth(ctx.ip)
          const data = parse(registerInput, input)
          const passwordHash = await hashPassword(data.password)
          const user = await safe(() => db.user.create({ data: { name: data.name, email: data.email, passwordHash } }))
          return { user, token: await issueToken(user.id) }
        },
        login: async (_parent, { input }, ctx: Context) => {
          limitAuth(ctx.ip)
          const data = parse(loginInput, input)
          const user = await db.user.findUnique({ where: { email: data.email } })
          // Derive a hash even when the account is absent to avoid an obvious timing oracle.
          const stored = user?.passwordHash ?? '00000000000000000000000000000000:' + '00'.repeat(64)
          if (!await verifyPassword(data.password, stored) || !user) throw new GraphQLError('E-mail ou senha incorretos.', { extensions: { code: 'INVALID_CREDENTIALS' } })
          return { user, token: await issueToken(user.id) }
        },
        updateProfile: (_parent, args, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const name = parse(z.string().trim().min(2).max(80), args.name)
          const avatar = args.avatar === undefined ? undefined : validateAvatar(args.avatar)
          return safe(() => db.user.update({ where: { id: userId }, data: { name, avatar } }))
        },
        createCategory: (_parent, { input }, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const data = parse(categoryInput, input)
          return safe(() => db.category.create({ data: { ...data, userId } }))
        },
        updateCategory: (_parent, { id, input }, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const data = parse(categoryInput, input)
          return safe(() => db.category.update({ where: { id, userId }, data }))
        },
        deleteCategory: async (_parent, { id }, ctx: Context) => {
          await safe(() => db.category.delete({ where: { id, userId: requireUser(ctx.userId) } }))
          return true
        },
        createTransaction: async (_parent, { input }, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const data = parse(transactionInput, input)
          await categoryAccess(data.categoryId, userId)
          return safe(() => db.transaction.create({ data: { ...data, date: new Date(`${data.date}T00:00:00Z`), userId } }))
        },
        updateTransaction: async (_parent, { id, input }, ctx: Context) => {
          const userId = requireUser(ctx.userId)
          const data = parse(transactionInput, input)
          await categoryAccess(data.categoryId, userId)
          return safe(() => db.transaction.update({ where: { id, userId }, data: { ...data, date: new Date(`${data.date}T00:00:00Z`) } }))
        },
        deleteTransaction: async (_parent, { id }, ctx: Context) => {
          await safe(() => db.transaction.delete({ where: { id, userId: requireUser(ctx.userId) } }))
          return true
        },
      },
    } }),
  })
}
