const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const Exporter = require('../lib');
const slip = require('../__fixtures__/packing-slip');

const makeFixturePath = (num) =>
  path.join(__dirname, `../__fixtures__/sample${num}.pdf`);

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
});
