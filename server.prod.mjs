import '@angular/compiler';
import express from 'express';
import { CommonEngine } from '@angular/ssr/node';
import { resolve } from 'node:path';

const builtServer = await import('./dist/modern-portfolio/server/main.js').catch((e) => {
  console.error('Failed to import server bundle:', e);
  process.exit(1);
});

const bootstrap = builtServer?.default?.default || builtServer?.default || builtServer;
const app = express();
const commonEngine = new CommonEngine({
  allowedHosts: ['localhost', '127.0.0.1', '*']
});

const browserDistFolder = resolve(process.cwd(), 'dist/modern-portfolio/browser');
const indexHtml = resolve(browserDistFolder, 'index.html');

app.use(express.static(browserDistFolder, { maxAge: '1y', index: 'index.html' }));

app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`SSR server listening on http://localhost:${port}`);
});
