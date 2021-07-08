jest.unmock('express-validator');
jest.mock('q3-core-scheduler', () => ({
  queue: jest.fn(),
}));

jest.mock('../../../models', () => ({
  Users: {
    findVerifiedByEmail: jest.fn(),
    findVerifiedById: jest.fn(),
  },
}));

const { queue } = require('q3-core-scheduler');
const passwordChangeController = require('../post');
const { Users } = require('../../../models');

const email = 'mibberson@3merge.ca';

describe('PasswordResetCtrl', () => {
  describe('matchesConfirmNewPasswordField', () => {
    const execMatchFn = (value) =>
      passwordChangeController.matchesConfirmNewPasswordField(
        value,
        {
          req: { body: { confirmNewPassword: 'foo' } },
        },
      );

    it('should return value on match', () => {
      expect(execMatchFn('foo')).toMatch('foo');
    });

    it('should throw an error', () => {
      expect(() => execMatchFn('fooy')).toThrowError();
    });
  });

  describe('handler', () => {
    it('throw an error without password or token', async () =>
      expect(
        passwordChangeController.$og({
          body: { email },
          t: jest.fn(),
        }),
      ).rejects.toThrowError());

    it('should check by user ID', async () => {
      const setPassword = jest.fn();
      const acknowledge = jest.fn();

      Users.findVerifiedById.mockResolvedValue({
        verifyPassword: jest
          .fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false),
        setSecret: jest.fn(),
        setPassword,
      });

      await passwordChangeController.$og(
        {
          body: { previousPassword: 'HEY!' },
          user: { id: 1 },
          t: jest.fn(),
        },
        {
          acknowledge,
        },
      );

      expect(setPassword).toHaveBeenCalled();
      expect(queue).toHaveBeenCalled();
      expect(acknowledge).toHaveBeenCalled();
    });

    it('should check by user token', async () => {
      const setPassword = jest.fn();
      const acknowledge = jest.fn();

      Users.findVerifiedByEmail.mockResolvedValue({
        verifyPassword: jest.fn().mockResolvedValue(false),
        setSecret: jest.fn(),
        setPassword,
        passwordResetToken:
          '28b51e6fa5c26f743ede86390bf80f2574b48a45',
      });

      await passwordChangeController.$og(
        {
          body: {
            passwordResetToken:
              '28b51e6fa5c26f743ede86390bf80f2574b48a45',
            email,
          },
          t: jest.fn(),
        },
        {
          acknowledge,
        },
      );

      expect(setPassword).toHaveBeenCalled();
      expect(queue).toHaveBeenCalled();
      expect(acknowledge).toHaveBeenCalled();
    });

    it('should fail it token has expired', async () => {
      const setPassword = jest.fn();
      const acknowledge = jest.fn();

      Users.findVerifiedByEmail.mockResolvedValue({
        verifyPassword: jest.fn().mockResolvedValue(false),
        cannotResetPassword: true,
        setPassword,
      });

      expect(
        passwordChangeController.$og(
          {
            body: { passwordResetToken: 'TOKEN!', email },
          },
          {
            acknowledge,
          },
        ),
      ).rejects.toThrowError();
    });
  });
});
