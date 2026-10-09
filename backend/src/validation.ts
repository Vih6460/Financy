import { z } from 'zod'
import { GraphQLError } from 'graphql'
export const colors = ['green', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow'] as const
export const icons = ['briefcase', 'utensils', 'shopping-cart', 'home', 'car', 'heart', 'graduation-cap', 'gamepad', 'plane', 'gift', 'wallet', 'coffee', 'smartphone', 'paw-print', 'dumbbell', 'tag', 'baggage-claim', 'book-open', 'mailbox', 'piggy-bank', 'receipt-text', 'ticket', 'tool-case'] as const
export const registerInput = z.object({ name: z.string().trim().min(2).max(80), email: z.email().trim().toLowerCase().max(254), password: z.string().min(8).max(128) })
export const loginInput = registerInput.pick({ email: true }).extend({ password: z.string().min(1).max(128) })
export const categoryInput = z.object({ name: z.string().trim().min(1).max(50), description: z.string().trim().max(160).default(''), color: z.enum(colors), icon: z.enum(icons) })
export const transactionInput = z.object({
  description: z.string().trim().min(1).max(160),
  amount: z.number().int().positive().max(2_000_000_000), type: z.enum(['INCOME', 'EXPENSE']),
  date: z.iso.date(), categoryId: z.uuid().nullish(),
})
export const filterInput = z.object({ search: z.string().trim().max(160).nullish(), month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).nullish(), categoryId: z.uuid().nullish(), type: z.enum(['INCOME', 'EXPENSE']).nullish() })
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input)
  if (!result.success) throw new GraphQLError('Confira os campos informados.', { extensions: { code: 'BAD_USER_INPUT', fields: result.error.issues.map(x => x.path.join('.')) } })
  return result.data
}
export function monthRange(month: string) {
  const [year, part] = month.split('-').map(Number)
  return { gte: new Date(`${month}-01T00:00:00.000Z`), lt: new Date(Date.UTC(year!, part!, 1)) }
}
export function validateAvatar(value: string | null) {
  if (value === null) return null
  if (value.length > 2_800_000) throw new GraphQLError('A imagem deve ter no máximo 2 MB.')
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
  if (!match) throw new GraphQLError('Use uma imagem PNG, JPEG ou WebP.')
  const data = Buffer.from(match[2]!, 'base64')
  const valid = match[1] === 'png' ? data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : match[1] === 'jpeg' ? data[0] === 255 && data[1] === 216 && data[2] === 255
    : data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP'
  if (!valid || data.length > 2 * 1024 * 1024) throw new GraphQLError('Imagem inválida ou maior que 2 MB.')
  return value
}
