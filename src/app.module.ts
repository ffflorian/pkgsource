import {Module} from '@nestjs/common';

import {HealthController} from './controllers/health.controller.js';
import {InfoController} from './controllers/info.controller.js';
import {MainController} from './controllers/main.controller.js';
import {PackagesController} from './controllers/packages.controller.js';

@Module({
  controllers: [HealthController, InfoController, MainController, PackagesController],
})
export class AppModule {}
