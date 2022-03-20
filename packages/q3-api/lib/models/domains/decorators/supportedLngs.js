const { size } = require('lodash');
const Schema = require('../schema');

class SupportedLngsHelpers {
  hasChangedLanguage() {
    return (
      (this.isNew || this.isModified('supportedLngs')) &&
      size(this.supportedLngs)
    );
  }
}

Schema.loadClass(SupportedLngsHelpers);

module.exports = SupportedLngsHelpers;
