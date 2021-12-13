/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');

class Email extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, 'Email');
  }

  cast(val = '') {
    if (!val.length) return val;
    const output = val.toLowerCase().trim();

    if (
      !new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(output)
    )
      throw new Error(`Email: ${val} is not a valid email`);

    return output;
  }

  castForQuery(val = '') {
    return val;
  }
}

mongoose.Schema.Types.Email = Email;
