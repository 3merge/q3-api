const AWS = require('aws-sdk-mock');
const AWSInterface = require('../aws');

const file = { name: 'Foo', data: 'flestuff' };

beforeAll(() => {
  process.env.S3_ACCESS_KEY_ID = '123';
  process.env.S3_SECRET = 'Shh!';
  process.env.PRIVATE_BUCKET = 'Private';
  process.env.PUBLIC_BUCKET = 'Public';
  process.env.CDN = 'Heyo';
});

afterEach(() => {
  AWS.restore('S3');
});

describe('AWS inteface', () => {
  it('should fetch signed URL', (done) => {
    AWS.mock('S3', 'getSignedUrl', (method, params) => {
      expect(method).toBe('getObject');
      expect(params).toMatchObject({
        Bucket: 'Private',
        Key: 'foo',
      });
      done();
    });

    AWSInterface().getPrivate('foo');
  });

  it('should delete a public file', async () => {
    AWS.mock('S3', 'deleteObject', (params, callback) => {
      expect(params).toHaveProperty('Key', 'Foo');
      expect(params).toHaveProperty('Bucket', 'Public');
      callback(null);
    });

    await expect(
      AWSInterface().deleteByKey('Foo'),
    ).resolves.toBe(undefined);
  });

  it('should reject file upload', () => {
    AWS.mock('S3', 'putObject', (params, callback) => {
      callback(new Error());
    });

    expect(
      AWSInterface().addToBucket(false)(['1', file]),
    ).rejects.toThrowError();
  });

  it('should resolve private upload', () => {
    AWS.mock('S3', 'putObject', (params, callback) => {
      expect(params).toHaveProperty('Key', '1');
      expect(params).toHaveProperty('Bucket', 'Private');
      callback();
    });

    expect(
      AWSInterface().addToBucket(true)(['1', file]),
    ).resolves.toBe('Foo');
  });
});
