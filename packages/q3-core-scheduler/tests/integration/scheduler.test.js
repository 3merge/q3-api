const mongoose = require('mongoose');
const cron = require('node-cron');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');
const {
  DONE,
  STALLED,
  QUEUED,
} = require('../../lib/constants');

const expectFromScheduler = async (props) =>
  expect(
    await Scheduler.__$db.findOne(props),
  ).not.toBeNull();

beforeAll(async () => {
  jest
    .spyOn(cron, 'schedule')
    .mockImplementation((rule, fn) => {
      fn();
    });

  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(async () => {
  await Scheduler.__$db.deleteMany({});
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
    await Scheduler.start(__dirname, 10);

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
    await Scheduler.start(__dirname, 10);

    return setTimeout(() => {
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
    await Scheduler.start(__dirname, 10);

    return setTimeout(() => {
      expectFromScheduler({
        status: STALLED,
        error: 'Oops!',
      }).then(() => {
        done();
      });
    }, 50);
  });
});
