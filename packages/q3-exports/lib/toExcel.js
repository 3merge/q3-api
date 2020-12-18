const ExcelJS = require('exceljs');
const { compose } = require('lodash/fp');
const { first } = require('lodash');

const getHeader = compose(Object.keys, first);

const sharedStyles = {
  alignment: {
    vertical: 'middle',
  },
  border: {
    bottom: { style: 'thin' },
  },
};

const makeFill = (argb) => ({
  fill: {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb },
  },
});

const makeFont = (args = {}) => ({
  font: {
    bold: true,
    ...args,
  },
});

const mapColumns = (a) =>
  a.map((column) => ({
    header: column.toUpperCase(),
    key: column,
    width: 35,
  }));

const makeTitle = (ws, title) => {
  ws.mergeCells('A1', 'Z1');
  return Object.assign(ws.getRow(1), {
    ...makeFill('D7D7D7'),
    ...makeFont({ size: 14 }),
    ...sharedStyles,
    values: [title],
    height: 36,
  });
};

const getStartingRow = (ws, title) => {
  if (title) {
    makeTitle(ws, title);
    return 2;
  }

  return 1;
};

const toExcel = (body, opts = {}) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet();
  const row = getStartingRow(ws, opts.title);
  const values = getHeader(body);
  const columns = mapColumns(values);

  ws.columns = columns;

  Object.assign(ws.getRow(row), {
    ...makeFill('C7C7C7'),
    ...makeFont(),
    ...sharedStyles,
    values,
  });

  body.forEach((r) => {
    ws.addRow(r);
  });

  ws.properties.defaultRowHeight = 18;
  return wb.xlsx.writeBuffer();
};

toExcel.getHeader = getHeader;
toExcel.mapColumns = mapColumns;
toExcel.makeTitle = makeTitle;

module.exports = toExcel;
