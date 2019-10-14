const Q3 = require('q3-api');
const Q3Mock = require('q3-api-mocks');
const { Types } = require('mongoose');
const {
  willThrowException,
} = require('q3-api-test-utils/helpers');
const { MODEL_NAME } = require('../../../constants');
const fixture = require('../../../model/__fixture');
const model = require('../../../model');

const DeleteNoteController = require('../delete').__get__(
  'DeleteNoteController',
);

const GetByInvolvementController = require('../get').__get__(
  'GetByInvolvementController',
);

const CreateNoteController = require('../post').__get__(
  'CreateNoteController',
);

let notesID;
const { author } = fixture;

beforeAll(async () => {
  Q3.setModel(MODEL_NAME, model());
  await Q3.connect();
});

beforeEach(async () => {
  ({ _id: notesID } = await Q3.model(MODEL_NAME).create(
    fixture,
  ));
});

afterEach(async () => {
  await Q3.model(MODEL_NAME).findByIdAndDelete(notesID);
});

describe('DeleteNoteController', () => {
  it('should call res.acknowledge', async () => {
    const mock = new Q3Mock({
      params: {
        notesID,
      },
    });
    await DeleteNoteController(mock.req, mock.res);
    expect(mock.res.acknowledge).toHaveBeenCalled();
  });
});

describe('GetByInvolvementController', () => {
  it('should return based on authorship', async () => {
    const mock = new Q3Mock({
      user: {
        _id: author,
      },
    });
    await GetByInvolvementController(mock.req, mock.res);
    expect(mock.res.ok.mock.calls[0][0].notes).toHaveLength(
      1,
    );
  });

  it('should return based on subscription', async () => {
    const mock = new Q3Mock({
      user: {
        _id: Types.ObjectId().toString(),
      },
    });
    await GetByInvolvementController(mock.req, mock.res);
    expect(mock.res.ok.mock.calls[0][0].notes).toHaveLength(
      0,
    );
  });
});

describe('CreateNoteController', () => {
  it('should create a new note with first message', async () => {
    const mock = new Q3Mock({
      user: {
        _id: Types.ObjectId().toString(),
      },
      body: {
        topic: Types.ObjectId(),
        message: 'HEY',
      },
    });
    await CreateNoteController(mock.req, mock.res);

    expect(
      mock.res.create.mock.calls[0][0].note,
    ).toMatchObject({
      thread: expect.any(Array),
      subscribers: expect.any(Array),
      topic: expect.any(Object),
    });

    return expect(
      CreateNoteController(mock.req, mock.res),
    ).rejects.toThrowError();
  });
});
