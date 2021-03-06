const { Schema } = require('mongoose');

const BaseUserModel = new Schema(
  {
    email: {
      type: Schema.Types.Email,
      required: true,
      searchable: true,
      gram: true,
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
    passwordResetToken: {
      type: String,
      private: true,
    },
    passwordResetTokenIssuedOn: {
      type: Date,
      private: true,
    },
    firstName: {
      type: String,
      required: true,
      searchable: true,
      gram: true,
    },
    lastName: {
      type: String,
      required: true,
      searchable: true,
      gram: true,
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
    lastLoggedIn: Date,
    source: [String],
    filters: Schema.Types.Mixed,
    sorting: Schema.Types.Mixed,
    tours: [String],
  },
  {
    withUploads: true,
    withVirtuals: true,
    withVersioning: true,
    withNotes: true,
  },
);

module.exports = BaseUserModel;
