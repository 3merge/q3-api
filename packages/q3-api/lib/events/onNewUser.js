const { send, report, eventName } = require('./utils');

module.exports = async (args) => {
  await report(eventName(__filename), args);
  await send({
    ...args,
    key: eventName(__filename),
    pathname: 'login',
  });
};
