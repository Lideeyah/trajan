// Vercel Node function entry: every route goes through the Hono app.
import { handle } from 'hono/vercel'
import app from '../src/app.js'

export default handle(app)
