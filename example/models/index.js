const { setModel } = require('q3-api');
const company = require('./company');

module.exports = {
  Company: setModel('q3-api-companies', company),
};
