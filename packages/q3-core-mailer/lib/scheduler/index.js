const cron = require('node-cron');
const mongoose = require('mongoose');
const SchedulerSchema = require('./schema');

const Scheduler = mongoose.model(
  'q3-task-scheduler',
  SchedulerSchema,
);

module.exports = {
  $model: Scheduler,

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

  init: () =>
    // look for new tasks every minute
    cron.schedule(
      '* * * * *',
      Scheduler.registerTasks.bind(Scheduler),
    ),
};
