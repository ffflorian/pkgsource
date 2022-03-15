import express, {Application} from 'express';
import nocache from 'nocache';
import http from 'http';
import helmet from 'helmet';
import {config} from './config';

import type {ServerConfig} from './config';
import {
  healthCheckRoute,
  initSwaggerRoute,
  internalErrorRoute,
  mainRoute,
  notFoundRoute,
  packagesRoute,
  infoRoute,
} from './routes/';
import {getLogger} from './utils';

const logger = getLogger('Server');

class Server {
  public readonly app: Application;
  private server?: http.Server;

  constructor(private readonly config: ServerConfig) {
    this.app = express();
    this.init();
  }

  init(): void {
    // The order is important here, please don't sort!
    this.initSecurityHeaders();
    this.app.use(healthCheckRoute());
    this.app.use(infoRoute());
    this.app.use(mainRoute());
    initSwaggerRoute(this.app, this.config);
    this.app.use(packagesRoute());
    this.app.use(notFoundRoute());
    this.app.use(internalErrorRoute());
  }

  initCaching(): void {
    if (this.config.DEVELOPMENT) {
      this.app.use(nocache());
    } else {
      this.app.use((_, res, next) => {
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
        reject(new Error('Server is already running.'));
      } else if (this.config.PORT_HTTP) {
        this.server = this.app.listen(this.config.PORT_HTTP, () => {
          logger.info(`Server is running on port ${this.config.PORT_HTTP}.`);
          resolve(this.config.PORT_HTTP);
        });
      } else {
        reject(new Error('Server port not specified.'));
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

const app = new Server(config).app;
export = app;
