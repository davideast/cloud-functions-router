import { promises as fs, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { initializeServerApp, FirebaseOptions, FirebaseServerAppSettings } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { createServer as createViteServer } from 'vite'

interface FileData {
  path: string;
  content: string;
}

async function readFilesRecursively(directoryPath: string): Promise<FileData[]> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  const files: FileData[] = [];

  for (const entry of entries) {
    const fullPath = join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readFilesRecursively(fullPath)));
    } else if (entry.isFile()) {
      const content = await fs.readFile(fullPath, 'utf-8');
      files.push({ path: fullPath, content });
    }
  }

  return files;
}

async function getRoutes(routerPath: string): Promise<Map<string, Function>> {
  try {
    const files = await readFilesRecursively(routerPath); // Use the recursive file reader
    const handlerMap = new Map<string, Function>();
    
    await Promise.all(
      files
        .filter((file) => file.path.endsWith('.ts') || file.path.endsWith('.js')) // Filter only .ts or .js files
        .map(async (file) => {
          const path = file.path
            .replace(/\[([^\]]+)\]/g, ':$1')
            .replace(/(\.ts|\.js)$/, '')
            .replace(routerPath, '');
          const module = await import(file.path); // Import the module
          const handler = module.default; // Get the default export
          handlerMap.set(path, handler); // Add to the map
        })
    );

    return handlerMap;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error getting routes:`, error.message);
    } else {
      console.error(`Unknown error getting routes:`, error);
    }
    throw error; // Rethrow the error for higher-level handling
  }
}

export async function createApiServer(routerPath: string, options?: FirebaseOptions, cookieName: string = '__session') {
  try {
    const server = express();
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    server.use(vite.middlewares)
    const routes = await getRoutes(routerPath);
    if (!options) {
      options = await readFirebaseOptions();
    }
    const authMiddleware = createAuthMiddleware(options, cookieName);
    server.use(cookieParser())
    server.use('**', authMiddleware as any);
    server.use('/', async (req, res, next) => {
      const url = req.originalUrl
      try {
        // 1. Read index.html
        let template = readFileSync(
          resolve(routerPath, 'index.html'),
          'utf-8',
        )
    
        // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
        //    and also applies HTML transforms from Vite plugins, e.g. global
        //    preambles from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template)
    
        // 3. Load the server entry. ssrLoadModule automatically transforms
        //    ESM source code to be usable in Node.js! There is no bundling
        //    required, and provides efficient invalidation similar to HMR.
        // const { render } = await vite.ssrLoadModule('/src/entry-server.js')
    
        // 4. render the app HTML. This assumes entry-server.js's exported
        //     `render` function calls appropriate framework SSR APIs,
        //    e.g. ReactDOMServer.renderToString()
        // const appHtml = await render(url)
    
        // 5. Inject the app-rendered HTML into the template.
        const html = template.replace(`<!--ssr-outlet-->`, template)
    
        // 6. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
      } catch (e) {
        // If an error is caught, let Vite fix the stack trace so it maps back
        // to your actual source code.
        vite.ssrFixStacktrace(e as any)
        next(e)
      }
    })
    for (let routePath of routes.keys()) {
      const handler = routes.get(routePath)!;
      server.all(routePath, handler as any);
    }
    return { server, routes };
  } catch (error) {
    throw error;
  }
}

function createAuthMiddleware(options: FirebaseOptions, cookieName: string = '__session') {
  return async function (req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    let authIdToken = null;
    req.locals = {};

    if (authHeader) {
      authIdToken = authHeader.split(' ')[1]; // Extract token from Bearer format
    }

    if (!authIdToken) {
      // Ensure cookieParser middleware is used BEFORE this middleware
      authIdToken = req.cookies?.[cookieName]; 
    }
    
    // Exit because there's no bearer token or __session cookie
    if (!authHeader && !authIdToken) {
      next();
      return;
    }

    try {
      const serverSettings: FirebaseServerAppSettings = { authIdToken };
      const serverApp = initializeServerApp(options, serverSettings);
      const serverAuth = getAuth(serverApp);

      await serverAuth.authStateReady();

      if (serverAuth.currentUser !== null) {
        req.locals.user = serverAuth.currentUser;
      } 
    } catch (error) {
      console.error("Error verifying token:", error);
    }
    next();
  }
}

export async function debugServer({ port, path, firebaseConfig, cookieName = '__session' }: { port: number; path: string; firebaseConfig?: FirebaseOptions; cookieName?: string }) {
  try {
    const { server, routes } = await createApiServer(path, firebaseConfig);

    for (let routePath of routes.keys()) {
      console.log(`http://localhost:${port}${routePath}`);
    }

    server.listen(port, () => {
      console.log(`http://localhost:${port}/api`);
    })
  } catch (error) {
    throw error;
  }
}

async function readFirebaseOptions() {
  try {
    const settings = await fs.readFile('./firebase-config.json', 'utf-8');
    return JSON.parse(settings) as FirebaseOptions;
  } catch (error) {
    console.error('Error reading firebase-config.json:', error);
    throw error;
  }
}
