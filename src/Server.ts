import * as express from 'express';
import * as helmet from 'helmet';
import * as http from 'http';

import {ServerConfig} from './config';
import {healthCheckRoute} from './routes/_health/healthCheckRoute';
import {internalErrorRoute, notFoundRoute} from './routes/error/errorRoutes';
import {mainRoute} from './routes/mainRoute';
import {packagesRoute} from './routes/packagesRoute';
import {getLogger} from './utils';

const logger = getLogger('Server');

export class Server {
  private readonly app: express.Express;
  private server?: http.Server;
  constructor(private readonly config: ServerConfig) {
    this.app = express();
    this.init();
  }

  init(): void {
    // The order is important here, please don't sort!
    this.initSecurityHeaders();
    this.app.use(healthCheckRoute());
    this.app.use(mainRoute());
    this.app.use(packagesRoute());
    this.app.use(notFoundRoute());
    this.app.use(internalErrorRoute());
  }

  initCaching(): void {
    if (this.config.DEVELOPMENT) {
      this.app.use(helmet.noCache());
    } else {
      this.app.use((req, res, next) => {
        const milliSeconds = 1000;
        res.header('Cache-Control', `public, max-age=${this.config.CACHE_DURATION_SECONDS}`);
        res.header('Expires', new Date(Date.now() + this.config.CACHE_DURATION_SECONDS * milliSeconds).toUTCString());
        next();
      });
    }
  }

  initSecurityHeaders(): void {
    this.app.disable('x-powered-by');
    this.app.use(
      helmet({
        frameguard: {action: 'deny'},
      })
    );
    this.app.use(helmet.noSniff());
    this.app.use(helmet.xssFilter());
  }

  start(): Promise<number> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        reject('Server is already running.');
      } else if (this.config.PORT_HTTP) {
        this.server = this.app.listen(this.config.PORT_HTTP, () => {
          logger.info(`Server is running on port ${this.config.PORT_HTTP}.`);
          resolve(this.config.PORT_HTTP);
        });
      } else {
        reject('Server port not specified.');
      }
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      this.server = undefined;
    } else {
      throw new Error('Server is not running.');
    }
  }
}
