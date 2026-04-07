import {Controller, Get, Param, Query, Res} from '@nestjs/common';
import {Response} from 'express';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import {URL} from 'node:url';

import {getPackageUrl, ParseStatus} from '../RepositoryParser';
import {getLogger, validateUrl} from '../utils';

interface PackagesRouteResponseBody {
  code: HTTP_STATUS;
  message?: string;
  url?: string;
}

const logger = getLogger('controllers/PackagesController');
export const unpkgBase = new URL('https://unpkg.com/browse');

async function handlePackageRequest(
  packageName: string,
  version: string,
  query: Record<string, string>,
  response: Response
): Promise<void> {
  logger.info(`Got request for package "${packageName}" (version "${version}").`);

  if (queryParamExists(query, 'unpkg')) {
    const redirectUrl = `${unpkgBase}/${packageName}@${version}/`;

    if (!validateUrl(redirectUrl)) {
      response.status(HTTP_STATUS.BAD_REQUEST).json({
        code: HTTP_STATUS.BAD_REQUEST,
        message: `Invalid URL: ${redirectUrl}`,
      } satisfies PackagesRouteResponseBody);
      return;
    }

    if (queryParamExists(query, 'raw')) {
      logger.info(`Returning raw unpkg info for "${packageName}": "${redirectUrl}" ...`);
      response.json({code: HTTP_STATUS.OK, url: redirectUrl} satisfies PackagesRouteResponseBody);
      return;
    }

    logger.info(`Redirecting package "${packageName}" to unpkg: "${redirectUrl}" ...`);
    response.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectUrl);
    return;
  }

  const parseResult = await getPackageUrl(packageName, version);

  let errorCode: HTTP_STATUS;
  let errorMessage: string;

  switch (parseResult.status) {
    case ParseStatus.INVALID_PACKAGE_NAME: {
      errorCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
      errorMessage = 'Invalid package name';
      break;
    }

    case ParseStatus.INVALID_URL:
    case ParseStatus.NO_URL_FOUND: {
      errorCode = HTTP_STATUS.NOT_FOUND;
      errorMessage = `No source URL found. Please visit https://www.npmjs.com/package/${packageName}.`;
      break;
    }

    case ParseStatus.PACKAGE_NOT_FOUND: {
      errorCode = HTTP_STATUS.NOT_FOUND;
      errorMessage = 'Package not found';
      break;
    }

    case ParseStatus.SUCCESS: {
      const redirectSite = parseResult.url;
      if (queryParamExists(query, 'raw')) {
        logger.info(`Returning raw info for "${packageName}": "${redirectSite}" ...`);
        response.json({code: HTTP_STATUS.OK, url: redirectSite} satisfies PackagesRouteResponseBody);
        return;
      }
      logger.info(`Redirecting package "${packageName}" to "${redirectSite}" ...`);
      response.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectSite);
      return;
    }

    case ParseStatus.VERSION_NOT_FOUND: {
      errorCode = HTTP_STATUS.NOT_FOUND;
      errorMessage = 'Version not found';
      break;
    }

    case ParseStatus.SERVER_ERROR:
    default: {
      errorCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      errorMessage = 'Internal server error';
      break;
    }
  }

  response.status(errorCode).json({code: errorCode, message: errorMessage} satisfies PackagesRouteResponseBody);
}

function parsePackageAndVersion(rawName: string): {name: string; version: string} {
  const atIndex = rawName.indexOf('@', 1);
  if (atIndex > 0) {
    return {name: rawName.slice(0, atIndex), version: rawName.slice(atIndex + 1)};
  }
  return {name: rawName, version: 'latest'};
}

function queryParamExists(query: Record<string, string>, key: string): boolean {
  return key in query && query[key] !== 'false';
}

@Controller()
export class PackagesController {
  @Get(':packageName')
  async getPackage(
    @Param('packageName') rawPackageName: string,
    @Query() query: Record<string, string>,
    @Res() res: Response
  ): Promise<void> {
    const {name, version} = parsePackageAndVersion(rawPackageName.trim());
    await handlePackageRequest(name, version, query, res);
  }

  @Get(':scope/:packageName')
  async getScopedPackage(
    @Param('scope') scope: string,
    @Param('packageName') rawPackageName: string,
    @Query() query: Record<string, string>,
    @Res() res: Response
  ): Promise<void> {
    const {name: pkgPart, version} = parsePackageAndVersion(rawPackageName.trim());
    const fullName = `${scope.trim()}/${pkgPart}`;
    await handlePackageRequest(fullName, version, query, res);
  }
}
