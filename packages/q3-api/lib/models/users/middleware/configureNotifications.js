require('q3-schema-users').plugin(
  require('q3-plugin-schedulerdispatch').plugin,
  [
    {
      capture: ['_id', 'id', 'firstName', 'email'],
      messageType: 'users',
      name: 'onArchivedUser',
      when: {
        deleted: true,
      },
    },
  ],
);
