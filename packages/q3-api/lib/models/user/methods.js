const moment = require('moment');
const generatePsw = require('generate-password');
const exception = require('../../errors');
const {
  compareWithHash,
  createHash,
  generateRandomSecret,
} = require('./helpers');

const isVerifiedQuery = {
  password: { $exists: true },
  verified: true,
  active: true,
};

module.exports = class UserAuthDecorator {
  get isBlocked() {
    return 5 - this.loginAttempts <= 0;
  }

  get isPermitted() {
    return (
      this.active &&
      this.role &&
      !this.frozen &&
      !this.isBlocked
    );
  }

  get hasExpired() {
    const updatedAt = moment().diff(this.secretIssuedOn);
    const diff = moment.duration(updatedAt);
    return diff.asHours() > 24;
  }

  static async findByApiKey(str = '') {
    if (!str) return null;
    return this.findOne({
      apiKeys: str.slice(6, str.length).trim(),
      ...isVerifiedQuery,
    });
  }

  static async $findOneStrictly(args) {
    const doc = await this.findOne(args);
    if (!doc)
      exception('BadRequest')
        .msg('account')
        .throw();

    return doc;
  }

  static async findByEmail(email) {
    return this.$findOneStrictly({
      active: true,
      email,
    });
  }

  static async findUnverifiedByEmail(email) {
    return this.$findOneStrictly({
      verified: false,
      active: true,
      email,
    });
  }

  static async findUserBySecret(id, secret) {
    return this.$findOneStrictly({
      active: true,
      _id: id,
      secret,
    });
  }

  static async findVerifiedByEmail(email) {
    return this.$findOneStrictly({
      ...isVerifiedQuery,
      email,
    });
  }

  static async findVerifiedById(id) {
    return this.$findOneStrictly({
      ...isVerifiedQuery,
      _id: id,
    });
  }

  async setSecret() {
    this.secret = generateRandomSecret();
    this.secretIssuedOn = new Date();
    return this.save();
  }

  async setPassword(s) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (s && !re.test(s)) {
      exception('Validation')
        .field('password')
        .throw();
    }

    const password =
      s ||
      generatePsw.generate({
        length: 10,
        numbers: true,
        symbols: true,
        uppercase: true,
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
        .msg('password')
        .throw();

    return matches;
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
    this.apiKeys.push(stringify);
    await this.save();
    return stringify;
  }
};
