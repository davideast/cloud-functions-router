import recursive from 'recursive-readdir';
import express from 'express';

async function getRoutes(routerPath: string): Promise<Map<string, Function>> {
  return new Promise((resolve, reject) => {
    recursive(routerPath, async (error, files) => {
      if (error) {
        reject(error);
        return;
      }
      const handlerMap = new Map();
      let promises: any = [];
      for (let file of files) {
        // Replace all []
        const path = file.replace(/\[([^\]]+)\]/g, ':$1').replace(/(\.ts|\.js)$/, '').replace(routerPath, '');
        const module = await import(file);
        promises = [...promises, { path, module }];
      }
      const routes: any[] = await Promise.all(promises);
      for (let route of routes) {
        const handler = route.module.default;
        handlerMap.set(route.path, handler);
      }
      resolve(handlerMap);
    });
  });
}

export async function createApiServer(routerPath: string) {
  try {
    const server = express();
    const routes = await getRoutes(routerPath);
    for (let routePath of routes.keys()) {
      const handler = routes.get(routePath)!;
      server.all(routePath, handler as any);
    }
    return { server, routes };
  } catch (error) {
    throw error;
  }
}

export async function debugServer(port: number, routerPath: string) {
  try {
    const { server, routes } = await createApiServer(routerPath);

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
