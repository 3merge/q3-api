const { verify, compose } = require('q3-core-composer');

const AccountDelete = async ({ user }, res) => {
  await user
    .set({
      active: false,
    })
    .save();

  res.acknowledge();
};

AccountDelete.authorization = [verify];
AccountDelete.validation = [];

module.exports = compose(AccountDelete);
