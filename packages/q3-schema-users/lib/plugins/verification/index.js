const methods = require('./methods');
const {
  checkTotalVerificationState,
  initVerificationSubDocuments,
} = require('./middleware');
const VerificationSchema = require('./schema');

module.exports = (Schema, options) => {
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

  Schema.pre(
    'save',
    function runVerificationSchemaAutomation() {
      Object.assign(this.$locals, options);
      initVerificationSubDocuments.call(this);
      checkTotalVerificationState.call(this);
    },
  );

  return Schema;
};
