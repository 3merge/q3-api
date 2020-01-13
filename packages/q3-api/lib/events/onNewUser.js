const { send, report, eventName } = require('./utils');

module.exports = async (args) => {
  await report(eventName(__filename), args);
  await send({
    key: eventName(__filename),
    pathname: 'verify',
    ...args,
  });
};
