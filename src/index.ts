import 'reflect-metadata';

import {config} from './config';
import {startServer} from './Server';
import {getLogger} from './utils';

const logger = getLogger('index');

startServer(config).catch(error => {
  logger.error(error);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error(`Uncaught exception: ${error.message}`, error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

