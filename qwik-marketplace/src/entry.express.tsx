import { qwikCity } from '@builder.io/qwik-city/middleware/express';
import express from 'express';
import { fileURLToPath } from 'url';
import { join } from 'path';
import render from './entry.ssr';
const session = require('express-session');
// directories where the static assets are located
const distDir = join(fileURLToPath(import.meta.url), '..', '..', 'dist');
const buildDir = join(distDir, 'build');

// create the Qwik City express middleware
const { router, notFound } = qwikCity(render);

// create the express server
const app = express();
// app.use(session({
//   secret: 'keyboard cat',
//   cookie: { maxAge: 60000 },
// }))
// app.use('/', (req, res, next) => {
//   req.session.views = 1 + (req.session.views) ? req.session.views : 0;
//   console.log('session views:', req.session.views);
//   next();
// })

// static asset handlers
app.use(`/build`, express.static(buildDir, { immutable: true, maxAge: '1y' }));
app.use(express.static(distDir, { redirect: false }));


// use Qwik City's page and endpoint handler
app.use(router);

// use Qwik City's 404 handler
app.use(notFound);

// start the express server
app.listen(8080, () => {
  /* eslint-disable */
  console.log(`http://localhost:8080/`);
});
