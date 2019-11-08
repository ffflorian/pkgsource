import * as express from 'express';
import * as HTTP_STATUS from 'http-status-codes';

import {ParseStatus, RepositoryParser} from '../RepositoryParser';
import {getLogger} from '../utils';

const logger = getLogger('routes/mainRoute');
const router = express.Router();
const packageNameRegex = new RegExp('^\\/((?:@[^@/]+/)?[^@/]+)(?:@([^@/]+))?\\/?$');

export const packagesRoute = () => {
  return router.get(packageNameRegex, async (req, res) => {
    const packageName = req.params[0];
    const version = req.params[1];

    logger.info(`Got request for package "${packageName}" (version "${version}").`);

    const parseResult = await RepositoryParser.getPackageUrl(packageName, version);

    switch (parseResult.status) {
      case ParseStatus.SUCCESS: {
        const redirectSite = parseResult.url;

        if ('raw' in req.query) {
          logger.info(`Returning raw info for "${packageName}": "${redirectSite}" ...`);
          return res.json({
            code: HTTP_STATUS.OK,
            url: redirectSite,
          });
        }

        logger.info(`Redirecting package "${packageName}" to "${redirectSite}" ...`);
        return res.redirect(HTTP_STATUS.MOVED_TEMPORARILY, redirectSite);
      }
      case ParseStatus.INVALID_PACKAGE_NAME: {
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
          code: HTTP_STATUS.UNPROCESSABLE_ENTITY,
          message: 'Invalid package name',
        });
      }
      case ParseStatus.INVALID_URL:
      case ParseStatus.NO_URL_FOUND: {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          code: HTTP_STATUS.NOT_FOUND,
          message: `No source URL found. Please visit https://www.npmjs.com/package/${packageName}.`,
        });
      }
      case ParseStatus.PACKAGE_NOT_FOUND: {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          code: HTTP_STATUS.NOT_FOUND,
          message: 'Package not found',
        });
      }
      case ParseStatus.VERSION_NOT_FOUND: {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          code: HTTP_STATUS.NOT_FOUND,
          message: 'Version not found',
        });
      }
      case ParseStatus.SERVER_ERROR:
      default: {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          code: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        });
      }
    }
  });
};
