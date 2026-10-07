import express from 'express'
import { paid, mountTrajan } from './trajan.js'
const app = express()
app.get('/fact', paid(), (_req, res) => { res.json({ fact: 'Trajan ruled 98–117 AD; the empire was never larger.' }) })
mountTrajan(app)
app.listen(8791, () => console.log('fresh-express on :8791'))
