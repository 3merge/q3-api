const { Schema } = require('mongoose');
const methods = require('./methods');

const isValidEmail = (v) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(v).toLowerCase());
};

const BaseUserModel = new Schema(
  {
    email: {
      type: String,
      required: true,
      validate: isValidEmail,
      unique: true,
    },
    secret: {
      type: String,
      required: true,
    },
    secretIssuedOn: {
      type: Date,
      private: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
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
    frozen: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      private: true,
    },
    role: {
      type: String,
      required: true,
    },
    listensTo: [String],
    apiKeys: [
      {
        type: String,
        private: true,
      },
    ],
  },
  {
    uploads: true,
    discriminatorKey: 'kind',
    restify: 'post get patch delete',
    collectionPluralName: 'users',
    collectionSingularName: 'user',
    timestamps: true,
    ownership: true,
    version: true,
  },
);

BaseUserModel.loadClass(methods);

module.exports = BaseUserModel;
