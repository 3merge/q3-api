const mongoose = require('mongoose');
const EventEmitter = require('events');
const cron = require('node-cron');
const { executeOnAsync } = require('q3-schema-utils');
const SchedulerSchema = require('./schema');
const runner = require('./runner');
const { makePayload } = require('./utils');

let timer;
const Scheduler = mongoose.model('queue', SchedulerSchema);
const Emitter = new EventEmitter();

const emit = (event, { name }) => {
  Emitter.emit(event, name);
};

const stop = () => {
  if (timer) timer.stop();
};

const run = async (fn) =>
  executeOnAsync(
    await Scheduler.getQueued(),
    async (res) => {
      try {
        await res.lock();
        emit('start', res);
        await fn(res);
        emit('finish', res);
        await res.done();
      } catch (e) {
        emit('stall', res);
        await res.stall(e);
      }
    },
  );

const seed = (jobs) =>
  executeOnAsync(jobs, async (name) => {
    if (await Scheduler.isUnique(name))
      await Scheduler.add({
        name,
      });
  });

module.exports = {
  __$db: Scheduler,
  on: Emitter.on.bind(Emitter),

  queue: async (name, data) => {
    const job = await Scheduler.add({
      payload: makePayload(data),
      priority: 1,
      name,
    });

    emit('queued', job);
    return job;
  },

  start: async (directory, interval = '* * * * *') => {
    const { execute, walk } = runner(directory);
    await seed(walk());

    timer = cron.schedule(interval, async () => {
      await run(execute);
    });

    return timer;
  },

  stop,
};
