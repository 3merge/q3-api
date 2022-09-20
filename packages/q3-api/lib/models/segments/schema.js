const { Schema } = require('mongoose');

module.exports = new Schema({
  collectionName: {
    type: String,
    required: true,
    dedupe: true,
  },
  entries: [
    {
      folder: {
        type: Boolean,
        default: false,
      },
      folderId: Schema.Types.ObjectId,
      label: {
        type: String,
        required: true,
      },
      value: String,
      visibility: [String],
    },
  ],
});
