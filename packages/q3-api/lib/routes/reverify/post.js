const { compose } = require('q3-core-composer');
const mailer = require('q3-core-mailer');
const { Users } = require('../../models');
const { checkEmail } = require('../../helpers/validation');

const ReverificationController = async (
  { body: { email }, evoke },
  res,
) => {
  const doc = await Users.findUnverifiedByEmail(email);
  const { _id: id, secret } = await doc.setSecret();
  evoke({ secret, id, email });
  res.acknowledge();
};

ReverificationController.validation = [checkEmail];

ReverificationController.effect = [
  async ({ email, id, secret }, { t }) =>
    mailer()
      .to([email])
      .subject(t('reverify'))
      .props({
        body: t('messages:verification'),
        rows: [
          {
            label: t('labels:accountID'),
            value: id,
          },
          {
            label: t('labels:verificationCode'),
            value: secret,
          },
        ],
      })
      .send(),
];

module.exports = compose(ReverificationController);
