// Local runner (Vercel serves api/index.ts and public/ in production).
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import app from './app.js'
const local = new Hono()
local.use('/client.js', serveStatic({ root: './public' }))
local.route('/', app)
const port = Number(process.env.PORT ?? 3000)
serve({ fetch: local.fetch, port }, () => console.log(`trajan cloud on http://localhost:${port}`))
