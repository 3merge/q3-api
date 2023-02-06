const mongoose = require('mongoose');
const EventEmitter = require('events');
const session = require('q3-core-session');
const cron = require('node-cron');
const { performance } = require('perf_hooks');
const { executeOnAsync } = require('q3-schema-utils');
const { invoke } = require('lodash');
const SchedulerSchema = require('./schema');
const runner = require('./runner');
const {
  makePayload,
  getQueueCollectionName,
} = require('./utils');

const Emitter = new EventEmitter();

const Scheduler = mongoose.model(
  getQueueCollectionName(),
  SchedulerSchema,
);

module.exports = {
  __$db: Scheduler,
  on: Emitter.on.bind(Emitter),

  queue: async (name, data, priority = 1) => {
    const job = await Scheduler.add({
      tenant: session.get('TENANT'),
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
        invoke(primary, 'stop');

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

        invoke(primary, 'start');
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
