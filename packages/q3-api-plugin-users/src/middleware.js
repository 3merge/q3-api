import Q3, { Errors } from 'q3-api';
import { verifyToken } from './tokens';
import { MODEL_NAME } from './constants';

const { AuthenticationError } = Errors;

export default async (req, res, next) => {
  const User = Q3.model(MODEL_NAME);

  req.user = await verifyToken(
    req.header('Authorization'),
    req.header('exp-nonce'),
    req.get('host'),
    User,
  );

  if (!req.user) {
    req.user = await User.findByApiKey(
      req.header('Authorization'),
    );
  }

  next();
};

export const enforceLogin = async (req, res, next) => {
  if (!req.user) {
    next(
      new AuthenticationError(Q3.translate('errors:login')),
    );
  } else {
    next();
  }
};
