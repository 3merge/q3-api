import Q3, { Errors } from 'q3-api';
import { check } from 'express-validator';
import {
  MODEL_NAME,
  matchWithConfirmation,
} from '../constants';

const { ConflictError, ValidationError } = Errors;

const Verify = async (
  { body, translate, message },
  res,
) => {
  const { id, password, verificationCode } = body;
  const User = Q3.model(MODEL_NAME);
  const doc = await User.findUserBySecret(
    id,
    verificationCode,
  );

  if (doc.hasExpired)
    throw new ConflictError(
      translate('validations:verificationCode'),
    );

  if (!password)
    throw new ValidationError(
      translate('validations:password'),
    );

  await doc.setPassword(password);
  message(doc.email, translate('messages:verified'));
  res.acknowledge();
};

Verify.validation = [
  check('id')
    .isMongoId()
    .withMessage((v, { req }) =>
      req.translate('validations:id'),
    ),
  check('verificationCode')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:verificationCode'),
    ),
  check('password')
    .isString()
    .custom(matchWithConfirmation)
    .withMessage((v, { req }) =>
      req.translate('validations:confirmationPassword'),
    ),
];

export default Q3.define(Verify);
