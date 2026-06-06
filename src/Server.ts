import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {NextFunction, Request, Response} from 'express';
import helmet from 'helmet';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {AppModule} from './app.module.js';
import {ServerConfig} from './config.js';
import {AllExceptionsFilter} from './filters/all-exceptions.filter.js';
import {getLogger} from './utils.js';

const logger = getLogger('Server');
// In-memory store is process-local and resets on restart.
const rateLimitStore = new Map<string, {count: number; resetAt: number}>();
const rateLimitCleanupThreshold = 1_000;

export async function createApp(config: ServerConfig): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {logger: false});

  app.disable('x-powered-by');
  app.use(
    helmet({
      frameguard: {action: 'deny'},
    })
  );
  app.use(helmet.noSniff());
  app.use(helmet.xssFilter());
  app.use(createRateLimitMiddleware(config));

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('pkgsource')
    .setDescription('Find the source of an npm package in an instant.')
    .setVersion(config.VERSION)
    .setContact('Florian Imdahl', 'https://github.com/ffflorian', '')
    .setLicense('GPL-3.0', 'https://github.com/ffflorian/pkgsource/blob/main/LICENSE')
    .addTag('API')
    .addTag('Server Info')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerOptions = {
    host: `localhost:${config.PORT_HTTP}`,
  };
  SwaggerModule.setup('_swagger-ui', app, swaggerDocument, {swaggerOptions});

  app.setGlobalPrefix('', {
    exclude: ['_health', '_info', '_swagger-ui', '/'],
  });

  return app;
}

export async function startServer(config: ServerConfig): Promise<void> {
  if (!config.PORT_HTTP) {
    throw new Error('Server port not specified.');
  }

  const app = await createApp(config);
  await app.listen(config.PORT_HTTP);
  logger.info(`Server is running on port ${config.PORT_HTTP}.`);
}

function cleanupExpiredRateLimitEntries(now: number): void {
  for (const [key, value] of rateLimitStore) {
    if (now >= value.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

function createRateLimitMiddleware(config: ServerConfig) {
  const windowMs = config.RATE_LIMIT_WINDOW_SECONDS * 1_000;

  return (request: Request, response: Response, next: NextFunction) => {
    const now = Date.now();
    if (rateLimitStore.size >= rateLimitCleanupThreshold) {
      cleanupExpiredRateLimitEntries(now);
    }
    const ipAddress = request.ip || request.socket.remoteAddress || 'unknown';
    const current = rateLimitStore.get(ipAddress);

    if (!current || now >= current.resetAt) {
      rateLimitStore.set(ipAddress, {count: 1, resetAt: now + windowMs});
      next();
      return;
    }

    if (current.count >= config.RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1_000);
      response.setHeader('Retry-After', String(retryAfter));
      response.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        code: HTTP_STATUS.TOO_MANY_REQUESTS,
        message: 'Too many requests',
      });
      return;
    }

    current.count += 1;
    next();
  };
}

export {HTTP_STATUS};
