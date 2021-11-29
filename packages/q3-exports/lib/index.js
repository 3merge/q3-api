const { get } = require('lodash');
const CSV = require('./toCsv');
const Excel = require('./toExcel');
const Html = require('./toHtml');
const Pdf = require('./toPdf');
const Text = require('./toText');

module.exports = class Q3Export {
  constructor(strategyName, options = {}) {
    this.__$docOpts = options;
    this.$__fn = get(
      {
        csv: CSV,
        xlsx: Excel,
        pdf: Pdf,
        txt: Text,
        html: Html,
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

    return this.$__fn(data, this.__$docOpts);
  }
};
