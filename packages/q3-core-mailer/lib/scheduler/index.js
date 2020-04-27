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
    const exists = await Scheduler.findOne({ event })
      .lean()
      .exec();

    return (
      exists ||
      Scheduler.create({
        event,
        interval,
      })
    );
  },

  remove: (event) =>
    Scheduler.findOneAndDelete({
      event,
    }),

  update: (event, interval) =>
    Scheduler.findOneAndUpdate(
      { event },
      { running: false, interval },
      { new: true },
    ),

  init: () =>
    Scheduler.update({
      running: false,
    })
      .then(() => {
        cron.schedule('* * * * * *', async () => {
          await Scheduler.registerTasks();
        });
      })
      .catch((e) => {
        // eslint-disable-next-line
        console.warn('Scheduler could not start', e);
      }),
};
