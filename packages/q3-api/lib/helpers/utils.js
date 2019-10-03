const connect = require('connect');

module.exports.cond = (a) => (Array.isArray(a) ? a : []);

module.exports.compose = (a = []) => {
  const chain = connect();
  a.flat().forEach(chain.use.bind(chain));
  return chain;
};
