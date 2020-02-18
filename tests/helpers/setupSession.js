const { Users, Permissions } = require('q3-api');
const { getUserBase } = require('../fixtures/user');
const {
  getPermissionBase,
} = require('../fixtures/permission');

module.exports = async (permissions) => {
  const email = `session-user-${new Date().toISOString()}@gmail.com`;
  const sup = await Users.create({
    ...getUserBase(),
    active: true,
    verified: true,
    password: 'Sh!0978ydsn*1',
    email,
  });

  await Permissions.create(
    permissions.map((p) => getPermissionBase(p)),
  );

  return `Apikey ${await sup.generateApiKey()}`;
};
