const Q3 = require('q3-api').default;
const { Errors } = require('q3-api');
const { Schema } = require('mongoose');
const { invoke } = require('lodash');
const { OP_ENUM, OWNERSHIP_ENUM } = require('../constants');

const PermissionModel = new Schema(
  {
    op: {
      type: String,
      required: true,
      enum: OP_ENUM,
    },
    ownership: {
      type: String,
      default: 'Own',
      enum: OWNERSHIP_ENUM,
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
  const { role, op, coll, isNew } = this;
  const doc = await invoke(this, 'constructor.findOne', {
    coll,
    op,
    role,
  });

  if (doc && isNew)
    throw new Errors.ConflictError(
      Q3.translate('messages:duplicatePermission'),
    );
});

module.exports = PermissionModel;
