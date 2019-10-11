import { compose } from 'q3-core-composer';
import { Users } from '../../models';
import mailer from '../../config/mailer';
import { checkEmail } from '../../helpers/validation';

const reverify = async (
  { body: { email }, evoke },
  res,
) => {
  const doc = await Users.findUnverifiedByEmail(email);
  const { _id: id, secret } = await doc.setSecret();
  evoke({ secret, id, email });
  res.acknowledge();
};

reverify.validation = [checkEmail];

reverify.effect = [
  ({ email, id, secret }, { clean }) => {
    mailer(email, clean('reverify', [id, secret]));
  },
];

module.exports = compose(reverify);
