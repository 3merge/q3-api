const {
  check,
  compose,
  verify,
} = require('q3-core-composer');
const { exception } = require('q3-core-responder');
const { Grant } = require('q3-core-access');
const { isNil } = require('lodash');
const { Users } = require('../../models');

const PasswordGenerateController = async (
  { body: { id }, user },
  res,
) => {
  const doc = await Users.findById(id);
  const grant = new Grant(user)
    .can('Create')
    .on('users')
    .test(doc);

  if (isNil(grant))
    exception('Authorization')
      .msg('cannotGeneratePassword')
      .throw();

  res.ok({
    credentials: await doc.setPassword(),
  });
};

PasswordGenerateController.authorization = [verify];

PasswordGenerateController.validation = [
  check('id').isMongoId(),
];

module.exports = compose(PasswordGenerateController);
