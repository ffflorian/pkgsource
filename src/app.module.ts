import {Module} from '@nestjs/common';

import {HealthController} from './controllers/health.controller';
import {InfoController} from './controllers/info.controller';
import {MainController} from './controllers/main.controller';
import {PackagesController} from './controllers/packages.controller';

@Module({
  controllers: [HealthController, InfoController, MainController, PackagesController],
})
export class AppModule {}
