const { compose } = require('q3-core-composer');
const { queue } = require('q3-core-scheduler');
const { Users } = require('../../models');
const { checkEmail } = require('../../utils');

const ReverificationController = async (
  { body: { email } },
  res,
) => {
  const doc = await Users.findByEmail(email);
  const withSecret = await doc.setSecret();
  const userDetails = await withSecret.save();
  await queue('onReverify', userDetails.toJSON());
  res.acknowledge();
};

ReverificationController.validation = [checkEmail];

module.exports = compose(ReverificationController);
