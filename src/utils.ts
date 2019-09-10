import * as moment from 'moment';

export function formatDate(): string {
  return moment().format('YYYY-MM-DD HH:mm:ss');
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
