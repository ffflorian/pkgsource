import 'reflect-metadata';
import {NestExpressApplication} from '@nestjs/platform-express';
import {Request, Response} from 'express';

import {config} from '../src/config';
import {createApp} from '../src/Server';

let bootstrapPromise: Promise<NestExpressApplication> | undefined;

export default async function handler(req: Request, res: Response): Promise<void> {
  const nestApp = await bootstrap();
  nestApp.getHttpAdapter().getInstance()(req, res);
}

function bootstrap(): Promise<NestExpressApplication> {
  if (!bootstrapPromise) {
    bootstrapPromise = createApp(config).then(async app => {
      await app.init();
      return app;
    });
  }
  return bootstrapPromise;
}

