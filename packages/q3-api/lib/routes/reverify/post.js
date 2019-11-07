const { compose } = require('q3-core-composer');
const emitter = require('../../events/emitter');
const { Users } = require('../../models');
const { checkEmail } = require('../../helpers/validation');

const ReverificationController = async (
  { body: { email } },
  res,
) => {
  const doc = await Users.findUnverifiedByEmail(email);
  const userDetails = await doc.setSecret();
  emitter.emit('onReverify', userDetails.toJSON());
  res.acknowledge();
};

ReverificationController.validation = [checkEmail];

module.exports = compose(ReverificationController);
