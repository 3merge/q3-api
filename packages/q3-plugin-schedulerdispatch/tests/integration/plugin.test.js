jest.setTimeout(30000);

const { compact } = require('lodash');
const mongoose = require('mongoose');
const { queue } = require('q3-core-scheduler');
const { plugin } = require('../../lib');

jest.mock('q3-core-scheduler', () => ({
  queue: jest.fn(),
}));

let int = 0;

const setup = (
  parentPluginOptions = [],
  childrenPluginOptions = [],
) => {
  const ChildSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    isOther: Boolean,
  });

  const Schema = new mongoose.Schema({
    name: String,
    age: Number,
    bio: String,
    sub: [ChildSchema],
  });

  Schema.plugin(
    plugin,
    compact(
      [childrenPluginOptions, parentPluginOptions].flat(),
    ),
  );

  // eslint-disable-next-line
  int++;
  return mongoose.model(`notification-test-${int}`, Schema);
};

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(() => {
  queue.mockClear();
});

afterAll(() => {
  mongoose.disconnect();
});

describe('plugin', () => {
  it('should notify on new', async () => {
    const Model = setup({
      name: 'onTestNew',
      when: {
        new: true,
      },
    });
    const { _id } = await Model.create({
      name: 'New',
    });

    await global.wait(() => {
      expect(queue).toHaveBeenCalledTimes(1);
      expect(queue).toHaveBeenCalledWith(
        'onTestNew',
        expect.objectContaining({
          documentId: _id,
          subDocumentId: null,
        }),
        1,
        0,
      );
    }, [1000]);
  });

  it('should run custom function', async () => {
    const Model = setup({
      name: 'onTestNew',
      test: ({ name }) => name === 'New',
      when: {
        new: true,
      },
    });

    const { _id } = await Model.create({
      name: 'New',
    });

    await global.wait(() => {
      expect(queue).toHaveBeenCalledTimes(1);
      expect(queue).toHaveBeenCalledWith(
        'onTestNew',
        expect.objectContaining({
          documentId: _id,
          subDocumentId: null,
        }),
        1,
        0,
      );
    }, [1000]);
  });

  it('should notify on change', async () => {
    const Model = setup([
      {
        name: 'onTestChange',
        test: {
          operand: '$and',
          expressions: ['age>22'],
        },
        when: {
          new: false,
          modified: ['age'],
        },
      },
    ]);

    const doc = await Model.create({
      name: 'New',
      age: 21,
    });

    await doc.set('age', 23).save();
    await global.wait(() => {
      // parent newness and mod
      expect(queue).toHaveBeenCalledTimes(1);
      expect(queue).toHaveBeenCalledWith(
        'onTestChange',
        expect.objectContaining({
          documentId: doc._id,
          subDocumentId: null,
        }),
        1,
        0,
      );
    }, 1000);
  });

  it('should notify on new child', async () => {
    const Model = setup([], {
      path: 'sub',
      name: 'onTestChildrenNew',
      when: {
        new: true,
      },
    });

    const doc = await Model.create({
      name: 'New',
      age: 21,
      sub: [
        {
          amount: 12,
        },
        {
          amount: 3,
        },
      ],
    });

    await global.wait(() => {
      // both newness plugins
      expect(queue).toHaveBeenCalledTimes(1);
      expect(queue).toHaveBeenCalledWith(
        'onTestChildrenNew',
        expect.objectContaining({
          batch: expect.arrayContaining([
            expect.objectContaining({
              documentId: doc._id,
              subDocumentId: doc.sub[0]._id,
            }),
            expect.objectContaining({
              documentId: doc._id,
              subDocumentId: doc.sub[1]._id,
            }),
          ]),
        }),
        1,
        0,
      );
    }, 1000);
  });

  it('should test on children changes', async () => {
    const Model = setup(
      [],
      [
        {
          delay: 7,
          path: 'sub',
          name: 'onTestSubWithConditions',
          test: ['sub.amount=9'],
          when: {
            new: false,
            modified: ['sub.amount'],
          },
        },
      ],
    );

    const doc = await Model.create({
      name: 'New',
      age: 21,
      sub: [
        {
          amount: 12,
        },
      ],
    });

    doc.sub[0].amount = 9;
    await doc.save();

    await global.wait(() => {
      expect(queue).toHaveBeenCalledTimes(1);
      expect(queue).toHaveBeenCalledWith(
        'onTestSubWithConditions',
        expect.objectContaining({
          documentId: doc._id,
          subDocumentId: doc.sub[0]._id,
        }),
        1,
        7,
      );
    }, 1000);
  });
});
