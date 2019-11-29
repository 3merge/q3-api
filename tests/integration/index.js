const Q3 = require('q3-api');

Q3.routes();
const app = Q3.connect().then((e) => {
  if (e !== null) throw new Error('Failed to connect');
  return Q3.$app;
});

module.exports = app;
