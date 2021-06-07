const moment = require('moment');

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
};
