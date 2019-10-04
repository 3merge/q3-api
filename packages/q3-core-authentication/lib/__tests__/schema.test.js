const { model } = require('mongoose');
const Schema = require('../schema');

let UserModel;

beforeAll(() => {
  UserModel = model('test_users', Schema);
});

describe('Email validation', () => {
  it('should pass', () => {
    [
      'foo@gmail.com',
      'foo+1@gmail.com',
      'foo.bar@gmail.com',
      'foo@yahoo.ca',
      'foo1_92836@gov.uk.en',
    ].forEach((email) => {
      const doc = new UserModel({ email });
      const { errors } = doc.validateSync();
      expect(errors).not.toHaveProperty('email');
    });
  });

  it('should fail', () => {
    [
      'foo@gmail',
      'foo+1@gmail.',
      'foo.barmail.com',
    ].forEach((email) => {
      const doc = new UserModel({ email });
      const { errors } = doc.validateSync();
      expect(errors).toHaveProperty('email');
    });
  });
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
        'secret',
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
