const { Schema } = require('mongoose');
const { refreshAwsLinks } = require('q3-api/lib/helpers');
const mongooseLeanGetters = require('mongoose-lean-getters');
const { get, set } = require('lodash');

module.exports = (s) => {
  const Comment = new Schema(
    {
      message: {
        get(v) {
          return this.removed
            ? undefined
            : refreshAwsLinks(v);
        },
        type: String,
      },
      replies: Schema.Types.ObjectId,
      removed: {
        type: Boolean,
        default: false,
      },
    },
    {
      enableOwnership: true,
    },
  );

  // eslint-disable-next-line
  const forceLean = function () {
    if (get(this, '_mongooseOptions.lean')) {
      set(this, '_mongooseOptions.lean.getters', true);
    }
  };

  s.pre('find', forceLean);
  s.pre('findOne', forceLean);

  s.add({ comments: [Comment] });
  s.plugin(mongooseLeanGetters);
  return s;
};
