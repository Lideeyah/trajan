import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { paid, mountTrajan } from './trajan.js'
const app = new Hono()
app.get('/joke', paid(), (c) => c.json({ joke: 'Why did the agent cross the road? To settle on the other side.' }))
mountTrajan(app)
serve({ fetch: app.fetch, port: 8790 }, () => console.log('fresh-hono on :8790'))
