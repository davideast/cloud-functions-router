import { debugServer } from '@davideast/firebase-functions-router';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const apiPath = path.join(__dirname, './api');

debugServer(3022, apiPath).then(server => {
  console.log(server);
})
