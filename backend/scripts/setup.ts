import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { parse } from 'dotenv'
import { randomBytes } from 'node:crypto'
if (!existsSync('.env')) {
  writeFileSync('.env', `JWT_SECRET=${randomBytes(48).toString('hex')}\nDATABASE_URL="file:./dev.db"\nPORT=3333\nFRONTEND_URL="http://localhost:5173"\n`, { mode: 0o600 })
  console.log('Arquivo backend/.env criado com segredo JWT aleatório.')
}
if (!existsSync('../frontend/.env')) writeFileSync('../frontend/.env', 'VITE_BACKEND_URL="http://localhost:3333/graphql"\n')
const url = process.env.DATABASE_URL ?? parse(readFileSync('.env')).DATABASE_URL
if (url?.startsWith('file:')) {
  const path = resolve('prisma', url.slice(5).split('?')[0]!)
  mkdirSync(dirname(path), { recursive: true })
  // Ensure SQLite has a file to open before applying the first migration.
  closeSync(openSync(path, 'a'))
}
