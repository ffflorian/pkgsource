import * as logdown from 'logdown';
import * as moment from 'moment';

export function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

// tslint:disable:typedef
export function getLogger(prefix: string) {
  const logger = logdown(prefix, {
    logger: console,
    markdown: false,
  });

  return {
    debug: (...args: any[]) => logger.debug(`[${formatDate()}]`, ...args),
    error: (...args: any[]) => logger.error(`[${formatDate()}]`, ...args),
    info: (...args: any[]) => logger.info(`[${formatDate()}]`, ...args),
    log: (...args: any[]) => logger.log(`[${formatDate()}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${formatDate()}]`, ...args),
  };
}

export function formatUptime(uptime: number): string {
  const duration = moment.duration(uptime, 'seconds').asMilliseconds();
  return moment.utc(duration).format('HH:mm:ss');
}

export function hexToUint8Array(inputString: string): Uint8Array {
  const buffer = Buffer.from(inputString, 'hex');
  return new Uint8Array(buffer);
}

export function parseRepository(repository: string | Record<string, string>): string | null {
  const cleanRepository = (repo: string) => repo.replace(/\.git$/, '').replace(/^.*:\/\//, 'http://');

  if (typeof repository === 'string') {
    return cleanRepository(repository);
  }

  if (!!repository.url) {
    return cleanRepository(repository.url);
  }

  return null;
}
