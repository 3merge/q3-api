const mongoose = require('mongoose');
const Fixture = require('../fixtures');

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
});

beforeEach(() => {
  process.env.SECRET = 'testing';
});

describe('Verification plugin', () => {
  it('should setup user verification object', async () => {
    const user = await Fixture.create();

    expect(user).toHaveProperty('isVerified', false);

    expect(user).toHaveProperty(
      'verification',
      expect.arrayContaining([
        expect.objectContaining({
          strategy: 'MMS',
          state: false,
        }),
      ]),
    );

    const code = await user.initVerificationSequence('MMS');
    await user.verifyStrategyWithCode('MMS', code);

    expect(user).toHaveProperty('isVerified', true);

    expect(user).toHaveProperty(
      'verification',
      expect.arrayContaining([
        expect.objectContaining({
          strategy: 'MMS',
          state: true,
          secret: expect.any(String),
        }),
      ]),
    );
  });
});
