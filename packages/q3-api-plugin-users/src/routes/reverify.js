import Q3 from 'q3-api';
import { check } from 'express-validator';
import { MODEL_NAME, Events } from '../constants';

const Reverify = async ({ body }, res) => {
  const { email } = body;
  const User = Q3.model(MODEL_NAME);
  const doc = await User.findUnverifiedByEmail(email);
  const { _id, secret } = await doc.setSecret();

  Events.emit('reverify', {
    id: _id.toString(),
    email,
    secret,
  });

  res.acknowledge();
};

Reverify.validation = [
  check(
    'email',
    Q3.translate('validations:email'),
  ).isEmail(),
];

export default Q3.define(Reverify);
