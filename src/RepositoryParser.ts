import packageJson = require('package-json');
import urlRegex = require('url-regex');
import validatePackageName = require('validate-npm-package-name');

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
  | {
      status: Exclude<ParseStatus, ParseStatus.SUCCESS>;
    }
  | {
      status: ParseStatus.SUCCESS;
      url: string;
    };

export class RepositoryParser {
  static async getPackageUrl(rawPackageName: string, version: string = 'latest'): Promise<ParseResult> {
    let packageInfo;
    let parsedUrl;

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

    const parsedRepository = !!packageInfo.repository && RepositoryParser.parseRepositoryEntry(packageInfo.repository);

    if (parsedRepository) {
      logger.info(`Found repository "${parsedRepository}" for package "${rawPackageName}" (version "${version}").`);
      parsedUrl = parsedRepository;
    } else if (!!packageInfo.homepage && typeof packageInfo.homepage === 'string') {
      logger.info(`Found homepage "${packageInfo.homepage}" for package "${rawPackageName}" (version "${version}").`);
      parsedUrl = packageInfo.homepage;
    } else if (!!packageInfo.url && typeof packageInfo.url === 'string') {
      logger.info(`Found URL "${packageInfo.url}" for package "${rawPackageName}" (version "${version}").`);
      parsedUrl = packageInfo.url;
    }

    if (!parsedUrl) {
      logger.info(`No source URL found in package "${rawPackageName}".`);
      return {status: ParseStatus.NO_URL_FOUND};
    }

    const urlIsValid = RepositoryParser.validateUrl(parsedUrl);

    if (!urlIsValid) {
      logger.info(`Invalid URL "${parsedUrl}" for package "${rawPackageName}".`);
      return {status: ParseStatus.INVALID_URL};
    }

    return {
      status: ParseStatus.SUCCESS,
      url: parsedUrl,
    };
  }

  static parseRepositoryEntry(repository: string | Record<string, string>): string | null {
    if (typeof repository === 'string') {
      return RepositoryParser.cleanRepositoryUrl(repository);
    }

    if (!!repository.url) {
      return RepositoryParser.cleanRepositoryUrl(repository.url);
    }

    return null;
  }

  private static cleanRepositoryUrl(repo: string): string {
    return repo.replace(/\.git$/, '').replace(/^.*:\/\//, 'http://');
  }

  private static validateUrl(url: any): boolean {
    if (typeof url !== 'string') {
      return false;
    }

    return urlRegex({exact: true}).test(url);
  }
}
