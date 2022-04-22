const fsPromises = require('fs').promises;
const path = require('path');
const Mailer = require('q3-core-mailer');
const setup = require('../fixtures');
const { teardown } = require('../helpers');

beforeAll(async () => {
  await setup();
});

afterAll(teardown);

describe('Mailer', () => {
  it.skip('should send with attachments', async () => {
    const m = await Mailer('en-test').to([
      process.env.MAILER_TO,
    ]);

    m.subject('Test with file');

    m.attach({
      filename: 'test',
      data: await fsPromises.readFile(
        path.resolve(
          __dirname,
          '../fixtures/files/test.pdf',
        ),
      ),
    });

    await m.fromDatabase({});
    await m.send();
  });
});
