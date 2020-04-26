jest.unmock('express-validator');
jest.mock('q3-core-mailer', () => ({
  emit: jest.fn(),
}));

jest.mock('../../../models', () => ({
  Users: {
    findVerifiedByEmail: jest.fn(),
  },
}));

const { emit } = require('q3-core-mailer');
const passwordResetController = require('../post');
const { Users } = require('../../../models');

test('PasswordResetCtrl should issue password token', async () => {
  const email = 'mibberson@3merge.ca';
  const setPasswordResetToken = jest.fn();
  const ok = jest.fn();

  Users.findVerifiedByEmail.mockResolvedValue({
    save: jest.fn(),
    toJSON: jest.fn().mockReturnValue({
      id: 1,
    }),
    setPasswordResetToken,
  });

  await passwordResetController.$og(
    { body: { email }, t: jest.fn() },
    { ok },
  );

  expect(Users.findVerifiedByEmail).toHaveBeenCalledWith(
    email,
  );

  expect(emit).toHaveBeenCalledWith(
    'onPasswordReset',
    expect.any(Object),
  );

  expect(setPasswordResetToken).toHaveBeenCalled();
  expect(ok).toHaveBeenCalled();
});
