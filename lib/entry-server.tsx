import { renderToString } from 'react-dom/server';

async function loadComponent(componentPath: string) {
  const module = await import(componentPath);
  return module.default;
}

export async function render({ componentPath = '', preloadedState = {} } = {}) {
  const App = await loadComponent(componentPath);
  const html = renderToString(<App />);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>My App</title>
        </head>
      <body>
        <div id="root">${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}
        </script>
        <script type="module" src="/src/entry-client.jsx"></script>
      </body>
    </html>
  `;
}
