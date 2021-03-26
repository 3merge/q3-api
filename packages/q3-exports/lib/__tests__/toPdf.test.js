const { PDFDocument } = require('pdf-lib');
const {
  __$utils: { merge },
} = require('../toPdf');

const makeArray = () =>
  Array.from({ length: 99 }).map((xs, i) => i);

test('merge should preserve order', async () => {
  jest
    .spyOn(PDFDocument, 'create')
    .mockImplementation(() => {
      const data = [];

      return {
        addPage: jest
          .fn()
          .mockImplementation((a) => data.push(a)),
        copyPages: jest
          .fn()
          .mockImplementation((a, b) => b),
        save: jest.fn().mockReturnValue(data),
      };
    });

  jest.spyOn(PDFDocument, 'load').mockImplementation(
    (v) =>
      new Promise(
        (resolves) =>
          setTimeout(() =>
            resolves({
              getPageIndices: jest.fn().mockReturnValue(v),
            }),
          ),
        Math.floor(Math.random() * Math.floor(1000)),
      ),
  );

  const stub = makeArray();
  return expect(merge(stub)).resolves.toEqual(stub);
});
