jest.mock('node-cron', () => ({
  schedule: jest.fn().mockImplementation((time, fn) => ({
    stop: jest.fn(),
    run: async () => fn(),
  })),
}));

const mongoose = require('mongoose');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');
const recurring = require('./chores/onRecurring@minutely');
const {
  DONE,
  STALLED,
  QUEUED,
} = require('../../lib/constants');

let timer;

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
  // only available via mocking
  timer = await Scheduler.start(__dirname);
});

afterEach(() => {
  Scheduler.stop();
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Scheduler', () => {
  it('should walk fixtures directory', async () => {
    await timer.run();
    expect(single).not.toHaveBeenCalled();
    expect(recurring).toHaveBeenCalled();

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
  });

  it('should call on chore', async (done) => {
    const payload = { name: 'Mike' };
    await Scheduler.queue('onSingle', payload);
    await timer.run();

    expect(single).toHaveBeenCalledWith(payload);
    expectSingle(DONE, done);
  });

  it('should stall jobs that error', async (done) => {
    single.mockImplementation(() => {
      throw new Error('Oops!');
    });

    await Scheduler.queue('onSingle');
    await timer.run();
    expectSingle(STALLED, done);
  });
});
