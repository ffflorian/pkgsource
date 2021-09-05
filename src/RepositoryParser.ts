import packageJson = require('package-json');
import * as validatePackageName from 'validate-npm-package-name';

import {getLogger, validateUrl} from './utils';

const logger = getLogger('RepositoryParser');

export enum ParseStatus {
  INVALID_PACKAGE_NAME = 'INVALID_NAME',
  INVALID_URL = 'INVALID_URL',
  NO_URL_FOUND = 'NO_URL_FOUND',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  SUCCESS = 'SUCCESS',
  VERSION_NOT_FOUND = 'VERSION_NOT_FOUND',
}

export type ParseResult =
  | {
      status: Exclude<ParseStatus, ParseStatus.SUCCESS>;
    }
  | {
      status: ParseStatus.SUCCESS;
      url: string;
    };

const knownSSLHosts = ['bitbucket.org', 'github.com', 'gitlab.com', 'sourceforge.net'];

function parseRepositoryEntry(repository: string | Record<string, string>): string | null {
  return typeof repository === 'string' ? repository : repository.url || null;
}

function cleanUrl(url: string): string | null {
  url = url.replace(/\.git$/, '').replace(/^.*:\/\//, 'http://');
  const parsedURL = validateUrl(url);
  if (parsedURL) {
    parsedURL.hash = '';
    parsedURL.password = '';
    parsedURL.protocol = knownSSLHosts.includes(parsedURL.hostname) ? 'https:' : 'http:';
    parsedURL.search = '';
    parsedURL.username = '';
    return parsedURL.href;
  }
  return null;
}

export async function getPackageUrl(rawPackageName: string, version: string = 'latest'): Promise<ParseResult> {
  let packageInfo: packageJson.FullMetadata;
  let foundUrl: string | null = null;
  let parsedRepository: string | null = null;

  const validateResult = validatePackageName(rawPackageName);

  if (!validateResult.validForNewPackages) {
    logger.info(`Invalid package name: "${rawPackageName}"`, validateResult);
    return {status: ParseStatus.INVALID_PACKAGE_NAME};
  }

  try {
    packageInfo = await packageJson(rawPackageName, {fullMetadata: true, version});
  } catch (error) {
    if (error instanceof packageJson.VersionNotFoundError) {
      logger.info(`Version "${version}" not found for package "${rawPackageName}".`);
      return {status: ParseStatus.VERSION_NOT_FOUND};
    }

    if (error instanceof packageJson.PackageNotFoundError) {
      logger.info(`Package "${rawPackageName}" not found.`);
      return {status: ParseStatus.PACKAGE_NOT_FOUND};
    }

    logger.error(error);

    return {status: ParseStatus.SERVER_ERROR};
  }

  if (packageInfo.repository) {
    parsedRepository = parseRepositoryEntry(packageInfo.repository);
  }

  if (parsedRepository) {
    logger.info(`Found repository "${parsedRepository}" for package "${rawPackageName}" (version "${version}").`);
    foundUrl = parsedRepository;
  } else if (typeof packageInfo.homepage === 'string') {
    logger.info(`Found homepage "${packageInfo.homepage}" for package "${rawPackageName}" (version "${version}").`);
    foundUrl = packageInfo.homepage;
  } else if (typeof packageInfo.url === 'string') {
    logger.info(`Found URL "${packageInfo.url}" for package "${rawPackageName}" (version "${version}").`);
    foundUrl = packageInfo.url;
  }

  if (!foundUrl) {
    logger.info(`No source URL found in package "${rawPackageName}".`);
    return {status: ParseStatus.NO_URL_FOUND};
  }

  foundUrl = cleanUrl(foundUrl);

  if (!foundUrl) {
    logger.info(`Invalid URL "${foundUrl}" for package "${rawPackageName}".`);
    return {status: ParseStatus.INVALID_URL};
  }

  return {
    status: ParseStatus.SUCCESS,
    url: foundUrl,
  };
}
