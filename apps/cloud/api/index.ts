// Vercel Node function entry: every route goes through the Hono app.
// Vercel's runtime wants Web-style named method exports, not a default export returning a Response.
import { handle } from 'hono/vercel'
import app from '../src/app.js'

const h = handle(app)
export const GET = h, POST = h, PUT = h, PATCH = h, DELETE = h, OPTIONS = h, HEAD = h
