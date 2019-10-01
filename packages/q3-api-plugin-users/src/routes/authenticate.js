import Q3, { Errors } from 'q3-api';
import { check } from 'express-validator';
import { generateIDToken } from '../tokens';
import { MODEL_NAME } from '../constants';

const { AuthenticationError, AuthorizationError } = Errors;

const Authenticate = async (
  {
    body: { email, password },
    headers: { host },
    translate,
  },
  res,
) => {
  const User = Q3.model(MODEL_NAME);
  const userResult = await User.findVerifiedByEmail(email);

  if (!userResult.isPermitted)
    throw new AuthorizationError(
      translate('validations:notPermitted'),
    );

  if (!(await userResult.verifyPassword(password)))
    throw new AuthenticationError(
      translate('validations:password'),
    );

  const { _id: id, secret } = userResult;
  const tokens = await generateIDToken(id, secret, host);
  res.create(tokens);
};

Authenticate.validation = [
  check('email')
    .isEmail()
    .withMessage((v, { req }) =>
      req.translate('validations:email'),
    ),
  check('password')
    .isString()
    .withMessage((v, { req }) =>
      req.translate('validations:password'),
    ),
];

export default Q3.define(Authenticate);
