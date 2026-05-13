import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import helmet from 'helmet';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';

import {AppModule} from './app.module';
import {ServerConfig} from './config';
import {AllExceptionsFilter} from './filters/all-exceptions.filter';
import {getLogger} from './utils';

const logger = getLogger('Server');

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

  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('pkgsource')
    .setDescription('Find the source of an npm package in an instant.')
    .setVersion(config.VERSION)
    .setContact('', 'https://github.com/ffflorian', '')
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

export {HTTP_STATUS};

