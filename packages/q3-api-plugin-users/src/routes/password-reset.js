import Q3 from 'q3-api';
import { check } from 'express-validator';
import { MODEL_NAME } from '../constants';

const ResetPassword = async (
  { body: { email }, message, translate },
  res,
) => {
  const User = Q3.model(MODEL_NAME);
  const doc = await User.findVerifiedByEmail(email);
  const password = await doc.setPassword();
  const compose = translate('messages:passwordReset', [
    password,
  ]);

  message(email, compose);
  res.acknowledge();
};

ResetPassword.validation = [
  check('email')
    .isEmail()
    .withMessage((v, { req }) =>
      req.translate('validations:email'),
    ),
];

export default Q3.define(ResetPassword);
