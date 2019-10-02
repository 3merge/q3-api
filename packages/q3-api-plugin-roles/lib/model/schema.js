const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { Schema } = require('mongoose');
const { invoke } = require('lodash');

const PermissionModel = new Schema(
  {
    op: {
      type: String,
      required: true,
      enum: ['Create', 'Read', 'Update', 'Delete'],
    },
    ownership: {
      type: String,
      default: 'Own',
      enum: ['Any', 'Own', 'Shared'],
    },
    coll: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    fields: {
      type: String,
    },
  },
  {
    timestamps: true,
    ownership: true,
  },
);

// eslint-disable-next-line
PermissionModel.pre('save', async function() {
  const { role, op, coll } = this;
  const doc = await invoke(this, 'constructor.findOne', {
    coll,
    op,
    role,
  });

  if (doc)
    throw new Errors.ConflictError(
      Q3.translate('messages:duplicatePermission'),
    );
});

module.exports = PermissionModel;
