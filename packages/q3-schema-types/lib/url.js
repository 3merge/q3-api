/* eslint-disable class-methods-use-this */
const mongoose = require('mongoose');

class Url extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, 'Url');
  }

  cast(val = '') {
    if (!val.length) return val;

    if (
      !new RegExp(
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gim,
      ).test(val)
    )
      throw new Error(`Url: ${val} is not a valid website`);

    return val;
  }

  castForQuery(val = '') {
    return val;
  }
}

mongoose.Schema.Types.Url = Url;
