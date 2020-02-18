exports.getPermissionBase = (args) => ({
  fields: '*',
  ownership: 'Any',
  role: 'Developer',
  ...args,
});
