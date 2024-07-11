import { onRequest } from "firebase-functions/v2/https"
import { createApiServer } from '@davideast/firebase-functions-router'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const apiPath = path.join(__dirname, './api')

export const api = onRequest(async (req, res) => {
  const { server } = await createApiServer(apiPath)
  server(req, res)
})
