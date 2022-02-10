const { Schema } = require('mongoose');

const BaseUserModel = new Schema(
  {
    // otherwise only bearer strategy works
    // and that requires more legwork
    enableServerToServer: {
      type: Boolean,
      default: false,
      required: true,
    },
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
      default: 'en',
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
    tel: Schema.Types.Tel,
    birthday: Date,
    occupation: String,
    theme: String,
    timezone: String,
    tenant: String,
    countryOfResidence: String,
  },
  {
    withUploads: true,
    withVirtuals: true,
    withVersioning: true,
    withNotes: true,
  },
);

module.exports = BaseUserModel;
