import {URL} from 'url';
import * as dateFns from 'date-fns';
import * as logdown from 'logdown';
import type {Request} from 'express';

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

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    getLogger('utils').info(`Could not create new URL from "${url}": ${error}`);
    return false;
  }
}

export function queryParameterExists<ReqQuery extends Record<string, string>>(
  request: Request<any, any, any, ReqQuery>,
  parameter: string
): boolean {
  return parameter in request.query && request.query[parameter] !== 'false';
}
