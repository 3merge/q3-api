import Q3, { Errors } from 'q3-api';
import { check } from 'express-validator';
import { generateIDToken } from '../tokens';
import { MODEL_NAME } from '../constants';

const { AuthenticationError, AuthorizationError } = Errors;

const Authenticate = async (req, res) => {
  const origin = req.get('host');
  const { email, password } = req.body;
  const User = Q3.model(MODEL_NAME);
  const userResult = await User.findVerifiedByEmail(email);

  if (!userResult.isPermitted)
    throw new AuthorizationError(
      Q3.translate('validations:notPermitted'),
    );

  if (!(await userResult.verifyPassword(password)))
    throw new AuthenticationError(
      Q3.translate('validations:password'),
    );

  const { _id: id, secret } = userResult;
  const tokens = await generateIDToken(id, secret, origin);
  res.create(tokens);
};

Authenticate.validation = [
  check(
    'email',
    Q3.translate('validations:email'),
  ).isEmail(),
  check(
    'password',
    Q3.translate('validations:password'),
  ).isString(),
];

export default Q3.define(Authenticate);
