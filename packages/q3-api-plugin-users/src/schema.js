import unique from 'mongoose-unique-validator';
import { Schema } from 'mongoose';
import methods from './methods';

export const isValidEmail = (v) => {
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
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    frozen: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    apiKeys: [
      {
        type: String,
      },
    ],
  },
  {
    discriminatorKey: 'kind',
    timestamps: true,
    ownership: true,
  },
);

BaseUserModel.loadClass(methods);
BaseUserModel.plugin(unique);

export default BaseUserModel;
