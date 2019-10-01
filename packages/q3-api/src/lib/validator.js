import { pickBy } from 'lodash';
import {
  matchedData,
  validationResult,
} from 'express-validator';
import { compose } from '../helpers/utils';
import { ValidationError } from '../helpers/errors';

const isTruthy = (a) => a !== null && a !== undefined;

const validate = (req, res, next) => {
  try {
    validationResult(req).throw();
    const opts = { includeOptionals: true };
    const data = matchedData(req, opts);
    req.body = pickBy(data, isTruthy);
    next();
  } catch (err) {
    next(new ValidationError(err.mapped()));
  }
};

export default (middleware = []) =>
  compose([...middleware, validate]);
