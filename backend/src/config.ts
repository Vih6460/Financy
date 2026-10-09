import 'dotenv/config'
import { z } from 'zod'
const env = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres.'),
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
}).parse(process.env)
export const config = env
