import { GeneralError } from "@feathersjs/errors";

export default (suppressMessage = true) => (
  (error: any, _req: any, _res: any, next: any): any => {
    if (!error.code) {
      const newError = new GeneralError('server error');
      next(newError);
    }
    if (suppressMessage) delete error.message;
    delete error.data;
    next(error);
  }
);
