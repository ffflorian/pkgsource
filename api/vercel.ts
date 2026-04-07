import 'reflect-metadata';
import {NestExpressApplication} from '@nestjs/platform-express';
import {Request, Response} from 'express';

import {config} from '../src/config';
import {createApp} from '../src/Server';

let app: NestExpressApplication | undefined;

export default async function handler(req: Request, res: Response): Promise<void> {
  const nestApp = await bootstrap();
  nestApp.getHttpAdapter().getInstance()(req, res);
}

async function bootstrap(): Promise<NestExpressApplication> {
  if (!app) {
    app = await createApp(config);
    await app.init();
  }
  return app;
}

