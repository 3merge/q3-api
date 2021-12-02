// eslint-disable-next-line
const Scheduler = require('q3-core-scheduler');
const moment = require('moment');
const { first, last } = require('lodash');
const { access, teardown } = require('../helpers');
const setup = require('../fixtures');

let agent;
let queues = [];

const today = moment().subtract(1, 'day');

const setPublicPermission = (args = {}) =>
  access.insert({
    coll: 'queues',
    ownership: 'Any',
    role: 'Public',
    fields: ['*'],
    ...args,
  });

beforeAll(async () => {
  ({ agent } = await setup());
});

beforeEach(async () => {
  access.refresh();

  await Scheduler.__$db.deleteMany({});
  queues = await Scheduler.__$db.create([
    {
      name: 'foo',
      due: today.toISOString(),
      status: 'Queued',
      locked: true,
    },
    {
      name: 'foo',
      duration: 60000 * 60 * 24,
      status: 'Done',
      locked: true,
    },
    {
      name: 'bar@daily',
      duration: 500,
      completedOn: moment()
        .subtract(1, 'day')
        .toISOString(),
      status: 'Done',
      locked: true,
    },
  ]);
});

afterAll(teardown);

describe('queuelogs', () => {
  it('should return 403', async () => {
    await agent.get('/queue-logs').expect(403);
  });

  it('should return 200', async () => {
    setPublicPermission({
      op: 'Read',
    });

    const { body } = await agent
      .get('/queue-logs')
      .expect(200);

    expect(body.queues).toHaveLength(3);

    expect(first(body.queues)).toMatchObject({
      type: 'Once',
      name: 'foo',
      status: 'In Progress',
      expectedCompletionDate: today
        .add(1, 'day')
        .toISOString(),
    });

    expect(last(body.queues)).toMatchObject({
      type: 'Recurring',
      name: 'bar',
      status: 'Done',
    });
  });

  it('should return 403', async () => {
    await agent
      .patch(`/queue-logs/${first(queues).id}`, {})
      .expect(403);
  });

  it('should return 422', async () => {
    setPublicPermission({
      op: 'Update',
    });

    await agent
      .patch(`/queue-logs/${last(queues).id}`)
      .send({
        status: 'In Progress',
      })
      .expect(422);
  });

  it('should return 409', async () => {
    setPublicPermission({
      op: 'Update',
    });

    await Scheduler.__$db.create({
      name: 'bar@daily',
      due: today.toISOString(),
      status: 'Queued',
      locked: false,
    });

    await agent
      .patch(`/queue-logs/${last(queues).id}`)
      .send({
        status: 'Queued',
      })
      .expect(409);
  });

  it('should return 200', async () => {
    setPublicPermission({
      op: 'Update',
    });

    const {
      body: { queue },
    } = await agent
      .patch(`/queue-logs/${last(queues).id}`)
      .send({
        status: 'Queued',
      })
      .expect(200);

    expect(queue).toHaveProperty('expectedCompletionDate');
    expect(queue).toHaveProperty('id');
  });

  it('should return 409', async () => {
    setPublicPermission({
      op: 'Delete',
    });

    await agent
      .delete(`/queue-logs/${last(queues).id}`)
      .send({
        status: 'Queued',
      })
      .expect(409);
  });

  it('should return 204', async () => {
    setPublicPermission({
      op: 'Delete',
    });

    await agent
      .delete(`/queue-logs/${first(queues).id}`)
      .expect(204);
  });

  it('should return 403', async () => {
    await agent
      .delete(`/queue-logs/${first(queues).id}`)
      .expect(403);
  });

  it('should return 409', async () => {
    setPublicPermission({
      op: 'Delete',
    });

    await agent
      .delete(`/queue-logs/${queues[1].id}`)
      .expect(409);
  });
});
