const mongoose = require('mongoose');
const Scheduler = require('../../lib');
const single = require('./chores/onSingle');
const recurring = require('./chores/onRecurring@minutely');
const {
  DONE,
  STALLED,
  QUEUED,
} = require('../../lib/constants');

jest.useFakeTimers();

let timer;

const expectFromScheduler = async (props) =>
  expect(await Scheduler.__$db.find(props)).not.toBeNull();

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(async () => {
  timer = await Scheduler.start(__dirname);
});

afterEach(async () => {
  clearInterval(timer);
  await Scheduler.__$db.deleteMany({});
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Scheduler', () => {
  it('should walk fixtures directory', async () => {
    const name = 'onRecurring@minutely';

    recurring.mockImplementation((d) => {
      expect(d).toHaveProperty('name', name);
    });

    await Scheduler.seed(__dirname);
    jest.runOnlyPendingTimers();

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
  });

  it('should call on chore', async () => {
    const payload = { name: 'Mike' };

    single.mockImplementation((d) => {
      expect(d).toHaveProperty('payload', payload);
    });

    await Scheduler.queue('onSingle', payload);
    jest.runOnlyPendingTimers();

    expectFromScheduler({
      name: 'onSingle',
      status: DONE,
    });
  });

  it('should stall jobs that error', async () => {
    const err = new Error('Oops!');

    single.mockImplementation(() => {
      throw err;
    });

    await Scheduler.queue('onSingle');
    jest.runOnlyPendingTimers();

    expectFromScheduler({
      status: STALLED,
      error: 'Oops!',
    });
  });
});
