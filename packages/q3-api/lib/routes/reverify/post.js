import Q3 from 'q3-api';
import { check } from 'express-validator';
import { MODEL_NAME } from '../constants';

const Reverify = async (
  { body, message, translate },
  res,
) => {
  const { email } = body;
  const User = Q3.model(MODEL_NAME);
  const doc = await User.findUnverifiedByEmail(email);
  const { _id, secret } = await doc.setSecret();
  const compose = translate('messages:reverify', [
    _id.toString(),
    secret,
  ]);

  message(email, compose);
  res.acknowledge();
};

Reverify.validation = [
  check('email')
    .isEmail()
    .withMessage((v, { req }) =>
      req.translate('validations:email'),
    ),
];

export default Q3.define(Reverify);
