const mongoose = require('mongoose');
const {
  castId,
  getId,
  decorateQueuedFunction,
} = require('../../lib/utils');

describe('castId', () => {
  it('should format _id', async () => {
    const id = mongoose.Types.ObjectId();
    const out = castId({
      _id: id.toString(),
    });

    expect(out._id).toEqual(id);
  });

  it('should format nested _id', async () => {
    const id = mongoose.Types.ObjectId();
    const out = castId({
      _id: {
        _id: id.toString(),
      },
    });

    expect(out._id).toEqual(id);
  });

  it('should return undefined', async () => {
    const out = castId({
      _id: 'noop',
    });

    expect(out._id).toBeUndefined();
  });
});

describe('getId', () => {
  it('should format _id', async () => {
    const id = mongoose.Types.ObjectId();
    expect(
      getId({
        _id: id.toString(),
      }),
    ).toEqual(id);
  });

  it('should return null', async () => {
    expect(
      getId({
        _id: 'noop',
      }),
    ).toBeNull();
  });
});

describe('decorateQueuedFunction', () => {
  it('should forward', () => {
    const fn = jest.fn();
    const stub = { foo: 1 };
    decorateQueuedFunction(fn)(stub);
    expect(fn).toHaveBeenCalledWith(stub);
  });

  it('should split batch', () => {
    const fn = jest.fn();
    const stub = { foo: 1 };
    decorateQueuedFunction(fn)({
      batch: [stub, stub],
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(stub);
  });
});
