import * as logdown from 'logdown';

import {config} from './config';
import {Server} from './Server';
import {formatDate} from './utils';

const logger = logdown('pkgsource/index', {
  logger: console,
  markdown: false,
});

const server = new Server(config);

server.start().catch(error => {
  logger.error(`[${formatDate()}]`, error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.log(`[${formatDate()}] Received "SIGINT" signal. Exiting.`);
  try {
    await server.stop();
  } catch (error) {
    logger.error(`[${formatDate()}]`, error);
  }
  process.exit();
});

process.on('SIGTERM', async () => {
  logger.log(`[${formatDate()}] Received "SIGTERM" signal. Exiting.`);
  try {
    await server.stop();
  } catch (error) {
    logger.error(`[${formatDate()}]`, error);
  }
  process.exit();
});

process.on('uncaughtException', error => {
  console.error(`[${formatDate()}] Uncaught exception: ${error.message}`, error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[${formatDate()}] Unhandled rejection at:`, promise, 'reason:', reason);
});
