/*  eslint-disable global-require, import/no-dynamic-require */
const { exception } = require('q3-core-responder');
const { isObject, get, upperCase } = require('lodash');
const {
  STRATEGIES,
} = require('../plugins/verification/constants');

const Token = {
  [STRATEGIES[0]]: require('./tokenSMS'),
  [STRATEGIES[1]]: require('./tokenMMS'),
  [STRATEGIES[2]]: require('./tokenTFA'),

  getStrategyInterface(strategy) {
    let fn;
    const formatted = upperCase(strategy);

    try {
      fn = get(this, formatted);

      if (!isObject(fn))
        throw new Error('Could not load token interface');
    } catch (e) {
      exception('BadRequest')
        .msg('unknownTokenStrategy')
        .throw();
    }

    return fn;
  },

  async make(strategy) {
    return this.getStrategyInterface(strategy).make();
  },

  async decrypt(strategy, secret, code) {
    return this.getStrategyInterface(strategy).decrypt(
      secret,
      code,
    );
  },
};

module.exports = Token;
