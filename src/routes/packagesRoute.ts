import {Router} from 'express';
import {URL} from 'url';
import {StatusCodes as HTTP_STATUS} from 'http-status-codes';
import packageJson from 'package-json';

import {getPackageUrl, ParseStatus} from '../RepositoryParser';
import {getLogger, queryParameterExists, validateUrl} from '../utils';

interface PackagesRouteResponseBody {
  code: HTTP_STATUS;
  message?: string;
  packageInfo?: packageJson.FullMetadata;
  url?: string;
}

type PackagesRouteQueryParameters = Record<'unpkg' | 'raw', string>;

type PackagesRouteParamsDictionary = [string, string];

const logger = getLogger('routes/packagesRoute');
const router = Router();
const packageNameRegex = new RegExp('^\\/((?:@[^@/]+/)?[^@/]+)(?:@([^@/]+))?\\/?$');
export const unpkgBase = new URL('https://unpkg.com/browse');

export function packagesRoute(): Router {
  return router.get<PackagesRouteParamsDictionary, PackagesRouteResponseBody, void, PackagesRouteQueryParameters>(
    packageNameRegex,
    async (request, response) => {
      const packageName = request.params[0]?.trim() || 'pkgsource';
      const version = request.params[1]?.trim() || 'latest';
      let errorCode: HTTP_STATUS;
      let errorMessage: string;

      logger.info(`Got request for package "${packageName}" (version "${version}").`);

      if (queryParameterExists(request, 'unpkg')) {
        const redirectUrl = `${unpkgBase}/${packageName}@${version}/`;

        if (!validateUrl(redirectUrl)) {
          return response
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({code: HTTP_STATUS.BAD_REQUEST, message: `Invalid URL: ${redirectUrl}`});
        }

        if (queryParameterExists(request, 'raw')) {
          logger.info(`Returning raw unpkg info for "${packageName}": "${redirectUrl}" ...`);
          return response.json({
            code: HTTP_STATUS.OK,
            url: redirectUrl,
          });
        }

        logger.info(`Redirecting package "${packageName}" to unpkg: "${redirectUrl}" ...`);
        return response.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectUrl);
      }

      const parseResult = await getPackageUrl(packageName, version);
      const packageInfo = parseResult.packageInfo;

      switch (parseResult.status) {
        case ParseStatus.SUCCESS: {
          const redirectSite = parseResult.url;

          if (queryParameterExists(request, 'raw')) {
            logger.info(`Returning raw info for "${packageName}": "${redirectSite}" ...`);
            return response.json({
              code: HTTP_STATUS.OK,
              packageInfo: packageInfo,
              url: redirectSite,
            });
          }

          logger.info(`Redirecting package "${packageName}" to "${redirectSite}" ...`);
          return response.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectSite);
        }

        case ParseStatus.INVALID_PACKAGE_NAME: {
          errorCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
          errorMessage = 'Invalid package name';
          break;
        }

        case ParseStatus.INVALID_URL:
        case ParseStatus.NO_URL_FOUND: {
          errorCode = HTTP_STATUS.NOT_FOUND;
          errorMessage = `No source URL found.`;
          return response.status(errorCode).json({code: errorCode, message: errorMessage, packageInfo});
        }

        case ParseStatus.PACKAGE_NOT_FOUND: {
          errorCode = HTTP_STATUS.NOT_FOUND;
          errorMessage = 'Package not found';
          break;
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

      return response.status(errorCode).json({code: errorCode, message: errorMessage});
    }
  );
}
