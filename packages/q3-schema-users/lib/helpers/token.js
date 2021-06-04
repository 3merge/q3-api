/*  eslint-disable global-require, import/no-dynamic-require */
const { exception } = require('q3-core-responder');
const { isFunction, get } = require('lodash');

const Token = {
  mms: require('./tokenMMS'),
  sms: require('./tokenSMS'),
  tfa: require('./tokenTFA'),

  getStrategyInterface(strategy) {
    let fn;

    try {
      fn = get(
        require(`./token${String(strategy).toUpperCase()}`),
        strategy,
      );

      if (!isFunction(fn))
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
