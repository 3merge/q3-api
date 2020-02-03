const mongoose = require('mongoose');

function Tel(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

Tel.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Tel.prototype.cast = function sanitize(val = '') {
  if (!val.length) return val;

  const [num, ext] = val.split('x');
  const cleaned = `${num}`.replace(/\W|\D|\s/g, '');
  const match = cleaned.match(
    /^([+]?\d{1,2}[.-\s]?)?(\d{3})(\d{3})(\d{4})$/,
  );

  if (!match)
    throw new Error(
      `Tel: ${val} is not a valid North American phone number`,
    );

  const [
    ,
    countryCode,
    areaCode,
    officeCode,
    stationCode,
  ] = match;

  let formatted = '';
  if (countryCode) formatted += `+${countryCode} `;
  if (areaCode) formatted += `(${areaCode}) `;
  if (officeCode) formatted += `${officeCode}-`;
  if (stationCode) formatted += `${stationCode}`;
  if (ext) formatted += ` x${ext}`;

  return formatted;
};

Tel.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Tel = Tel;
