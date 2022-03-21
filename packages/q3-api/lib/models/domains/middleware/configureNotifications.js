require('../schema').plugin(
  require('q3-plugin-schedulerdispatch').plugin,
  [
    {
      capture: ['_id', 'tenant', 'email'],
      messageType: 'domains',
      name: 'onNewDomain',
      when: {
        new: true,
      },
    },
  ],
);
