const mongoose = require('mongoose');

function Email(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

Email.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Email.prototype.cast = function sanitize(val = '') {
  if (!val.length) return val;
  const output = val.toLowerCase().trim();

  if (
    !new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(output)
  )
    throw new Error(`Email: ${val} is not a valid email`);

  return output;
};

Email.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Email = Email;
