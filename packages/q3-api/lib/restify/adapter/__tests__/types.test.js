const mongoose = require('mongoose');
const convertMongooseTypes = require('../types');

const nestedStub = new mongoose.Schema({
  friend: String,
});

const stub = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 2,
    enum: ['Foo'],
    unique: true,
  },
  enable: {
    type: Boolean,
    required: false,
  },
  age: {
    type: Number,
    min: 0,
    max: 1,
  },
  birth: {
    type: Date,
    required: true,
  },
  reference: {
    type: mongoose.Types.ObjectId,
  },
  files: [String],
  friends: {
    type: [nestedStub],
    ref: 'SOME_MODEL',
  },
});

describe('convertMongooseTypes', () => {
  it('should return isString', () => {
    expect(
      convertMongooseTypes(stub.paths.name),
    ).toMatchObject({
      validator: 'isString',
      minLength: 1,
      maxLength: 2,
      enum: ['Foo'],
      required: true,
      unique: true,
    });
  });

  it('should return isBoolean', () => {
    expect(
      convertMongooseTypes(stub.paths.enable),
    ).toMatchObject({
      validator: 'isBoolean',
    });
  });

  it('should return isFloat', () => {
    expect(
      convertMongooseTypes(stub.paths.age),
    ).toMatchObject({
      validator: 'isFloat',
      min: 0,
      max: 1,
    });
  });

  it('should return isISO8601', () => {
    expect(
      convertMongooseTypes(stub.paths.birth),
    ).toMatchObject({
      validator: 'isISO8601',
      required: true,
    });
  });

  it('should return isMongoId', () => {
    expect(
      convertMongooseTypes(stub.paths.reference),
    ).toMatchObject({
      validator: 'isMongoId',
    });
  });

  it('should return isArray', () => {
    expect(
      convertMongooseTypes(stub.paths.files),
    ).toMatchObject({
      validator: 'isArray',
    });
  });

  it('should skip sub documents', () => {
    expect(
      convertMongooseTypes(stub.paths.friends),
    ).toBeNull();
  });
});
