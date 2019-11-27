const mongoose = require('mongoose');

function Postal(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

Postal.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Postal.prototype.cast = function sanitize(val = '') {
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
};

Postal.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Postal = Postal;
