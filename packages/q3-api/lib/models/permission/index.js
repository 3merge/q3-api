const { Schema } = require('mongoose');
const { invoke } = require('lodash');
const exception = require('../../errors');

const constants = {
  OP_ENUM: ['Create', 'Read', 'Update', 'Delete'],
  OWNERSHIP_ENUM: ['Any', 'Own', 'Shared'],
};

const PermissionModel = new Schema(
  {
    op: {
      type: String,
      required: true,
      enum: constants.OP_ENUM,
    },
    ownership: {
      type: String,
      default: 'Own',
      enum: constants.OWNERSHIP_ENUM,
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
    exception('ConflictError')
      .msg('duplicate')
      .field('coll')
      .field('role')
      .field('op')
      .throw();
});

PermissionModel.constants = constants;
module.exports = PermissionModel;
