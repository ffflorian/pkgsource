import express from 'express';
import fs from 'node:fs';
import {findUpSync} from 'find-up';
import swaggerUi from 'swagger-ui-express';

import {ServerConfig} from '../config.js';

const swaggerJsonPath = findUpSync('swagger.json', {allowSymlinks: false, cwd: '.'});
if (!swaggerJsonPath) {
  throw new Error('Could not find file `swagger.json`');
}
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerJsonPath, 'utf-8'));

export function initSwaggerRoute(app: express.Application, config: ServerConfig): void {
  const swaggerOptions: swaggerUi.SwaggerOptions = {
    host: `localhost:${config.PORT_HTTP}`,
  };

  const CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';

  app.use(
    '/_swagger-ui{/}',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {customCssUrl: CSS_URL, swaggerOptions})
  );
}
