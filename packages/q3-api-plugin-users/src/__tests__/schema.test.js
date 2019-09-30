import { model } from 'mongoose';
import Schema, { isValidEmail } from '../schema';

let UserModel;

beforeAll(() => {
  UserModel = model('test_users', Schema);
});

describe('Email validation', () => {
  it('should return truthy', () => {
    expect(
      [
        'foo@gmail.com',
        'foo+1@gmail.com',
        'foo.bar@gmail.com',
        'foo@yahoo.ca',
        'foo1_92836@gov.uk.en',
      ].every(isValidEmail),
    ).toBeTruthy();
  });

  it('should return falsy', () => {
    expect(
      [
        'foo@gmail',
        'foo+1@gmail.',
        'foo.barmail.com',
      ].every(isValidEmail),
    ).toBeFalsy();
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
