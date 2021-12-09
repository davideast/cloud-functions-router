import recursive from 'recursive-readdir';
import express from 'express';

async function getRoutes(): Promise<Map<string, Function>> {
  return new Promise((resolve, reject) => {
    recursive('./api', async (error, files) => {
      const handlerMap = new Map();
      let promises: any = [];
      for(let file of files) {
        // TODO(davideast): Do a full replace for [], b/c we can support multiple
        const path = file.replace('[', ':').replace(']', '').replace('.ts', '').replace('.js', '');
        const module = await import(`${process.cwd()}/${file}`);
        promises = [...promises, { path: `/${path}`, module }];
      }
      const routes: any[] = await Promise.all(promises);
      for(let route of routes) {
        const handler = route.module.default;
        handlerMap.set(route.path, handler);
      }
      resolve(handlerMap);
    });
  });
}

export async function createApiServer() {
  const routes = await getRoutes();
  const app = express();
  for (let routePath of routes.keys()) {
    console.log(routePath);
    const handler = routes.get(routePath)!;
    app.all(routePath, handler as any);
  }
  return app;
}

export async function debugServer(port: number) {
  const server = await createApiServer();

  server.listen(port, () => {
    console.log(`http://localhost:${port}/api`);
  })
}
