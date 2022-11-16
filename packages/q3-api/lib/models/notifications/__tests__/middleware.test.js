const mongoose = require('mongoose');
const Schema = require('..');

let NotificationTests;

jest.mock('../../../config/aws', () =>
  jest.fn().mockReturnValue({
    getPrivate: jest
      .fn()
      .mockImplementation((input) => `AWS_CDN/${input}`),
  }),
);

beforeAll(async () => {
  NotificationTests = mongoose.model(
    'notification-tests',
    Schema,
  );

  await mongoose.connect(process.env.CONNECTION);
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
      path: 'testing_new',
    });

    await r.save();
    expect(r.$locals.shouldIncrement).toBeTruthy();
    expect(r.$locals.didIncrement).toBeTruthy();
  });

  it('should not marking for incrementing', async () => {
    const r = new NotificationTests({
      path: 'testing_new',
    });

    await r.save();
    await r.set({
      read: true,
    });

    await r.save();
    expect(r.$locals.shouldIncrement).toBeFalsy();
    expect(r.$locals.didIncrement).toBeFalsy();

    await r.set({
      read: false,
    });

    await r.save();
    expect(r.$locals.shouldIncrement).toBeTruthy();
    expect(r.$locals.didIncrement).toBeTruthy();
  });
});
