/* eslint-disable func-names, no-console  */
const cron = require('node-cron');
const mongoose = require('mongoose');
const { executeOnAsync } = require('q3-schema-utils');
const Emitter = require('../emitter');
const Logger = require('../logger');

const Schema = new mongoose.Schema(
  {
    // useful for if the task is linked to a document/sub-document
    ref: mongoose.Schema.Types.ObjectId,
    event: {
      type: String,
      required: true,
    },
    interval: {
      type: String,
      default: '* * * * *',
    },
    running: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false,
  },
);

const makeTask = ({ interval, event }) => {
  if (!cron.validate(interval))
    throw new Error('Interval value is invalid');

  return cron.schedule(interval, () => Emitter.emit(event));
};

const startTask = async (doc) => {
  try {
    makeTask(doc);
    await Logger.accept(doc);
    await doc.run();
  } catch (e) {
    await Logger.reject(doc);
  }
};

Schema.path('interval').validate(cron.validate);

Schema.methods.run = async function () {
  if (!this.running)
    await this.set({ running: true }).save();
};

Schema.statics.registerTasks = async function () {
  return executeOnAsync(
    await this.find({ running: false }).exec(),
    startTask,
  );
};

module.exports = Schema;
