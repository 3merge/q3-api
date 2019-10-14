const Q3 = require('q3-api');
const Q3Mock = require('q3-api-mocks');
const {
  willThrowException,
} = require('q3-api-test-utils/helpers');
const { MODEL_NAME } = require('../../../../constants');
const fixture = require('../../../../model/__fixture');
const model = require('../../../../model');

const DeleteThreadController = require('../delete').__get__(
  'DeleteThreadController',
);

const ListThreadController = require('../get').__get__(
  'ListThreadController',
);

const GetInThreadController = require('../get.id').__get__(
  'GetInThreadController',
);

const AddToThreadController = require('../put').__get__(
  'AddToThreadController',
);

let notesID;
let threadsID;
const { author } = fixture;

beforeAll(async () => {
  Q3.setModel(MODEL_NAME, model());
  await Q3.connect();
  ({
    _id: notesID,
    thread: [{ _id: threadsID }],
  } = await Q3.model(MODEL_NAME).create(fixture));
});

afterAll(async () => {
  await Q3.model(MODEL_NAME).deleteMany({});
});

describe('ListThreadController', () => {
  it('should return ResourceNotFoundError', async () => {
    const mock = new Q3Mock();
    await willThrowException(
      ListThreadController(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should return populated thread', async () => {
    const mock = new Q3Mock({
      params: {
        notesID,
        threadsID,
      },
      user: {
        id: author,
      },
    });

    await ListThreadController(mock.req, mock.res);
    expect(mock.res.ok).toHaveBeenCalledWith({
      threads: expect.any(Array),
    });
  });
});

describe('GetInThread', () => {
  it('should return ResourceNotFoundError', async () => {
    const mock = new Q3Mock();
    await willThrowException(
      GetInThreadController(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should return ResourceNotFoundError on subdoc', async () => {
    const mock = new Q3Mock({
      params: {
        notesID,
      },
    });
    await willThrowException(
      GetInThreadController(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should return populated thread', async () => {
    const mock = new Q3Mock({
      params: {
        notesID,
        threadsID,
      },
      user: {
        id: author,
      },
    });

    await GetInThreadController(mock.req, mock.res);
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

describe('AddToThreadController', () => {
  it('should invoke res.create', async () => {
    const mock = new Q3Mock({
      user: {
        _id: author,
      },
      params: {
        notesID,
      },
      body: {
        message: 'Hello',
      },
    });

    await AddToThreadController(mock.req, mock.res);
    expect(mock.req.evoke).toHaveBeenCalled();
    expect(mock.res.create).toHaveBeenCalled();
  });

  it('should throw an error with body', async () => {
    const mock = new Q3Mock({
      user: {
        _id: author,
      },
      params: {
        notesID,
      },
      body: {},
    });

    return expect(
      AddToThreadController(mock.req, mock.res),
    ).rejects.toThrowError();
  });

  it('should email all subscribers', async () => {
    const [mail] = AddToThreadController.effect;
    const doc = {
      topic: '1234324',
      subscribers: [
        {
          email: 'foo@bar.com',
        },
      ],
    };
    const { response } = await mail(doc, new Q3Mock().req);
    expect(response).toMatch('250 Accepted');
  });
});

describe('DeleteThreadController', () => {
  it('should throw ResourceNotFoundError', async () => {
    const mock = new Q3Mock();
    await willThrowException(
      DeleteThreadController(mock.req, mock.res),
      'ResourceNotFoundError',
    );
  });

  it('should invoke res.acknowledge', async () => {
    const mock = new Q3Mock({
      params: {
        notesID,
        threadsID,
      },
      user: {
        id: author,
      },
    });

    await DeleteThreadController(mock.req, mock.res);
    expect(mock.res.acknowledge).toHaveBeenCalled();
  });
});
