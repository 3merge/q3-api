const mongoose = require('mongoose');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');
const recurring = require('./chores/onRecurring@minutely');
const {
  DONE,
  STALLED,
  QUEUED,
} = require('../../lib/constants');

const wait = (fn) =>
  setTimeout(() => {
    fn();
  }, 650);

const expectFromScheduler = async (props) =>
  expect(await Scheduler.__$db.find(props)).not.toBeNull();

const expectSingle = (status, next) =>
  setTimeout(async () => {
    await expectFromScheduler({
      name: 'onSingle',
      status,
    });

    next();
  });

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(async () => {
  await Scheduler.start(__dirname, 500);
});

afterEach(() => {
  Scheduler.stop();
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Scheduler', () => {
  it('should walk fixtures directory', async (done) => {
    expect(single).not.toHaveBeenCalled();
    expect(recurring).toHaveBeenCalled();

    setTimeout(async () => {
      await expectFromScheduler({
        name: 'onRecurring@minutely',
        status: DONE,
      });

      await expectFromScheduler({
        name: 'onRecurring@minutely',
        status: QUEUED,
        due: {
          $gt: new Date(),
        },
      });

      done();
    });
  });

  it('should call on chore', async (done) => {
    const payload = { name: 'Mike' };
    await Scheduler.queue('onSingle', payload);

    // could not get fake timers to work
    // so we'll run after the configured interval
    await wait(async () => {
      expect(single).toHaveBeenCalledWith(payload);
      expectSingle(DONE, done);
    });
  });

  it('should stall jobs that error', async (done) => {
    single.mockImplementation(() => {
      throw new Error('Oops!');
    });

    await Scheduler.queue('onSingle');
    await wait(async () => {
      expectSingle(STALLED, done);
    });
  });
});
