const mongoose = require('mongoose');
const Emitter = require('./emitter');

const { Schema } = mongoose;

const REJECTED = 'Reject';
const ACCEPTED = 'Accepted';
const FAILED = 'Failed';
const FINISHED = 'Finished';

const LoggerSchema = new Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    event: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [REJECTED, ACCEPTED, FAILED, FINISHED],
      required: true,
    },
  },
  {
    timestamps: true,
    capped: { max: 1000 },
  },
);

const LoggerModel = mongoose.model(
  'q3-task-scheduler-logs',
  LoggerSchema,
);

const addToLogger = (status) => ({ event, ...rest }) => {
  if (process.env.DEBUG)
    // eslint-disable-next-line
    console.log(`SCHEDULER says, "${event} has ${status}"`);

  return LoggerModel.create({
    ...rest,
    status,
    event,
  });
};

const accept = addToLogger(ACCEPTED);
const reject = addToLogger(REJECTED);
const finish = addToLogger(FINISHED);
const fail = addToLogger(FINISHED);

module.exports = {
  LoggerModel,

  accept,
  reject,
  finish,
  fail,

  onEventAsync: (event, eventHandler) =>
    Emitter.on(event, async (...params) => {
      try {
        await eventHandler(...params);
        await finish({ event });
      } catch (e) {
        await fail({ event });
      }
    }),
};
