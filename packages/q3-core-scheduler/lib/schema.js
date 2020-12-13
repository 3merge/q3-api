/* eslint-disable func-names, no-console  */
const mongoose = require('mongoose');
const {
  FAILED,
  QUEUED,
  STALLED,
  DONE,
} = require('./constants');
const {
  getNextDate,
  getInterval,
  getStatus,
  stringify,
  getFileName,
} = require('./utils');

const Schema = new mongoose.Schema(
  {
    due: Date,
    status: {
      type: String,
      enum: [FAILED, QUEUED, STALLED, DONE],
      default: QUEUED,
    },
    priority: {
      type: Number,
      default: 1,
    },
    attempt: {
      type: Number,
      default: 0,
    },
    name: String,
    locked: {
      type: Boolean,
      default: false,
    },
    error: String,
    payload: String,
  },
  {
    capped: {
      max: 1000,
    },
  },
);

Schema.statics.add = async function (props = {}) {
  const { name, ...rest } = props;
  return this.create({
    name: getFileName(name),
    locked: false,
    status: QUEUED,
    due: new Date(),
    priority: 2,
    ...rest,
  });
};

Schema.statics.isUnique = async function (name) {
  return !(await this.findOne({
    status: { $nin: [DONE, FAILED] },
    name: getFileName(name),
  })
    .lean()
    .exec());
};

Schema.statics.getQueued = async function () {
  return this.find({
    due: { $lt: new Date() },
    status: [QUEUED, STALLED],
    locked: false,
  })
    .limit(3)
    .sort({
      priority: 1,
      createdAt: 1,
    })
    .exec();
};

Schema.methods.stall = async function (e) {
  const attempt = this.attempt + 1;

  return this.update({
    status: getStatus(attempt),
    error: stringify(e),
    locked: false,
    priority: 3,
    attempt,
  });
};

Schema.methods.lock = async function () {
  return this.update({ locked: true });
};

Schema.methods.done = async function () {
  await this.update({ status: DONE });
  const due = getNextDate(getInterval(this.name));

  return due
    ? this.constructor.create({
        name: this.name,
        locked: false,
        priority: 2,
        status: QUEUED,
        due,
      })
    : null;
};

module.exports = Schema;
