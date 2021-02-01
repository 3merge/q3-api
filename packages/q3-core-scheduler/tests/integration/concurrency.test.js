const mongoose = require('mongoose');
const {
  clearIntervalAsync,
} = require('set-interval-async/dynamic');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  await Scheduler.__$db.deleteMany({});
});

afterAll(() => {
  setTimeout(() => {
    mongoose.disconnect();
  }, 500);
});

describe('Scheduler', () => {
  it('should run only once', async (done) => {
    single.mockReset();
    single.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve('TEST');
          }, 5),
        ),
    );

    const timers = await Promise.all(
      Array.from({ length: 15 }).map(() =>
        Scheduler.start(__dirname, 10),
      ),
    );

    await Scheduler.queue('onSingle');

    setTimeout(() => {
      timers.forEach(clearIntervalAsync);
      expect(single).toHaveBeenCalledTimes(1);
      done();
    }, 500);
  });
});
