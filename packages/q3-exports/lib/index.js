const { get } = require('lodash');
const CSV = require('./toCsv');
const Excel = require('./toExcel');
const Pdf = require('./toPdf');

module.exports = class Q3Export {
  constructor(strategyName) {
    this.$__fn = get(
      {
        csv: CSV,
        xlsx: Excel,
        pdf: Pdf,
      },
      strategyName,
    );
  }

  toBuffer(data) {
    if (!this.$__fn)
      throw new Error(
        'You must specify an export strategy',
      );

    if (!Array.isArray(data))
      throw new Error('Data must be an array');

    return this.$__fn(data);
  }
};
