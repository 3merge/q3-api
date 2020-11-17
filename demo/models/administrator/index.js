const { Users } = require('q3-api');
const { Schema } = require('mongoose');

const Nested = new Schema({
  sample: String,
});

module.exports = Users.discriminator(
  'administrators',
  new Schema({
    level: String,
    nested: Nested,
  }),
);
