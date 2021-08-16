const moment = require('moment');
const { exception } = require('q3-core-responder');
const {
  compareWithHash,
  createHash,
  generateRandomSecret,
  verifyToken,
  getPassword,
} = require('./helpers');

const isVerifiedQuery = {
  password: { $exists: true },
  verified: true,
  active: true,
};

const SECRET_EXPIRATION_IN_HRS = 120;

const isWithinSecretExpirationHrsWindow = (
  lastUpdatedOnDateStamp,
) => {
  const distanceBetweenLastUpdatedAndToday = moment().diff(
    lastUpdatedOnDateStamp,
  );
  const differenceHelper = moment.duration(
    distanceBetweenLastUpdatedAndToday,
  );

  return (
    differenceHelper.asHours() > SECRET_EXPIRATION_IN_HRS
  );
};

const issueTokensAndStamps = (
  target,
  tokenPropertyName,
  tokenIssuedOnPropertyName,
) =>
  Object.assign(target, {
    [tokenPropertyName]: generateRandomSecret(),
    [tokenIssuedOnPropertyName]: new Date(),
  });

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

  get name() {
    const output = [];
    if (this.firstName) output.push(this.firstName);
    if (this.lastName) output.push(this.lastName);

    return output.join(' ');
  }

  get hasExpired() {
    return isWithinSecretExpirationHrsWindow(
      this.secretIssuedOn,
    );
  }

  get cannotResetPassword() {
    return isWithinSecretExpirationHrsWindow(
      this.passwordResetTokenIssuedOn,
    );
  }

  static async isListeningFor(listens = '') {
    try {
      const users = await this.find({
        listens,
      }).exec();

      return users ? users.map((user) => user.email) : [];
    } catch (e) {
      return [];
    }
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

  static async $findOneStrictly(args, msg = 'account') {
    if (typeof args.email === 'string')
      Object.assign(args, {
        email: args.email.toLowerCase(),
      });

    const doc = await this.findOne(args)
      .select('+apiKeys +uploads')
      .setOptions({
        bypassAuthorization: true,
        skipAutocomplete: true,
      })
      .exec();

    if (!doc) exception('BadRequest').msg(msg).throw();
    return doc;
  }

  static async findByEmail(email) {
    return this.$findOneStrictly({
      active: true,
      email,
    });
  }

  static async findUnverifiedByEmail(email) {
    return this.$findOneStrictly(
      {
        verified: false,
        active: true,
        email,
      },
      'accountVerified',
    );
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

  setSecret() {
    this.apiKeys = [];
    return issueTokensAndStamps(
      this,
      'secret',
      'secretIssuedOn',
    );
  }

  setPasswordResetToken() {
    return issueTokensAndStamps(
      this,
      'passwordResetToken',
      'passwordResetTokenIssuedOn',
    );
  }

  async setPassword(s) {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-._+=!@#$%^&()*])(?=.{8,})/;
    if (s && !re.test(s)) {
      exception('Validation').field('password').throw();
    }

    const password = s || getPassword();

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
