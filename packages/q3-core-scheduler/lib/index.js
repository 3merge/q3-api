const mongoose = require('mongoose');
const { executeOnAsync } = require('q3-schema-utils');
const SchedulerSchema = require('./schema');
const runner = require('./runner');
const { makePayload } = require('./utils');

let timer;
const Scheduler = mongoose.model('queue', SchedulerSchema);

const continuous = (fn, interval = 30000) => {
  timer = setInterval(async () => fn(), interval);
  return fn();
};

const stop = () => {
  if (timer) clearInterval(timer);
};

const run = async (fn) =>
  executeOnAsync(
    await Scheduler.getQueued(),
    async (res) => {
      try {
        await res.lock();
        await fn(res);
        await res.done();
      } catch (e) {
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

  queue: async (name, data) =>
    Scheduler.add({
      payload: makePayload(data),
      name,
    }),

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
