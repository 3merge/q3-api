const { send, eventName } = require('./utils');

module.exports = async (args) => {
  await send({
    key: eventName(__filename),
    pathname: 'reverify',
    ...args,
  });
};
