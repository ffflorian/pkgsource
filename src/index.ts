import {config} from './config';
import {Server} from './Server';
import {getLogger} from './utils';

const logger = getLogger('index');

const server = new Server(config);

server.start().catch(error => {
  logger.error(error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('Received "SIGINT" signal. Exiting.');
  try {
    await server.stop();
  } catch (error) {
    logger.error(error);
  }
  process.exit();
});

process.on('SIGTERM', async () => {
  logger.info('Received "SIGTERM" signal. Exiting.');
  try {
    await server.stop();
  } catch (error) {
    logger.error(error);
  }
  process.exit();
});

process.on('uncaughtException', error => {
  console.error(`Uncaught exception: ${error.message}`, error);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
