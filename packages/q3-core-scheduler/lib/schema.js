/* eslint-disable func-names, no-console  */
const mongoose = require('mongoose');
const moment = require('moment');
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
  getMessage,
  getFileName,
} = require('./utils');

const Schema = new mongoose.Schema(
  {
    due: Date,
    completedOn: Date,
    duration: Number,
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

Schema.statics.lookForLockedJobs = async function () {
  return this.updateMany(
    {
      due: {
        $lte: moment().subtract(20, 'minute').toDate(),
      },
      status: QUEUED,
      locked: true,
    },
    {
      $set: {
        status: STALLED,
        locked: false,
      },
      $inc: {
        attempt: 1,
      },
    },
    {
      multi: true,
    },
  );
};

Schema.statics.getQueued = async function () {
  return this.findOneAndUpdate(
    {
      due: { $lt: new Date() },
      status: [QUEUED, STALLED],
      locked: false,
    },
    {
      $set: {
        locked: true,
      },
      $inc: {
        attempt: 1,
      },
    },
    {
      new: true,
      order: {
        priority: 1,
        _id: 1,
      },
    },
  );
};

Schema.statics.finish = async function ({
  _id,
  duration,
  name,
}) {
  await this.updateOne(
    { _id },
    { status: DONE, completedOn: new Date(), duration },
  );

  const due = getNextDate(getInterval(name));

  return due
    ? this.create({
        locked: false,
        priority: 2,
        status: QUEUED,
        name,
        due,
      })
    : null;
};

Schema.statics.stall = async function (
  { _id, attempt = 1 },
  e,
) {
  return this.updateOne(
    { _id },
    {
      locked: false,
      status: getStatus(attempt),
      error: getMessage(e),
      priority: 3,
    },
  );
};

module.exports = Schema;
