jest.setTimeout(60000);

/* global wait */
const mongoose = require('mongoose');
const moment = require('moment');
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
  it('should walk fixtures directory', async () => {
    const name = 'onRecurring@minutely';
    await Scheduler.seed(__dirname);
    await Scheduler.start(__dirname);

    return wait(async () => {
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
  });

  it('should call on chore', async () => {
    const payload = { name: 'Mike' };
    single.mockImplementation((d) => {
      expect(d).toHaveProperty('name', payload.name);
      return {};
    });

    await Scheduler.queue('onSingle', payload);
    await Scheduler.start(__dirname);

    return wait(() =>
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
    single.mockImplementation(() => {
      throw new Error('Oops!');
    });

    await Scheduler.queue('onSingle');
    await Scheduler.start(__dirname);

    return wait(() => {
      expectFromScheduler({
        status: STALLED,
        error: 'Oops!',
      });
    }, 50);
  });

  it('should re-start jobs', async () => {
    const { _id } = await Scheduler.__$db.create({
      name: 'staller',
      status: 'Queued',
      due: moment().subtract(30, 'minute').toDate(),
    });

    await Scheduler.start(__dirname);

    return wait(() =>
      expect(
        Scheduler.__$db.findById(_id),
      ).resolves.toHaveProperty('status', 'Stalled'),
    );
  });
});
