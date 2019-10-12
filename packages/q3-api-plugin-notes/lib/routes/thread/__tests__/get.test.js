const Q3 = require('q3-api');
const Q3Mock = require('q3-api-mocks');
const {
  willThrowException,
} = require('q3-api-test-utils/helpers');
const { MODEL_NAME } = require('../../../constants');
const fixture = require('../../../model/__fixture');
const model = require('../../../model');

const GetAllThreads = require('../get').__get__(
  'GetAllThreads',
);

const GetInThread = require('../get.id').__get__(
  'GetInThread',
);

let noteID;
let threadID;
const { author } = fixture;

beforeAll(async () => {
  Q3.setModel(MODEL_NAME, model());
  await Q3.connect();
  ({
    _id: noteID,
    thread: [{ _id: threadID }],
  } = await Q3.model(MODEL_NAME).create(fixture));
  await fixture.seedUser();
});

describe('Get all threads', () => {
  it('should return ResourceNotFoundError', async () => {
    const mock = new Q3Mock();
    await willThrowException(
      GetAllThreads(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should return populated thread', async () => {
    const mock = new Q3Mock({
      params: {
        noteID,
        threadID,
      },
      user: {
        id: author,
      },
    });

    await GetAllThreads(mock.req, mock.res);
    expect(mock.res.ok).toHaveBeenCalledWith({
      threads: expect.any(Array),
    });
  });
});

describe('GetInThread', () => {
  it('should return ResourceNotFoundError', async () => {
    const mock = new Q3Mock();
    await willThrowException(
      GetInThread(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should return ResourceNotFoundError on subdoc', async () => {
    const mock = new Q3Mock({
      params: {
        noteID,
      },
    });
    await willThrowException(
      GetInThread(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should return populated thread', async () => {
    const mock = new Q3Mock({
      params: {
        noteID,
        threadID,
      },
      user: {
        id: author,
      },
    });

    await GetInThread(mock.req, mock.res);
    expect(mock.res.ok).toHaveBeenCalledWith({
      thread: expect.objectContaining({
        author: expect.any(Object),
        date: expect.any(Date),
        id: expect.any(String),
        _id: expect.any(Object),
        message: expect.any(String),
      }),
    });
  });
});
