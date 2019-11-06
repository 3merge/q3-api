const { compose } = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { Users } = require('../../models');
const { checkEmail } = require('../../helpers/validation');

const LookupAccount = async ({ query: { email } }, res) => {
  const doc = await Users.findOne({ email })
    .lean()
    .exec();

  if (!doc)
    exception('BadRequest')
      .msg('account')
      .throw();

  res.acknowledge();
};

LookupAccount.validation = [checkEmail];
module.exports = compose(LookupAccount);
