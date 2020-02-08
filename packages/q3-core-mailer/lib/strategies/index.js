const mailgun = require('./mailgun');

module.exports = async (strategy, data = {}) => {
  const services = {
    Mailgun: mailgun(),
  };

  if (!(strategy in services))
    throw new Error('Unknown strategy');

  return services[strategy].send(data);
};
