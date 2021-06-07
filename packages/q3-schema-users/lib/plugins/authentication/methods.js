const moment = require('moment');
const { exception } = require('q3-core-responder');
const jwt = require('jsonwebtoken');
const generatePsw = require('generate-password');
const {
  compareWithHash,
  createHash,
  generateRandomSecret,
  verifyToken,
} = require('../../helpers');

module.exports = class UserAuthDecorator {
  __$generateTokenAndDate(
    tokenPropertyName,
    tokenIssuedOnPropertyName,
  ) {
    const token = generateRandomSecret();

    Object.assign(this, {
      [tokenPropertyName]: token,
      [tokenIssuedOnPropertyName]: new Date(),
    });

    return token;
  }

  static async issueBearerTokens(audience) {
    const secret = process.env.SECRET;
    const nonce = generateRandomSecret(16);
    const token = await jwt.sign(
      { nonce, id: this._id, code: this.secret },
      secret,
      { audience },
    );

    return {
      token,
      nonce,
    };
  }

  static async issuePasswordResetToken(email) {
    const user = await this.constructor.findByEmail(email);
    const token = user.__$generateTokenAndDate(
      'passwordResetToken',
      'passwordResetTokenIssuedOn',
    );

    await user.save();
    return token;
  }

  static async login(email, password, { host, useragent }) {
    const user = await this.constructor.findByEmail(email);
    await user.verifyPassword(password, true);

    if (useragent) console.log('save new device.');

    return !user.isTwoFactor()
      ? user.issueBearerTokens(host)
      : {
          tfa: true,
        };
  }

  static async findByApiKey(str = '') {
    if (!str) return null;
    return this.findOne({
      apiKeys: str.trim(),
      active: true,
    })
      .setOptions({ bypassAuthorization: true })
      .select('+apiKeys +uploads')
      .exec();
  }

  static async findbyBearerToken(...args) {
    return verifyToken.apply(this, args);
  }

  static async findByEmail(email) {
    const user = await this.findOne({
      active: true,
      email,
    })
      .select('+apiKeys +uploads')
      .setOptions({
        bypassAuthorization: true,
        skipAutocomplete: true,
      })
      .exec();

    if (!user)
      exception('BadRequest').msg('account').throw();

    return user;
  }

  setSecret() {
    this.apiKeys = [];
    return this.__$generateTokenAndDate(
      'secret',
      'secretIssuedOn',
    );
  }

  async setPassword(s) {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-._+=!@#$%^&()*])(?=.{8,})/;
    if (s && !re.test(s)) {
      exception('Validation').field('password').throw();
    }

    const password =
      s ||
      generatePsw.generate({
        length: 20,
        numbers: true,
        symbols: true,
        uppercase: true,
        excludeSimilarCharacters: true,
        exclude: ' ;:+=-(),\'".^{}[]<>/\\|_~',
        strict: true,
      });

    this.set({
      password: await createHash(password),
      loginAttempts: 0,
      verified: true,
    });

    await this.save();
    return password;
  }

  async verifyPassword(password, strict = false) {
    const matches = compareWithHash(
      password,
      this.password,
    );

    this.isNew = false;
    this.loginAttempts = !matches
      ? Number(this.loginAttempts || 0) + 1
      : 0;

    await this.save();
    if (!matches && strict)
      exception('Authentication')
        .msg('credentials')
        .field({
          name: 'password',
          msg: 'incorrectPassword',
          value: password,
        })
        .throw();

    return matches;
  }

  async changePasswordWithPreviousPassword(psw) {
    await this.verifyPassword(psw, true);
  }

  async changePasswordWithPasswordResetToken() {
    if (this.cannotResetPassword)
      exception('Gone')
        .msg('expired')
        .field('passwordResetToken')
        .throw();
  }

  async changePassword(
    previousPassword,
    passwordResetToken,
    newPassword,
  ) {

    if (await this.verifyPassword(newPassword))
      exception('Validation')
        .msg('passwordHasBeenUsedBefore')
        .field('newPassword')
        .throw();

    await this.setPassword(newPassword);
    await this.setSecret();
    return this.save();
  }

  async deactivate() {
    this.set({
      verified: false,
      active: false,
      secret: null,
      password: null,
    });

    await this.save();
  }

  obfuscatePrivateFields() {
    const obj = this.toJSON();
    delete obj.password;
    delete obj.secret;
    obj.apiKeys = obj.apiKeys.map((v) => {
      let masked = '';
      const maskedLen = v.length - 4;
      for (let i = 0; i < maskedLen; i += 1) {
        masked += '*';
      }

      return masked + v.slice(maskedLen);
    });

    return obj;
  }

  async generateApiKey() {
    const key = generateRandomSecret();
    const stringify = `${String(this._id).substring(
      0,
      7,
    )}-${key}-${moment(new Date()).unix()}`;
    if (this.apiKeys) {
      this.apiKeys.push(stringify);
    } else {
      this.apiKeys = [stringify];
    }

    await this.save();
    return stringify;
  }
};
