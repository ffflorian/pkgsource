import * as path from 'path';
import * as findUp from 'find-up';

const packageJsonPath = findUp.sync('package.json', {allowSymlinks: false});
if (!packageJsonPath) {
  throw new Error('Could not find file `swagger.json`');
}

const {version}: {version: string} = require(packageJsonPath);

export interface ServerConfig {
  CACHE_DURATION_SECONDS: number;
  COMPRESS_LEVEL: number;
  COMPRESS_MIN_SIZE: number;
  DEVELOPMENT?: boolean;
  DIST_DIR: string;
  ENVIRONMENT: string;
  PORT_HTTP: number;
  VERSION: string;
}

const config: ServerConfig = {
  CACHE_DURATION_SECONDS: 300, // 5 minutes
  COMPRESS_LEVEL: 6,
  COMPRESS_MIN_SIZE: 500,
  DIST_DIR: path.resolve(__dirname),
  ENVIRONMENT: process.env.ENVIRONMENT || 'prod',
  // eslint-disable-next-line no-magic-numbers
  PORT_HTTP: Number(process.env.PORT) || 4000,
  VERSION: version,
};

config.DEVELOPMENT = config.ENVIRONMENT === 'dev';

export {config};
