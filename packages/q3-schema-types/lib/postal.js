/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');

class Postal extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, 'Postal');
  }

  cast(val = '') {
    if (!val.length) return val;
    const output = val.toUpperCase().replace(/\s+/g, '');

    if (
      !new RegExp(
        /^[0-9]{5}$|^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/,
      ).test(output)
    )
      throw new Error(
        `Postal: ${val} is not a valid postal code`,
      );

    return output;
  }

  castForQuery(val = '') {
    return val;
  }
}

mongoose.Schema.Types.Postal = Postal;
