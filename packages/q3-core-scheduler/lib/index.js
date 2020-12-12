const mongoose = require('mongoose');
const EventEmitter = require('events');
// eslint-disable-next-line
const { executeOnAsync } = require('q3-schema-utils');
const SchedulerSchema = require('./schema');
const runner = require('./runner');
const { makePayload } = require('./utils');

let timer;
const Scheduler = mongoose.model('queue', SchedulerSchema);
const Emitter = new EventEmitter();

const continuous = (fn, interval = 30000) => {
  timer = setInterval(async () => fn(), interval);
  return fn();
};

const emit = (event, { name }) => {
  Emitter.emit(event, name);
};

const stop = () => {
  if (timer) clearInterval(timer);
};

const run = async (fn) =>
  executeOnAsync(
    await Scheduler.getQueued(),
    async (res) => {
      try {
        emit('start', res);
        await res.lock();
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
      name,
    });

    emit('queued', job);
    return job;
  },

  start: async (directory, backgroundInterval) => {
    const { execute, walk } = runner(directory);
    await seed(walk());
    return continuous(
      async () => run(execute),
      backgroundInterval,
    );
  },

  stop,
};
