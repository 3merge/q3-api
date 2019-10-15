/* eslint-disable global-require */
const Q3 = require('q3-api');
const Q3Mock = require('q3-api-mocks');
const mongoose = require('mongoose');
const helpers = require('q3-test-utils/helpers');
const { Schema } = require('mongoose');
const plugin = require('../../../model');
const fixture = require('../../../model/__fixture');

const MODEL_NAME = 'Foobar';

const shippingFixture = {
  ...fixture,
  ...{ kind: 'Shipping' },
};

let Model;

beforeAll(async () => {
  const Foo = new Schema({
    date: Date,
  });

  Foo.plugin(plugin);
  Model = Q3.setModel(MODEL_NAME, Foo);
  await Q3.connect();
});

describe('Delete single address', () => {
  let Ctrl;

  beforeAll(() => {
    Ctrl = require('../delete.id')(MODEL_NAME).root;
  });

  it('should throw an error if operation does not pull any subdocs', async () => {
    const mock = new Q3Mock();
    await helpers.willThrowException(
      Ctrl(mock.req, mock.res),
      'InternalServer',
    );
  });

  it('should invoke res.acknowledge', async () => {
    const {
      _id: documentID,
      addresses: [{ _id: addressID }],
    } = await Model.create({
      date: new Date(),
      addresses: [fixture],
    });

    const mock = new Q3Mock({
      params: {
        documentID,
        addressID,
      },
    });

    await Ctrl(mock.req, mock.res);
    expect(mock.res.acknowledge).toHaveBeenCalled();
  });
});

describe('Delete many addresses', () => {
  let Ctrl;

  beforeAll(() => {
    // eslint-disable-next-line
    Ctrl = require('../delete')(MODEL_NAME).root;
  });

  it('should throw an error if operation does not pull any subdocs', async () => {
    const mock = new Q3Mock();
    await helpers.willThrowException(
      Ctrl(mock.req, mock.res),
      'InternalServer',
    );
  });

  it('should invoke res.acknowledge', async () => {
    const {
      _id: documentID,
      addresses,
    } = await Model.create({
      date: new Date(),
      addresses: [shippingFixture, fixture],
    });

    const ids = addresses.map((a) => a.id);
    const mock = new Q3Mock({
      params: {
        documentID,
      },
      query: {
        ids,
      },
    });

    await Ctrl(mock.req, mock.res);
    expect(mock.res.acknowledge).toHaveBeenCalled();
  });
});

describe('Get all addresses', () => {
  let Ctrl;
  let documentID;

  const getAddressLength = (mock, len) => {
    expect(mock.res.ok).toHaveBeenCalledWith({
      addresses: expect.any(Array),
    });
    expect(
      mock.res.ok.mock.calls[0][0].addresses,
    ).toHaveLength(len);
  };

  beforeAll(async () => {
    Ctrl = require('../get')(MODEL_NAME).root;
    ({ _id: documentID } = await Model.create({
      date: new Date(),
      addresses: [
        shippingFixture,
        shippingFixture,
        fixture,
      ],
    }));
  });

  it('should return addresses', async () => {
    const mock = new Q3Mock({
      params: {
        documentID,
      },
    });

    await Ctrl(mock.req, mock.res);
    getAddressLength(mock, 3);
  });

  it('should return addresses', async () => {
    const mock = new Q3Mock({
      params: {
        documentID,
      },
      query: {
        kind: 'Billing',
      },
    });

    await Ctrl(mock.req, mock.res);
    getAddressLength(mock, 1);
  });

  it('should empty addresses', async () => {
    const mock = new Q3Mock({
      params: {
        documentID: mongoose.Types.ObjectId(),
      },
    });

    await Ctrl(mock.req, mock.res);
    getAddressLength(mock, 0);
  });
});

describe('Create new address', () => {
  let Ctrl;
  let documentID;

  beforeAll(async () => {
    Ctrl = require('../post')(MODEL_NAME).root;
    ({ _id: documentID } = await Model.create({
      date: new Date(),
      addresses: [],
    }));
  });

  it('should add an address', async () => {
    const mock = new Q3Mock({
      body: fixture,
      params: {
        documentID,
      },
    });

    await Ctrl(mock.req, mock.res);
    expect(mock.res.create).toHaveBeenCalled();
  });

  it('should fail to add another billing', async () => {
    const mock = new Q3Mock({
      body: fixture,
      params: {
        documentID,
      },
    });

    await helpers.willThrowException(
      Ctrl(mock.req, mock.res),
      'ValidationError',
    );
  });
});

describe('Update an existing address', () => {
  let Ctrl;
  let documentID;
  let addressID;

  beforeAll(async () => {
    Ctrl = require('../put.id')(MODEL_NAME).root;
    ({
      _id: documentID,
      addresses: [{ _id: addressID }],
    } = await Model.create({
      date: new Date(),
      addresses: [fixture],
    }));
  });

  it('should update an address', async () => {
    const mock = new Q3Mock({
      body: fixture,
      params: {
        documentID,
        addressID,
      },
    });

    await Ctrl(mock.req, mock.res);
    expect(mock.res.update).toHaveBeenCalled();
  });
});
