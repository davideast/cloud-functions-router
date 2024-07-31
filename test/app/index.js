
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); 
const filePath = join(__dirname, './index.html');

export default function handler(req, res) {
  // console.log({ locals: req.locals });
  // console.log({ cookies: req.cookies.__session });
  res.sendFile(filePath);
}
