const { get } = require('lodash');
const CSV = require('./toCsv');
const Excel = require('./toExcel');

module.exports = class Q3Export {
  constructor(strategyName) {
    this.$__fn = get(
      {
        csv: CSV,
        xlsx: Excel,
      },
      strategyName,
    );
  }

  toBuffer(data) {
    if (!this.$__fn)
      throw new Error(
        'You must specify an export strategy',
      );

    return this.$__fn(data);
  }
};
