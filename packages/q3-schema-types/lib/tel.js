const mongoose = require('mongoose');

function Tel(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

Tel.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Tel.prototype.cast = function sanitize(val = '') {
  if (!val.length) return val;
  const cleaned = `${val}`.replace(/\W|\D|\s/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (!match)
    throw new Error(
      `Tel: ${val} is not a valid North American phone number`,
    );

  return `(${match[1]}) ${match[2]}-${match[3]}`;
};

Tel.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Tel = Tel;
