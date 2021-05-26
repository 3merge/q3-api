const mongoose = require('mongoose');

function Url(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

Url.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Url.prototype.cast = function sanitize(val = '') {
  if (!val.length) return val;

  if (
    !new RegExp(
      /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gim,
    ).test(val)
  )
    throw new Error(`Url: ${val} is not a valid website`);

  return val;
};

Url.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Url = Url;
