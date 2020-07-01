const ExcelJS = require('exceljs');
const { first } = require('lodash');

module.exports = (body) => {
  const header = Object.keys(first(body));
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet();

  ws.columns = header.map((head) => ({
    header: head.toUpperCase(),
    key: head,
    width: 35,
  }));

  body.forEach((r) => {
    ws.addRow(r);
  });

  Object.assign(ws.getRow(1), {
    alignment: {
      vertical: 'middle',
    },
    border: {
      bottom: { style: 'thin' },
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C7C7C7' },
    },
    font: { bold: true },
  });

  ws.properties.defaultRowHeight = 18;
  return wb.xlsx.writeBuffer();
};
