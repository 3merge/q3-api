const mongoose = require('mongoose');
const {
  clearIntervalAsync,
} = require('set-interval-async/dynamic');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');
const {
  DONE,
  STALLED,
  QUEUED,
} = require('../../lib/constants');

let timer;

const expectFromScheduler = async (props) =>
  expect(
    await Scheduler.__$db.findOne(props),
  ).not.toBeNull();

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(async () => {
  await Scheduler.__$db.deleteMany({});
});

afterEach(async () => {
  clearIntervalAsync(timer);
});

afterAll(() => {
  setTimeout(() => {
    mongoose.disconnect();
  }, 1000);
});

describe('Scheduler', () => {
  it('should walk fixtures directory', async (done) => {
    const name = 'onRecurring@minutely';
    await Scheduler.seed(__dirname);
    timer = await Scheduler.start(__dirname, 10);

    setTimeout(async () => {
      await expectFromScheduler({
        name,
        status: DONE,
      });

      await expectFromScheduler({
        name,
        status: QUEUED,
        due: {
          $gt: new Date(),
        },
      });

      done();
    }, 50);
  });

  it('should call on chore', async (done) => {
    const payload = { name: 'Mike' };
    single.mockImplementation((d) => {
      expect(d).toHaveProperty('name', payload.name);
      return {};
    });

    await Scheduler.queue('onSingle', payload);
    timer = await Scheduler.start(__dirname, 10);

    return setTimeout(() => {
      Scheduler.clear(timer);
      expectFromScheduler({
        name: 'onSingle',
        status: DONE,
        duration: {
          $gt: 0.5,
        },
      }).then(() => {
        done();
      });
    }, 50);
  });

  it('should stall jobs that error', async (done) => {
    single.mockImplementation(() => {
      throw new Error('Oops!');
    });

    await Scheduler.queue('onSingle');
    timer = await Scheduler.start(__dirname, 10);

    return setTimeout(() => {
      Scheduler.clear(timer);
      expectFromScheduler({
        status: STALLED,
        error: 'Oops!',
      }).then(() => {
        done();
      });
    }, 50);
  });
});
