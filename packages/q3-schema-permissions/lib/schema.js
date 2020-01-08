const { Schema } = require('mongoose');
const { OP_ENUM, OWNERSHIP_ENUM } = require('./constants');

const Alias = new Schema({
  local: {
    type: String,
    requied: true,
  },
  foreign: {
    type: String,
    requied: true,
  },
});

const PermissionModel = new Schema({
  ownershipAliases: [Alias],
  ownershipConditions: [String],
  documentConditions: [String],
  op: {
    type: String,
    required: true,
    dedupeWith: true,
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
    searchable: true,
    dedupeWith: true,
  },
  role: {
    type: String,
    default: 'Public',
    dedupeWith: true,
  },
  fields: {
    type: String,
    default: '*',
    searchable: true,
  },
});

module.exports = PermissionModel;
