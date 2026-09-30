import 'dotenv/config'
import express, { type ErrorRequestHandler } from 'express'
import cors from 'cors'
import { adminRouter } from './routes/admin.js'
import { bannersRouter } from './routes/banners.js'

for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
    process.exit(1)
  }
}

const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

const app = express()

app.use(cors({
  // Unlisted origins get no CORS headers, so browsers block the response.
  // Non-browser requests (curl, health checks) have no Origin and are unaffected.
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
}))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => { res.json({ ok: true }) })

app.use('/api/admin', adminRouter)
app.use('/api/banners', bannersRouter)

app.use((_req, res) => { res.status(404).json({ error: 'Not found' }) })

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)
  const status = err.type === 'entity.parse.failed' ? 400 : 500
  res.status(status).json({ error: status === 400 ? 'Invalid JSON body' : 'Internal server error' })
}
app.use(onError)

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
  console.log(`API listening on :${port} (CORS: ${allowedOrigins.join(', ')})`)
})
