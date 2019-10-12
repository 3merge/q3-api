const Q3 = require('q3-api');
const Q3Mock = require('q3-api-mocks');
const {
  willThrowException,
} = require('q3-api-test-utils/helpers');
const { MODEL_NAME } = require('../../../constants');
const fixture = require('../../../model/__fixture');
const model = require('../../../model');

const DeleteThreadController = require('../delete').__get__(
  'DeleteThreadController',
);

let noteID;
let threadID;

beforeAll(async () => {
  Q3.setModel(MODEL_NAME, model());
  await Q3.connect();
  ({
    _id: noteID,
    thread: [{ _id: threadID }],
  } = await Q3.model(MODEL_NAME).create(fixture));
});

describe('DeleteThreadController', () => {
  it('should throw ResourceNotFoundError', async () => {
    const mock = new Q3Mock();
    await willThrowException(
      DeleteThreadController(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should throw AuthenticationError', async () => {
    const mock = new Q3Mock({
      params: {
        noteID,
        threadID,
      },
    });

    await willThrowException(
      DeleteThreadController(mock.req, mock.res),
      'AuthorizationError',
    );
  });

  it('should invoke res.acknowledge', async () => {
    const mock = new Q3Mock({
      params: {
        noteID,
        threadID,
      },
      user: {
        id: fixture.thread[0].author,
      },
    });

    await DeleteThreadController(mock.req, mock.res);
    expect(mock.res.acknowledge).toHaveBeenCalled();
  });
});
