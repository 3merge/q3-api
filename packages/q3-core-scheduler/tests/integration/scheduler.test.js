// eslint-disable-next-line
require('dotenv').config();

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

const streamToString = (stream) => {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) =>
      chunks.push(Buffer.from(chunk)),
    );
    stream.on('error', (err) => reject(err));
    stream.on('end', () =>
      resolve(Buffer.concat(chunks).toString('utf8')),
    );
  });
};

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
  mongoose.disconnect();
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

  it('should get file', async () => {
    let params;

    single.mockImplementation((...d) => {
      params = d;
    });

    await Scheduler.queue('onSingle', {
      // more of an e2e test because it's relying on this file
      // existing in our AWS test bucket
      buckets: ['queuing/1639542379408/import'],
    });

    await Scheduler.start(__dirname);

    await wait(async () => {
      expect(params).toHaveLength(2);

      const str = await streamToString(params[1].import);
      expect(str.replace(/(\r\n|\n|\r)/gm, ',')).toMatch(
        '8880923480324,989898080923840000,21432432443543500,2132432980432800000,2398903890249800000,90238329804803200,23432432543,23434329848348900,808903284902398000',
      );
    }, 3500);
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
    });
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
