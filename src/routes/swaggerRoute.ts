import * as express from 'express';
import * as findUp from 'find-up';
import * as swaggerUi from 'swagger-ui-express';

import {ServerConfig} from '../config';

const swaggerJsonPath = findUp.sync('swagger.json', {allowSymlinks: false, cwd: __dirname});
if (!swaggerJsonPath) {
  throw new Error('Could not find file `swagger.json`');
}
const swaggerDocument = require(swaggerJsonPath);

export function initSwaggerRoute(app: express.Express, config: ServerConfig): void {
  const swaggerOptions: swaggerUi.SwaggerOptions = {
    host: `localhost:${config.PORT_HTTP}`,
  };

  app.use('/_swagger-ui/?', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {}, {options: swaggerOptions}));
}
