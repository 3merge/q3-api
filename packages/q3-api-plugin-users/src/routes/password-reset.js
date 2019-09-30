import Q3 from 'q3-api';
import { check } from 'express-validator';
import { MODEL_NAME, Events } from '../constants';

const ResetPassword = async ({ body }, res) => {
  const { email } = body;
  const User = Q3.model(MODEL_NAME);
  const doc = await User.findVerifiedByEmail(email);
  const password = await doc.setPassword();

  Events.emit('password-reset', {
    email,
    password,
  });

  res.acknowledge();
};

ResetPassword.validation = [
  check(
    'email',
    Q3.translate('validations:email'),
  ).isEmail(),
];

export default Q3.define(ResetPassword);
