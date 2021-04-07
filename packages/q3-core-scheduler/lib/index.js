const mongoose = require('mongoose');
const EventEmitter = require('events');
const cron = require('node-cron');
const { performance } = require('perf_hooks');
const { executeOnAsync } = require('q3-schema-utils');
const { invoke } = require('lodash');
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

  queue: async (name, data, priority = 1) => {
    const job = await Scheduler.add({
      payload: makePayload(data),
      priority,
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

  start: (directory, maxPrioritySize) => {
    const { execute } = runner(directory);
    const primary = cron.schedule(
      '*/5 * * * * *',
      async () => {
        const start = performance.now();
        const curr = await Scheduler.getQueued(
          maxPrioritySize,
        );

        const emitTo = (name) =>
          Emitter.emit(name, curr.name);

        // potentially been cleared already
        // must be lower down as there's a brief delay
        invoke(primary, 'start');

        try {
          if (curr) {
            emitTo('start');
            await execute(curr);
            emitTo('finish');
            await Scheduler.finish(
              curr.set(
                'duration',
                performance.now() - start,
              ),
            );
          }
        } catch (e) {
          emitTo('stall');
          await Scheduler.stall(curr, e);
        }

        invoke(primary, 'stop');
      },
    );

    const secondary =
      maxPrioritySize === 1
        ? cron.schedule('*/20 * * * *', async () => {
            await Scheduler.lookForLockedJobs();
          })
        : null;

    return {
      stop: () => {
        invoke(primary, 'stop');
        invoke(secondary, 'stop');
      },
    };
  },
};
