require('dotenv').config();
const AdapterMongo = require('adapter-mongo');
const AdapterS3 = require('adapter-s3');
const PluginFilemanger = require('../../lib');

let inst;

beforeAll(async () => {
  const {
    CDN,
    S3_ACCESS_KEY_ID: accessKeyId,
    S3_SECRET: secretAccessKey,
    PRIVATE_BUCKET: PrivateBucket,
    PUBLIC_BUCKET: PublicBucket,
  } = process.env;

  inst = AdapterMongo(
    process.env.CONNECTION,
    [
      PluginFilemanger(
        AdapterS3({
          PrivateBucket,
          PublicBucket,
          accessKeyId,
          secretAccessKey,
          publicUrl: CDN,
        }),
      ),
    ],
    {
      disableGlobalSettings: true,
    },
  );

  inst
    .define({
      name: {
        type: inst.Types.String,
        required: true,
      },
    })
    .build('tests');

  await inst.start();
});

describe('AdapterMongo', () => {
  it('should', async () => {
    const Model = inst.fromDatasource('tests');
    const res = new Model({
      name: 'Model',
    });

    expect(res).toHaveProperty('handleReq');
    await res.handleReq({
      files: {
        test: {
          name: 'test.txt',
          data: Buffer.from('Test'),
        },
      },
    });
  });
});
