const mongoose = require('mongoose');

function Tel(key, options) {
  mongoose.SchemaTypes.String.call(this, key, options);
}

function printTel(parts, ext) {
  if (!parts)
    throw new Error(
      'Value is not a valid North American phone number',
    );

  const [
    ,
    countryCode,
    areaCode,
    officeCode,
    stationCode,
  ] = parts;

  let formatted = '';

  if (countryCode) formatted += `+${countryCode} `;
  if (areaCode) formatted += `(${areaCode}) `;
  if (officeCode) formatted += `${officeCode}-`;
  if (stationCode) formatted += `${stationCode}`;
  if (ext) formatted += ` x${ext}`;
  return formatted;
}

function validateTel(num) {
  const cleaned = `${num}`.replace(/\W|\D|\s/g, '');
  return cleaned.match(
    /^([+]?\d{1,2}[.-\s]?)?(\d{3})(\d{3})(\d{4})$/,
  );
}

Tel.prototype = Object.create(
  mongoose.SchemaType.prototype,
);

Tel.prototype.cast = function sanitize(val = '') {
  if (!val.length) return val;
  const [num, ext] = val.split('x');
  return printTel(validateTel(num), ext);
};

Tel.prototype.castForQuery = function forward(val = '') {
  return val;
};

mongoose.Schema.Types.Tel = Tel;
