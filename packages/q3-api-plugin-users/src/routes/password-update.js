import Q3 from 'q3-api';
import { check } from 'express-validator';
import {
  MODEL_NAME,
  matchWithConfirmation,
  Events,
} from '../constants';

const UpdatePassword = async ({ body, user }, res) => {
  const { previousPassword, newPassword } = body;
  const User = Q3.model(MODEL_NAME);

  const doc = await User.findVerifiedById(user.id);
  await doc.verifyPassword(previousPassword, true);
  await doc.setPassword(newPassword);

  Events.emit('password-update', {
    email: doc.email,
  });

  res.acknowledge();
};

UpdatePassword.validation = [
  check(
    'previousPassword',
    Q3.translate('validations:password'),
  ).isString(),
  check(
    'newPassword',
    Q3.translate('validations:confirmationPassword'),
  )
    .isString()
    .custom(matchWithConfirmation),
];

export default Q3.define(UpdatePassword);
