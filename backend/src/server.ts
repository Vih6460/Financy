import { createServer } from 'node:http'
import { PrismaClient } from '@prisma/client'
import { config } from './config.js'
import { createApp } from './app.js'
const db = new PrismaClient()
await db.$connect()
const yoga = createApp(db)
const server = createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.url === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"status":"ok"}'); return }
  if (Number(req.headers['content-length']) > 3_000_000) { res.writeHead(413); res.end('Payload too large'); return }
  void yoga(req, res)
})
server.listen(config.PORT, '127.0.0.1', () => console.log(`Financy API: http://localhost:${config.PORT}/graphql`))
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => {
  server.close(() => { void db.$disconnect().then(() => process.exit(0)) })
})
