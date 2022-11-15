const Schema = require('./schema');
const Counters = require('../counters');

Schema.post('save', async (doc) => {
  const incrementUserCounter = async (userId) => {
    try {
      await Counters.findOneAndUpdate(
        {
          userId,
        },
        {
          $inc: {
            notifications: 1,
          },
        },
        {
          upsert: true,
        },
      );
    } catch (e) {
      // noop
    }
  };

  await Promise.all(
    [doc]
      .flat()
      .filter(Boolean)
      .map((d) => incrementUserCounter(d.userId)),
  );
});
