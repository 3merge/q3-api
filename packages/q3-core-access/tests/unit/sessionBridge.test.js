const mongoose = require('mongoose');
const sift = require('sift');

describe('AccessControlSessionBridge', () => {
  it('should match $in of object ids', () => {
    const id = mongoose.Types.ObjectId();
    const fn = sift({
      createdBy: {
        $in: [id, id.toString()],
      },
    });

    expect(
      fn({
        createdBy: id.toString(),
      }),
    ).toBeTruthy();

    expect(
      fn({
        createdBy: id,
      }),
    ).toBeTruthy();
  });
});
