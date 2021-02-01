const mongoose = require('mongoose');
const EventEmitter = require('events');
const {
  setIntervalAsync,
  clearIntervalAsync,
} = require('set-interval-async/dynamic');
const { performance } = require('perf_hooks');
const { executeOnAsync } = require('q3-schema-utils');
const SchedulerSchema = require('./schema');
const runner = require('./runner');
const { makePayload } = require('./utils');

const Emitter = new EventEmitter();

const Scheduler = mongoose.model(
  process.env.QUEUING_COLLECTION || 'queues',
  SchedulerSchema,
);

module.exports = {
  __$db: Scheduler,
  clear: clearIntervalAsync,
  on: Emitter.on.bind(Emitter),

  queue: async (name, data) => {
    const job = await Scheduler.add({
      payload: makePayload(data),
      priority: 1,
      name,
    });

    Emitter.emit('queued', name);
    return job;
  },

  seed: async (directory) =>
    executeOnAsync(
      runner(directory).walk(),
      async (name) => {
        if (await Scheduler.isUnique(name))
          await Scheduler.add({
            name,
          });
      },
    ),

  start: (directory, interval = 1000) => {
    const { execute } = runner(directory);
    const adjustedInterval = Math.max(interval, 10);

    return setIntervalAsync(async () => {
      const start = performance.now();
      const curr = await Scheduler.getQueued();

      const emitTo = (name) => {
        Emitter.emit(name, curr.name);
      };

      try {
        if (curr) {
          emitTo('start');
          await execute(curr);
          emitTo('finish');
          await Scheduler.finish(
            curr.set('duration', performance.now() - start),
          );
        }
      } catch (e) {
        emitTo('stall');
        await Scheduler.stall(curr, e);
      }
    }, adjustedInterval);
  },
};
