const { setModel } = require('q3-api');

const Company = setModel(
  'q3-api-fake-companies',
  require('./company'),
);

const Startup = Company.discriminator(
  'q3-api-fake-startups',
  require('./startup'),
);

module.exports = {
  Company,
  Startup,
};
