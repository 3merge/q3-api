const { compose } = require('q3-core-composer');
const { emit } = require('q3-core-mailer');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const ReverificationController = async (
  { body: { email } },
  res,
) => {
  const doc = await Users.findUnverifiedByEmail(email);
  const withSecret = await doc.setSecret();
  const userDetails = await withSecret.save();
  emit('onReverify', userDetails.toJSON());
  res.acknowledge();
};

ReverificationController.validation = [checkEmail];

module.exports = compose(ReverificationController);
