const { executeOnAsync } = require('q3-schema-utils');

module.exports = class Mixins {
  static async startIdleJobs(dir, fn) {
    const current = new Date();

    const jobs = this.find({
      runsNext: {
        $lt: current,
      },
    }).exec();

    return executeOnAsync(jobs, async (doc) => {
      try {
        if (fn)
          fn(null, {
            done: false,
            ...doc,
          });

        await doc
          .set({
            lastRun: current,
            runsNext: '',
          })
          .save();

        // SPAWN

        if (fn)
          fn(null, {
            done: true,
            ...doc,
          });
      } catch (e) {
        fn(e, doc);
      }
    });
  }
};
