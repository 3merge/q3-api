const AdapterMongo = require('adapter-mongo');
const AdapterS3 = require('adapter-s3');
const PluginFilemanger = require('../../lib');

let inst;

beforeAll(async () => {
  inst = AdapterMongo(
    process.env.CONNECTION,
    [PluginFilemanger(AdapterS3({}))],
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
        // here we go!
      },
    });
  });
});
