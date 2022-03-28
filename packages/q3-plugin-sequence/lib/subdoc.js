const { get } = require('lodash');
const shuffle = require('./shuffle');

module.exports = {
  SubDocumentSequence(Schema) {
    Schema.add({
      seq: Number,
    });
  },

  SubDocumentSequenceParentMiddleware(Schema, subdoc) {
    Schema.pre('validate', function runShuffleFunction() {
      shuffle(get(this, subdoc, []));
    });
  },
};
