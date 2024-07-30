import { debugServer } from 'ff-serve';
import { fileURLToPath } from 'url';
import { join } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const path = join(__dirname, './app');
const port = 3022
const firebaseConfig = {
  apiKey: "AIzaSyAeRU6P9knxpKqa1LbTrfEG3UOFiOxZNUs",
  authDomain: "genkit-idx.firebaseapp.com",
  projectId: "genkit-idx",
  storageBucket: "genkit-idx.appspot.com",
  messagingSenderId: "752586403070",
  appId: "1:752586403070:web:ddc29d4924cade9230c9af"
};

debugServer({ port, path, firebaseConfig }).then(server => {
  console.log(server);
})
