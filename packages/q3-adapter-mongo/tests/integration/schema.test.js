const AdapterMongo = require('../../lib');

let db;
const fn = jest.fn().mockReturnValue(true);
const preSave = jest.fn();
const postSave = jest.fn();
const preSubSave = jest.fn();

beforeAll(async () => {
  db = AdapterMongo(process.env.CONNECTION);

  db.define({
    name: String,
    subdocs: [
      {
        type: db
          .define({
            name: String,
          })
          .addBeforeSaveHook(preSubSave)
          .out(),
      },
    ],
  })
    .addBeforeSaveHook(preSave)
    .addAfterSaveHook(postSave)
    .addMethod('test', fn)
    .addStatic('test', fn)
    .listen('test', fn)
    .build('tests');

  await db.start();
});

beforeEach(() => {
  fn.mockClear();
});

afterAll(() => {
  db.end();
});

describe('AdapterMongo', () => {
  it('should register static methods', () =>
    expect(db.tests.test()).toBeTruthy());

  it('should listen for events', async () => {
    // eslint-disable-next-line
    const foo = await new db.tests({
      name: 'Foo',
    });

    const params = {
      data: 1,
    };

    foo.dispatch('test', params);
    expect(foo.test()).toBeTruthy();
    expect(fn).toHaveBeenCalledWith(params);
  });

  it('should run middleware', async () => {
    await db.tests.create({
      name: 'Foo',
      subdocs: [
        {
          name: 'Bar',
        },
      ],
    });

    expect(preSubSave).toHaveBeenCalled();
    expect(preSave).toHaveBeenCalled();
    expect(postSave).toHaveBeenCalled();
  });
});
