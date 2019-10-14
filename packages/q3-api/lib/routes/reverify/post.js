import { compose } from 'q3-core-composer';
import mailer from 'q3-core-mailer';
import { Users } from '../../models';
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
  async ({ email, id, secret }, { t }) =>
    mailer()
      .to([email])
      .subject(t('reverify'))
      .props({
        body: t('verificationDetails', {
          id,
          secret,
        }),
      })
      .send(),
];

module.exports = compose(reverify);
