const { get, invoke, isFunction } = require('lodash');
const mailgun = require('./mailgun');

module.exports = async (strategy, data = {}) => {
  const service = get(
    {
      Mailgun: mailgun,
    },
    strategy,
  );

  if (!service || !isFunction(service))
    throw new Error('Unknown strategy');

  return service(
    await invoke(global, 'getMailerVars'),
  ).send(data);
};
