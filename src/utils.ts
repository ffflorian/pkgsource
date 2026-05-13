import * as dateFns from 'date-fns';
import logdown from 'logdown';
import {URL} from 'node:url';

export function formatDate(): string {
  return dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

export function getLogger(name: string) {
  const logger = logdown(`pkgsource/${name}`, {
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

export function validateUrl(url: string): null | URL {
  try {
    return new URL(url);
  } catch (error) {
    getLogger('utils').info(`Could not create new URL from "${url}": ${error}`);
    return null;
  }
}

