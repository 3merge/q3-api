const methods = require('./methods');
const {
  checkTotalVerificationState,
  initVerificationSubDocuments,
} = require('./middleware');
const VerificationSchema = require('./schema');
const { Utils } = require('../../helpers/index');

module.exports = (Schema, options) => {
  function appendPluginOptionsToMiddlewareLocals() {
    Object.assign(
      this.$locals,
      Utils.capitalizeObjectKeys(options),
    );

    initVerificationSubDocuments.call(this);
    checkTotalVerificationState.call(this);
  }

  Schema.add({
    verification: [VerificationSchema],
    isVerified: {
      default: false,
      type: Boolean,
    },
    isVerifiedFully: {
      default: false,
      type: Boolean,
    },
  });

  Schema.loadClass(methods);
  Schema.pre('save', appendPluginOptionsToMiddlewareLocals);

  return Schema;
};
