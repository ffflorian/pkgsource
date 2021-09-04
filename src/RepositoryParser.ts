import packageJson = require('package-json');
import {URL} from 'url';
import * as validatePackageName from 'validate-npm-package-name';

import {getLogger} from './utils';

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
  | {packageInfo?: packageJson.FullMetadata} & (
      | {
          status: Exclude<ParseStatus, ParseStatus.SUCCESS>;
        }
      | {
          status: ParseStatus.SUCCESS;
          url: string;
        }
    );

export class RepositoryParser {
  public static async getPackageUrl(rawPackageName: string, version: string = 'latest'): Promise<ParseResult> {
    let packageInfo: packageJson.FullMetadata;
    let parsedUrl: string | null = null;
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
      parsedRepository = RepositoryParser.parseRepositoryEntry(packageInfo.repository);
    }

    if (parsedRepository) {
      logger.info(`Found repository "${parsedRepository}" for package "${rawPackageName}" (version "${version}").`);
      parsedUrl = parsedRepository;
    } else if (typeof packageInfo?.homepage === 'string') {
      logger.info(`Found homepage "${packageInfo.homepage}" for package "${rawPackageName}" (version "${version}").`);
      parsedUrl = packageInfo.homepage;
    } else if (typeof packageInfo.url === 'string') {
      logger.info(`Found URL "${packageInfo.url}" for package "${rawPackageName}" (version "${version}").`);
      parsedUrl = packageInfo.url;
    }

    if (!parsedUrl) {
      logger.info(`No source URL found in package "${rawPackageName}".`);
      return {packageInfo, status: ParseStatus.NO_URL_FOUND};
    }

    parsedUrl = parsedUrl.toString().trim().toLowerCase();

    const urlIsValid = RepositoryParser.validateUrl(parsedUrl);

    if (!urlIsValid) {
      logger.info(`Invalid URL "${parsedUrl}" for package "${rawPackageName}".`);
      return {packageInfo, status: ParseStatus.INVALID_URL};
    }

    parsedUrl = RepositoryParser.tryHTTPS(parsedUrl);

    return {
      packageInfo,
      status: ParseStatus.SUCCESS,
      url: parsedUrl,
    };
  }

  public static parseRepositoryEntry(repository: string | Record<string, string>): string | null {
    if (typeof repository === 'string') {
      return RepositoryParser.cleanRepositoryUrl(repository);
    }

    if (repository.url) {
      return RepositoryParser.cleanRepositoryUrl(repository.url);
    }

    return null;
  }

  private static readonly knownSSLHosts = ['bitbucket.org', 'github.com', 'gitlab.com', 'sourceforge.net'];

  private static cleanRepositoryUrl(repo: string): string {
    return repo.replace(/\.git$/, '').replace(/^.*:\/\//, 'http://');
  }

  private static tryHTTPS(url: string): string {
    const parsedURL = new URL(url);
    if (RepositoryParser.knownSSLHosts.includes(parsedURL.hostname)) {
      parsedURL.protocol = 'https:';
    }
    return parsedURL.href;
  }

  private static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      logger.info(`Could not create new URL from "${url}": ${error}`);
      return false;
    }
  }
}
