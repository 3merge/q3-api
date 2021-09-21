require('../fixtures');
const mongoose = require('mongoose');
const { get } = require('lodash');
const Mailer = require('../../lib/core');

const mjml = `<mj-body>
        <mj-section>
          <mj-column>
            <mj-text>Hi {{name}}</mj-text>
          </mj-column>
        </mj-section>
      </mj-body>`;

beforeAll(async () => {
  await mongoose.connect(process.env.CONNECTION);
  await mongoose.models.emails.create([
    {
      name: 'foo',
      mjml: '<mjml><mj-include path="bar" /></mjml>',
    },
    {
      name: 'bar',
      mjml,
    },
  ]);
});

afterAll(async () => {
  await mongoose.models.emails.deleteMany({});
  mongoose.disconnect();
});

describe('Mailer', () => {
  describe('fromDatabase', () => {
    it('should build HTML', async () => {
      const m = new Mailer('foo');
      const html = get(
        await m.fromDatabase({
          name: 'Mike',
        }),
        'meta.html',
      );
      expect(html).toMatch('Hi Mike');
    });
  });

  describe('preview', () => {
    it('should build HTML', async () => {
      const html = await Mailer.preview(
        `<mjml>${mjml}</mjml>`,
        {
          variables: {
            name: 'Mike',
          },
        },
      );

      expect(html).toMatch('Hi Mike');
    });
  });
});
