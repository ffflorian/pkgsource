import {findUp} from 'find-up';
import {promises as fs} from 'node:fs';

const packageJsonPath = await findUp('package.json', {allowSymlinks: false, type: 'file'});
if (!packageJsonPath) {
  throw new Error('Could not find file `package.json`');
}

const {version}: {version: string} = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
const defaultPort = 4000;

export interface ServerConfig {
  CACHE_DURATION_SECONDS: number;
  COMPRESS_LEVEL: number;
  COMPRESS_MIN_SIZE: number;
  DEVELOPMENT?: boolean;
  DIST_DIR: string;
  ENVIRONMENT: string;
  PORT_HTTP: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  RATE_LIMIT_WINDOW_SECONDS: number;
  VERSION: string;
}

const config: ServerConfig = {
  CACHE_DURATION_SECONDS: 300, // 5 minutes
  COMPRESS_LEVEL: 6,
  COMPRESS_MIN_SIZE: 500,
  DIST_DIR: '.',
  ENVIRONMENT: process.env.ENVIRONMENT || 'prod',
  PORT_HTTP: Number(process.env.PORT || defaultPort),
  RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 120),
  RATE_LIMIT_WINDOW_SECONDS: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60),
  VERSION: version,
};

config.DEVELOPMENT = config.ENVIRONMENT === 'dev';

export {config};
