import path from 'node:path';

import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import expressEnforcesSsl from 'express-enforces-ssl';
import helmet from 'helmet';
import compression from 'compression';

import { isHosted } from './server/env.js';
import apiRouter from './server/api-router.js';

const PORT = process.env.PORT || 8080;
const ONE_YEAR = 31536000;

const app = express();
app.disable('x-powered-by');

// block web crawlers

app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.use(helmet.xPoweredBy());

if (isHosted) {
  app.enable('trust proxy');
  app.use(expressEnforcesSsl());
  app.use(helmet.strictTransportSecurity({ maxAge: ONE_YEAR }));
}

app.use(helmet.referrerPolicy({ policy: "origin" }));

app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));

app.use('/api', apiRouter);

app.use('/', express.static(path.join(import.meta.dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Island Pond Cell Tower server listening on port ${PORT}`);
});