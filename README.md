# Firebase Functions Router

**Status**: Fun Project

Set up Cloud Functions for Firebase to work as a file based routing system.

```js
// index.js
import { createApiServer } from '@davideast/not-published-yet'
import { fileURLToPath } from 'url'
import { onRequest } from 'firebase-functions/v2/https'
import path from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const apiPath = path.join(__dirname, './api')

export const api = onRequest(async (req, res) => {
  const { server } = await createApiServer(apiPath)
  server(req, res)
})

// hello.js -> /api/hello
export default function handler(req, res) {
  return res.status(200).json({ name: 'hello world!' })
}

// customers/[uid].js -> /api/customers/:uid
export default function handler(req, res) {
  // uid works as a param
  const { uid } = req.params
  return res.status(200).json({ uid })
}

// customers/[uid]/orders/[id].js -> /api/customers/:uid/orders/:id
export default function handler(req, res) {
  // both uid and id are params
  const { uid, id } = req.params
  return res.status(200).json({ id, uid })
}
```
