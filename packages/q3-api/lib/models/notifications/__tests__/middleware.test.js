const mongoose = require('mongoose');
const Schema = require('..');
const Counters = require('../../counters');
const { MODEL_NAMES } = require('../../../constants');

let NotificationTests;
const userId = mongoose.Types.ObjectId();

const expectNumberOfNotificationsToBe = async (
  expectedValue,
) => {
  const c = await Counters.find();

  expect(c).toHaveLength(1);
  expect(c[0]).toHaveProperty(
    'notifications',
    expectedValue,
  );
};

jest.mock('../../../config/aws', () =>
  jest.fn().mockReturnValue({
    getPrivate: jest
      .fn()
      .mockImplementation((input) => `AWS_CDN/${input}`),
  }),
);

beforeAll(async () => {
  NotificationTests = mongoose.model(
    MODEL_NAMES.NOTIFICATIONS,
    Schema,
  );

  await mongoose.connect(process.env.CONNECTION);
});

afterEach(async () => {
  await Counters.deleteMany({});
  await NotificationTests.deleteMany({});
});

afterAll(() => {
  mongoose.disconnect();
});

describe('Notifications middleware', () => {
  it('should append url to output', async () => {
    const r = new NotificationTests({
      path: 'testing',
    });

    await r.save();
    const doc = await NotificationTests.findOne({});
    const docs = await NotificationTests.find({})
      .lean()
      .exec();

    expect(doc.url).toMatch('AWS_CDN/testing');
    expect(docs[0].url).toMatch('AWS_CDN/testing');
  });

  it('should mark for incrementing', async () => {
    const r = new NotificationTests({
      userId,
      path: 'testing_new',
    });

    await r.save();
    await expectNumberOfNotificationsToBe(1);
  });

  it('should not marking for incrementing', async () => {
    const r = new NotificationTests({
      path: 'testing_new',
      userId,
    });

    await r.save();
    await expectNumberOfNotificationsToBe(1);

    const r2 = new NotificationTests({
      path: 'testing_new_2',
      userId,
    });

    await r2.save();
    await expectNumberOfNotificationsToBe(2);

    await r.set({ read: true });
    await r.save();
    await expectNumberOfNotificationsToBe(1);

    await r2.set({ archived: true });
    await r2.save();
    await expectNumberOfNotificationsToBe(0);
  });
});
