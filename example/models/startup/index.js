const { Schema } = require('mongoose');

const Vertical = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
    id: true,
  },
);

const Startup = new Schema({
  sector: {
    type: String,
    required: true,
    searchable: true,
  },
  vertical: Vertical,
  friends: {
    type: Schema.Types.ObjectId,
    ref: 'q3-api-users',
    autopopulate: true,
    autopopulateSelect: 'firstName email',
  },
});

module.exports = Startup;
