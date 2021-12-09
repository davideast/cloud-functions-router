import { createApiServer } from './lib';
import * as functions from 'firebase-functions';

export const apiServer = functions.https.onRequest((req, res) => {
  createApiServer().then(server => {
    server(req, res);
  });
});

