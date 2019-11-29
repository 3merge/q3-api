const { model } = require('mongoose');
const Schema = require('..');

let UserModel;

beforeAll(() => {
  UserModel = model('test_users', Schema);
});

describe('UserModel validation', () => {
  it('should mandate required fields', () => {
    const doc = new UserModel();
    const { errors } = doc.validateSync();
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining([
        'firstName',
        'lastName',
        'email',
        'role',
      ]),
    );
  });

  it('should set defaults', () => {
    const doc = new UserModel({
      firstName: 'Jon',
      lastName: 'Doe',
      emai: 'jon.doe@gmail.com',
      secret: 'shh!',
    });
    expect(doc).toMatchObject(
      expect.objectContaining({
        verified: false,
        frozen: false,
        active: true,
        loginAttempts: 0,
        lang: 'en-CA',
      }),
    );
  });
});
