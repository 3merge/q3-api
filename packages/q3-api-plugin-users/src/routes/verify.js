import Q3, { Errors } from 'q3-api';
import { check } from 'express-validator';
import {
  MODEL_NAME,
  matchWithConfirmation,
  Events,
} from '../constants';

const { ConflictError, ValidationError } = Errors;

const Verify = async ({ body }, res) => {
  const { id, password, verificationCode } = body;
  const User = Q3.model(MODEL_NAME);
  const doc = await User.findUserBySecret(
    id,
    verificationCode,
  );

  if (doc.hasExpired)
    throw new ConflictError(
      Q3.translate('validations:verificationCode'),
    );

  if (!password)
    throw new ValidationError(
      Q3.translate('validations:password'),
    );

  await doc.setPassword(password);
  Events.emit('verify', {
    email: doc.email,
  });

  res.acknowledge();
};

Verify.validation = [
  check('id', Q3.translate('validations:id')).isMongoId(),
  check(
    'verificationCode',
    Q3.translate('validations:verificationCode'),
  ).isString(),
  check(
    'password',
    Q3.translate('validations:confirmationPassword'),
  )
    .isString()
    .custom(matchWithConfirmation),
];

export default Q3.define(Verify);
