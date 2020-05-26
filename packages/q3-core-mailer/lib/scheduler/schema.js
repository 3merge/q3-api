/* eslint-disable func-names, no-console  */
const moment = require('moment');
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
    },
    running: {
      type: Boolean,
      default: false,
    },
    lastRan: {
      type: Date,
    },
  },
  {
    timestamps: false,
  },
);

const hasPassed = (value, date) => {
  const shouldRestart = (increment, qualifier) => {
    return moment().isAfter(
      moment(date).add(increment, qualifier),
    );
  };

  switch (value) {
    case 'annually':
      return shouldRestart(1, 'years');
    case 'biannually':
      return shouldRestart(2, 'quarters');
    case 'quarterly':
      return shouldRestart(1, 'quarters');
    case 'monthly':
      return shouldRestart(1, 'months');
    case 'weekly':
      return shouldRestart(1, 'weeks');
    case 'daily':
      return shouldRestart(1, 'days');
    case 'bihourly':
      return shouldRestart(2, 'hours');
    case 'hourly':
      return shouldRestart(1, 'hours');
    case 'semihourly':
      return shouldRestart(30, 'minutes');
    case 'biminutely':
      return shouldRestart(2, 'minutes');
    case 'minutely':
      return shouldRestart(1, 'minutes');
    default:
      return false;
  }
};

const startTask = async (doc) => {
  try {
    await doc.run();
    await Logger.accept(doc);
  } catch (e) {
    await Logger.reject(doc);
  }
};

Schema.methods.run = async function () {
  if (!hasPassed(this.interval, this.lastRan)) return null;

  return this.set({
    lastRan: moment().toISOString(),
  }).save(() => {
    Emitter.emit(this.event);
  });
};

Schema.statics.registerTasks = async function () {
  return executeOnAsync(
    await this.find().exec(),
    startTask,
  );
};

module.exports = Schema;
