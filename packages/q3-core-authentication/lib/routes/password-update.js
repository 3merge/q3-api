import Q3 from 'q3-api';
import { check } from 'express-validator';
import {
  MODEL_NAME,
  matchWithConfirmation,
} from '../constants';

const UpdatePassword = async (
  { body, user, message, translate },
  res,
) => {
  const { previousPassword, newPassword } = body;
  const User = Q3.model(MODEL_NAME);

  const doc = await User.findVerifiedById(user.id);
  await doc.verifyPassword(previousPassword, true);
  await doc.setPassword(newPassword);

  message(doc.email, translate('messages:passwordUpdated'));
  res.acknowledge();
};

UpdatePassword.validation = [
  check('previousPassword')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:password'),
    ),
  check('newPassword')
    .isString()
    .custom(matchWithConfirmation)
    .withMessage((v, { req }) =>
      req.translate('validations:confirmationPassword'),
    ),
];

export default Q3.define(UpdatePassword);
