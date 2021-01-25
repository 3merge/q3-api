const mongoose = require('mongoose');
const EventEmitter = require('events');
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
  on: Emitter.on.bind(Emitter),

  queue: async (name, data) => {
    const job = await Scheduler.add({
      payload: makePayload(data),
      priority: 1,
      name,
    });

    Emitter.emit('queued', job.name);
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
    const Ticker = new EventEmitter();
    const { execute } = runner(directory);
    const tick = 'tick';

    let inProgress;

    Ticker.on(tick, async () => {
      const curr = await Scheduler.getQueued();

      const emitTo = (name) =>
        Emitter.emit(name, curr.name);

      try {
        if (curr) {
          emitTo('start');
          await execute(curr);
          emitTo('finish');
          await Scheduler.finish(curr);
        }
      } catch (e) {
        emitTo('stall');
        await Scheduler.stall(curr, e);
      } finally {
        inProgress = false;
      }
    });

    return setInterval(() => {
      if (!inProgress) {
        Ticker.emit(tick);
        inProgress = true;
      }
    }, interval);
  },
};
