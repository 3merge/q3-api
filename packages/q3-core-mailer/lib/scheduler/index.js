/**
 * A job is an interval-based child process in a Q3 application. Developers register them in the file system by adding scripts to the jobs directory, labelled with a known qualifier like “daily” or “weekly”. The system schedules the job to run accordingly, logging all failed and successful attempts to the database.
 * @module Jobs
 * @example
 * // sample application structure
 * // use the walker helper to auto-assign jobs
 * lib
 * |- index.js
 * |- jobs
 * |-- onFoo@minutely.js
 * |-- onFoo@minutely.js
 * |-- onFoo@minutely.js
 */
const cron = require('node-cron');
const mongoose = require('mongoose');
const SchedulerSchema = require('./schema');

const Scheduler = mongoose.model(
  'q3-task-scheduler',
  SchedulerSchema,
);

module.exports = {
  $model: Scheduler,

  /**
   * Add a new job to the scheduler. If the event exists, the interval updates.
   * @param {string} event - The name of the event
   * @param {string} interval - How often the event should run
   * @example
   const { Scheduler } = require('q3-core-mailer');

   async function addtoScheduler() {
      await Scheduler.add('onFooBar', 'minutely');
   }
   */
  add: async (event, interval) => {
    const exists = await Scheduler.findOne({
      event,
    }).exec();

    return exists
      ? exists.set({ interval }).save()
      : Scheduler.create({
          event,
          interval,
        });
  },

  remove: (event) =>
    Scheduler.findOneAndDelete({
      event,
    }),

  update: (event, interval) =>
    Scheduler.findOneAndUpdate(
      { event },
      { interval },
      { new: true },
    ),

  init: async () => {
    await Scheduler.registerTasks();

    // look for new tasks every minute
    return cron.schedule(
      '* * * * *',
      Scheduler.registerTasks.bind(Scheduler),
    );
  },
};
