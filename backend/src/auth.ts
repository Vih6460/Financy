import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { SignJWT, jwtVerify } from 'jose'
import { GraphQLError } from 'graphql'
import { config } from './config.js'
const derive = promisify(scrypt)
const key = new TextEncoder().encode(config.JWT_SECRET)
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = await derive(password, salt, 64) as Buffer
  return `${salt}:${hash.toString('hex')}`
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hex] = stored.split(':')
  if (!salt || !hex) return false
  const actual = await derive(password, salt, 64) as Buffer
  const expected = Buffer.from(hex, 'hex')
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
export function issueToken(userId: string) {
  return new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setSubject(userId)
    .setIssuer('financy').setAudience('financy-web').setIssuedAt().setExpirationTime('7d').sign(key)
}
export async function authenticate(header: string | null) {
  if (!header?.startsWith('Bearer ')) return null
  try {
    const { payload } = await jwtVerify(header.slice(7), key, { algorithms: ['HS256'], issuer: 'financy', audience: 'financy-web' })
    return payload.sub ?? null
  } catch { return null }
}
export function requireUser(userId: string | null) {
  if (!userId) throw new GraphQLError('Sua sessão expirou. Entre novamente.', { extensions: { code: 'UNAUTHENTICATED' } })
  return userId
}
const attempts = new Map<string, { count: number; expires: number }>()
export function limitAuth(ip: string) {
  const now = Date.now()
  for (const [id, item] of attempts) if (item.expires < now) attempts.delete(id)
  const item = attempts.get(ip) ?? { count: 0, expires: now + 15 * 60_000 }
  item.count++
  attempts.set(ip, item)
  if (item.count > 30) throw new GraphQLError('Muitas tentativas. Tente novamente em 15 minutos.', { extensions: { code: 'RATE_LIMITED' } })
}
