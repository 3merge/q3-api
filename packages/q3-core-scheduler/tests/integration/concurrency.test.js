const mongoose = require('mongoose');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Scheduler', () => {
  it('should run only once', async (done) => {
    single.mockReset();

    const timers = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        Scheduler.start(__dirname, 10),
      ),
    );

    await Scheduler.queue('onSingle');

    setTimeout(() => {
      expect(single).toHaveBeenCalledTimes(1);
      timers.forEach(clearInterval);
      done();
    }, 150);
  });
});
