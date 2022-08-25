const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    mjml: String,
    name: String,
    variables: Schema.Types.Mixed,
  },
  {
    restify: 'get patch',
    disableChangelog: true,
    timestamps: false,
    collectionSingularName: 'email',
    collectionPluralName: 'emails',
    strict: false,
  },
);
