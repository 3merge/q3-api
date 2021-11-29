const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const Exporter = require('../lib');
const slip = require('../__fixtures__/packing-slip');

const makeFixturePath = (num, ext = 'pdf') =>
  path.join(
    __dirname,
    `../__fixtures__/sample${num}.${ext}`,
  );

const makeFixture = (file, buffer) =>
  fs.writeFileSync(file, buffer, 'binary');

const expectNumberOfPagesInFixture = async (
  file,
  expectedLength,
) => {
  const readStream = fs.readFileSync(file);
  const pdfDoc = await PDFDocument.load(readStream);
  const pages = pdfDoc.getPages();
  expect(pages).toHaveLength(expectedLength);
};

describe('Q3 exporter', () => {
  it('should generate PDF (SMOKE TEST)', async () => {
    const out = await new Exporter('pdf').toBuffer([slip]);
    const file = makeFixturePath(1);
    makeFixture(file, out);
    await expectNumberOfPagesInFixture(file, 1);
  });

  it('should merge PDFs (SMOKE TEST)', async () => {
    const bufs = Array(3).fill(slip);
    const out = await new Exporter('pdf').toBuffer(bufs);
    const file = makeFixturePath(2);
    makeFixture(file, out);
    await expectNumberOfPagesInFixture(file, bufs.length);
  });

  it('should make HTML file', async () => {
    const out = await new Exporter('html').toBuffer([
      ` <main>
        <section>
          <h1>Page 1</h1>
          <p>This is a test</p>
          <img width="250px" src="https://images.unsplash.com/photo-1633114128174-2f8aa49759b0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" /> 
        </section>
        </main>
      `,
      ` <main>
        <section>
          <h1>Page 2</h1>
          <p>This is another test</p>
          <img  width="250px" src="https://images.unsplash.com/photo-1638138936546-54bd21bca01b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" /> 
        </section>
        </main>
      `,
    ]);
    const file = makeFixturePath(3, 'html');
    makeFixture(file, out);
  });

  it('should make TXT file', async () => {
    const out = await new Exporter('txt').toBuffer([
      'Hello world',
    ]);

    const file = makeFixturePath(3, 'txt');
    makeFixture(file, out);
  });
});
