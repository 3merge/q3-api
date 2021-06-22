const { exception } = require('q3-core-responder');
const { find, upperCase } = require('lodash');
const Token = require('../../helpers/token');

class UserVerification {
  addVerificationStrategy(strategy) {
    if (!Array.isArray(this.verification))
      this.verification = [];

    if (!this.getVerificationSubDocByStrategyName(strategy))
      this.verification.push({
        state: false,
        strategy,
      });
  }

  getVerificationSubDocByStrategyName(strategy) {
    return find(
      this.verification,
      (v) => v.strategy === upperCase(strategy),
    );
  }

  getVerificationSubDocByStrategyNameStrictly(strategy) {
    const item =
      this.getVerificationSubDocByStrategyName(strategy);

    if (!item)
      exception('BadRequest')
        .msg('verificationStrategyNotInitialized')
        .throw();

    if (item.state)
      exception('BadRequest')
        .msg('verificationStrategyAlreadyVerified')
        .throw();

    return item;
  }

  async initVerificationSequence(strategy) {
    const item =
      this.getVerificationSubDocByStrategyNameStrictly(
        strategy,
      );

    const { code, secret } = await Token.make(strategy);
    item.secret = secret;

    await this.save();
    return code;
  }

  async verifyStrategyWithCode(strategy, code) {
    const item =
      this.getVerificationSubDocByStrategyNameStrictly(
        strategy,
      );

    if (!(await Token.decrypt(strategy, item.secret, code)))
      exception('Validation')
        .msg('incorrectOrExpiredVerificationCode')
        .throw();

    item.state = true;
    await this.save();
  }
}

module.exports = UserVerification;
