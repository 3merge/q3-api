/* global wait */
jest.setTimeout(30000);

const mongoose = require('mongoose');
const Model = require('../fixtures/Model');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  // eslint-disable-next-line
  require('../../lib/changestream')();
});

afterEach(async () => {
  await mongoose.connection.db
    .collection('testing-changelog-changelog-v2')
    .deleteMany({});
});

afterAll(() => {
  mongoose.disconnect();
});

describe('changelog', () => {
  it('should capture nested changes', async () => {
    const doc = await Model.create({
      title: 'New',
    });

    const up = async (args) =>
      new Promise((r) => {
        setTimeout(async () => {
          r(
            await Model.updateOne(
              {
                _id: doc._id,
              },
              args,
            ),
          );
        }, 250);
      });

    await up({
      title: 'New Tesla announced',
      lastModifiedBy: {
        firstName: 'Mike',
      },
    });

    await up({
      topics: [
        { name: 'Entertainment' },
        { name: 'Cars' },
        {
          name: 'Politics',
          publications: [
            {
              name: 'this',
            },
          ],
        },
      ],
    });

    await up({
      $pull: {
        topics: {
          name: 'Entertainment',
        },
      },
    });

    return wait(async () => {
      const logs = await doc.getHistory();
      expect(logs).toHaveLength(7);
    });
  });

  it('should save the last modified user', async () => {
    const doc = await Model.create({
      title: 'New',
    });

    doc.topics.push({
      name: 'Debugging',
    });

    await doc.save();

    expect(doc.get('lastModifiedBy')).toHaveProperty(
      'firstName',
    );

    expect(
      doc.topics[0].get('lastModifiedBy'),
    ).toBeUndefined();
  });
});
