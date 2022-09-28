/* global wait */
jest.setTimeout(60000);

const mongoose = require('mongoose');
const { AccessControl } = require('q3-core-access');
const changestream = require('../../lib/changestream');
const Report = require('../../lib/report');
const Model = require('../fixtures/Model');

beforeAll(async () => {
  // for some reason we need to disconnect first...
  await mongoose.disconnect();
  await mongoose.connect(process.env.CONNECTION);
  await changestream();

  AccessControl.init([
    {
      coll: 'testing-changelogs',
      role: 'Public',
      fields: ['*'],
      op: 'Read',
    },
  ]);
});

afterEach(async () => {
  await mongoose.connection.db
    .collection('testing-changelogs-changelog-v2')
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

    const up = (args) =>
      wait(async () => {
        await Model.updateOne(
          {
            _id: doc._id,
          },
          args,
        );
      }, 1050);

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

    let titleRecords;
    let topicRecords;

    await wait(async () => {
      const r = new Report('testing-changelogs', doc._id);
      titleRecords = await r.getData({}, 'title');
      topicRecords = await r.getData({}, 'topics.name');
    }, 5000);

    expect(titleRecords).toHaveLength(2);
    expect(titleRecords[0].updates[0].title).toEqual(
      'New Tesla announced',
    );

    expect(titleRecords[1].additions[0].title).toEqual(
      'New',
    );

    expect(topicRecords).toHaveLength(2);

    expect(
      topicRecords[0].deletions[0]['topics.name'],
    ).toEqual('Entertainment');

    expect(topicRecords[1].additions).toHaveLength(3);
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
