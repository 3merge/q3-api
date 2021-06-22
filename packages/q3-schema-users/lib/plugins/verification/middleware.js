/* eslint-disable func-names */
const { every, get } = require('lodash');
const { STRATEGIES } = require('./constants');

exports.checkTotalVerificationState = function () {
  this.isVerified = every(
    this.verification,
    (verification) =>
      get(this, `$locals.${verification.strategy}.enforce`)
        ? verification.state
        : true,
  );

  this.isVerifiedFully = every(
    this.verification,
    (verification) => verification.state,
  );
};

exports.initVerificationSubDocuments = function () {
  if (this.isNew)
    STRATEGIES.forEach((item) => {
      if (get(this, `$locals.${item}.enable`))
        this.addVerificationStrategy(item);
    });
};
