const { PDFDocument } = require('pdf-lib');
const PdfPrinter = require('pdfmake');
const { first } = require('lodash');
const path = require('path');

const getFontFromDir = (variant) =>
  path.resolve(__dirname, `./fonts/Roboto-${variant}.ttf`);

const getFontDeclarations = () => {
  const Roboto = Object.entries({
    normal: 'Regular',
    bold: 'Medium',
    italics: 'Italic',
    bolditalics: 'MediumItalic',
  }).reduce((acc, [key, value]) => {
    acc[key] = getFontFromDir(value);
    return acc;
  }, {});

  return {
    Roboto,
  };
};

const createBufferFromDocumentDefinitions = (file) =>
  new Promise((resolve) => {
    try {
      const bufs = [];
      new PdfPrinter(getFontDeclarations())
        .createPdfKitDocument(file, {
          // see https://pdfmake.github.io/docs/0.1/options/
          // all optional and non-applicable
        })
        .on('data', (data) => {
          bufs.push(data);
        })
        .on('end', () => {
          resolve(Buffer.concat(bufs));
        })
        .end();
    } catch (e) {
      // eslint-disable-next-line
      console.warn(e);
      resolve(null);
    }
  });

async function merge(pdfs = []) {
  const mergedPdf = await PDFDocument.create();

  await Promise.all(
    pdfs.map(async (pdf) => {
      const data = await PDFDocument.load(pdf);
      const copiedPages = await mergedPdf.copyPages(
        data,
        data.getPageIndices(),
      );

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }),
  );

  return mergedPdf.save();
}

module.exports = async (body = []) => {
  try {
    const buffers = await Promise.all(
      body.map(createBufferFromDocumentDefinitions),
    );

    return buffers.length > 1
      ? merge(buffers)
      : first(buffers);
  } catch (e) {
    return null;
  }
};
