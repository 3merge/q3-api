const mongoose = require('mongoose');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');
const {
  DONE,
  STALLED,
  QUEUED,
} = require('../../lib/constants');

let timer;

const callQueue = (next) =>
  Scheduler.queue('onSingle').then(
    () =>
      new Promise((done) => {
        setTimeout(async () => {
          await next();
          done();
        }, 20);
      }),
  );

const expectFromScheduler = async (props) =>
  expect(
    await Scheduler.__$db.findOne(props),
  ).not.toBeNull();

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(async () => {
  timer = await Scheduler.start(__dirname, 1);
});

afterEach(async () => {
  clearInterval(timer);
  await Scheduler.__$db.deleteMany({});
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Scheduler', () => {
  it('should walk fixtures directory', async (done) => {
    const name = 'onRecurring@minutely';
    await Scheduler.seed(__dirname);

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

  it('should call on chore', async () => {
    const payload = { name: 'Mike' };

    single.mockImplementation((d) => {
      expect(d).toHaveProperty('payload', payload);
    });

    callQueue(() =>
      expectFromScheduler({
        name: 'onSingle',
        status: DONE,
        duration: {
          $gt: 0.5,
        },
      }),
    );
  });

  it('should stall jobs that error', async () => {
    const err = new Error('Oops!');

    single.mockImplementation(() => {
      throw err;
    });

    callQueue(() =>
      expectFromScheduler({
        status: STALLED,
        error: 'Oops!',
      }),
    );
  });
});
