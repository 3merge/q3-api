/* eslint-disable func-names */
const mongoose = require('mongoose');
const micromatch = require('micromatch');
const { get } = require('lodash');
const { exception } = require('q3-core-responder');

const { Schema } = mongoose;

const constants = {
  OP_ENUM: ['Create', 'Read', 'Update', 'Delete'],
  OWNERSHIP_ENUM: ['Any', 'Own'],
};

const Alias = new Schema(
  {
    local: {
      type: String,
      requied: true,
    },
    foreign: {
      type: String,
      requied: true,
    },
  },
  {
    disableOwnership: true,
    disableArchive: true,
  },
);

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
    ownershipAliases: {
      type: [Alias],
      default: [],
    },
    condition: {
      type: String,
    },
    coll: {
      type: String,
      required: true,
      searchable: true,
    },
    role: {
      type: String,
      default: 'Public',
    },
    fields: {
      type: String,
      default: '*',
      searchable: true,
    },
  },
  {
    restify: 'post get patch delete',
    collectionPluralName: 'permissions',
    collectionSingularName: 'permission',
    timestamps: true,
    enableOwnership: true,
  },
);

PermissionModel.methods.isValid = function() {
  const { coll, op, fields = '' } = this;
  const Ref = get(mongoose, `models.${coll}`);

  if (!Ref)
    exception('Validation')
      .msg('unknownCollection')
      .field('coll')
      .throw();

  if (
    op === 'Create' &&
    !micromatch.every(
      Ref.getRequiredFields(),
      fields.split(',').map((i) => i.trim()),
    )
  )
    exception('Validation')
      .msg('fieldPermissions', {
        fields: Ref.getRequiredFields().join(','),
      })
      .field('fields')
      .throw();
};

PermissionModel.pre('save', async function(next) {
  const { role, op, coll, isNew } = this;
  let err;

  try {
    await this.isValid();
  } catch (e) {
    err = e;
  }

  const doc = await this.constructor
    .findOne({
      coll,
      op,
      role,
    })
    .lean()
    .exec();

  if (doc && isNew)
    err = exception('Conflict')
      .msg('duplicate')
      .field('coll')
      .field('role')
      .field('op')
      .boomerang();

  next(err);
});

PermissionModel.constants = constants;
module.exports = PermissionModel;
