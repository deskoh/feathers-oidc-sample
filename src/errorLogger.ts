import logger from './logger';

export default (errorStack = false) => (
  (error: any, _req: any, _res: any, next: any): any => {
    logger.error(error);
    if (errorStack && error.code !== 404) logger.error(error.stack);
    next(error);
  }
);
