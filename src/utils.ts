import * as dateFns from 'date-fns';
import * as logdown from 'logdown';

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
