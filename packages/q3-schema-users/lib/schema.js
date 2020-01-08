const { Schema } = require('mongoose');

const BaseUserModel = new Schema({
  email: {
    type: Schema.Types.Email,
    required: true,
    unique: true,
    sparse: true,
    searchable: true,
    dedupe: true,
  },
  secret: {
    type: String,
    select: false,
    private: true,
  },
  secretIssuedOn: {
    type: Date,
    private: true,
  },
  firstName: {
    type: String,
    required: true,
    searchable: true,
  },
  lastName: {
    type: String,
    required: true,
    searchable: true,
  },
  lang: {
    type: String,
    default: 'en-CA',
    enum: ['en-CA', 'fr-CA'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  verified: {
    type: Boolean,
    default: false,
    private: true,
  },
  loginAttempts: {
    type: Number,
    default: 0,
    private: true,
  },
  listens: [String],
  frozen: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    required: true,
    searchable: true,
  },
  password: {
    type: String,
    private: true,
  },
  apiKeys: {
    type: [String],
    select: false,
    private: true,
  },
});

module.exports = BaseUserModel;
