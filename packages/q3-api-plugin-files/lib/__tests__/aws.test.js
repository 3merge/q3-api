const AWS = require('aws-sdk-mock');
const AWSInterface = require('../aws');

const Contents = [{ Key: 'foo' }];

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
        Key: 'foo/bar',
        Bucket: 'Private',
      });
      done();
    });

    AWSInterface().getPrivate('foo', 'bar');
  });

  it('should reject file upload', async () => {
    const err = true;
    const file = { name: 'Foo' };
    AWS.mock('S3', 'putObject', (method, callback) => {
      callback({ err });
    });

    await expect(
      AWSInterface().putPrivate(1, file),
    ).rejects.toMatchObject({
      err,
    });
  });

  it('should resolve file upload', async () => {
    const file = { name: 'Foo' };
    AWS.mock('S3', 'putObject', (method, callback) => {
      expect(method).toHaveProperty('Key', '1/Foo');
      expect(method).toHaveProperty('Bucket', 'Private');
      callback();
    });

    await expect(
      AWSInterface().putPrivate(1, file),
    ).resolves.toBe(file.name);
  });

  it('should resolve public upload', async () => {
    const file = { name: 'Foo' };
    AWS.mock('S3', 'putObject', (method, callback) => {
      expect(method).toHaveProperty('Key', 'Foo');
      expect(method).toHaveProperty('Bucket', 'Public');
      callback();
    });

    await expect(
      AWSInterface().putPublic(file),
    ).resolves.toBe('Heyo/Foo');
  });

  it('should return public files', async () => {
    AWS.mock('S3', 'listObjects', (params, callback) => {
      expect(params).toHaveProperty('Bucket', 'Public');
      callback(null, { Contents });
    });

    await expect(
      AWSInterface().listPublic(),
    ).resolves.toEqual(['Heyo/foo']);
  });

  it('should return private files', async () => {
    AWS.mock('S3', 'listObjects', (params, callback) => {
      expect(params).toHaveProperty('Prefix', '123');
      expect(params).toHaveProperty('Bucket', 'Private');
      callback(null, { Contents });
    });

    await expect(
      AWSInterface().listPrivate('123'),
    ).resolves.toEqual(['foo']);
  });

  it('should delete a private file', async () => {
    AWS.mock('S3', 'deleteObject', (params, callback) => {
      expect(params).toHaveProperty('Key', '123/Foo');
      expect(params).toHaveProperty('Bucket', 'Private');
      callback(null);
    });

    await expect(
      AWSInterface().deletePrivate('123', 'Foo'),
    ).resolves.toBe(undefined);
  });

  it('should delete a private file', async () => {
    AWS.mock('S3', 'deleteObject', (params, callback) => {
      expect(params).toHaveProperty('Key', 'Foo');
      expect(params).toHaveProperty('Bucket', 'Public');
      callback(null);
    });

    await expect(
      AWSInterface().deletePublic('Foo'),
    ).resolves.toBe(undefined);
  });
});
